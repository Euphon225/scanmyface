// run3DDFA_mesh.js — Calcul des sliders FC26 depuis pose 3DDFA + landmarks MediaPipe
//
// Approche (c) : pas de reconstruction de mesh BFM (u_base/w_shp trop lourd).
// - 3DDFA fournit la pose précise (yaw/pitch/roll + matrice R)
// - MediaPipe fournit 478 landmarks 3D dans le repère image
// - On de-rotate les landmarks MP via R^T → vue frontale canonique
// - On mesure profondeurs Z relatives + angles 2D
// - On mappe vers les sliders _arriere_avant et _arrondi_angulaire (50 = neutre)
//
// Couverture : ~20 sliders les plus discriminants. Les clés non couvertes restent
// en preset(50) via scanToSliders_v6.js (qui doit fallback si la clé est absente).
//
// API:
//   computeFC26from3DDFA(tddfaResult, mpLandmarks)
//   → { z_sliders: {key: 0-100}, angle_sliders: {key: 0-100}, volume_sliders: {} }

(function () {
  'use strict';

  // -------- MediaPipe FaceMesh landmark indices (478 avec iris refinement) --------
  const MP = {
    forehead_top:    10,
    forehead_mid:    151,
    glabella:        9,
    nose_root:       6,
    nose_bridge:     197,
    nose_tip:        4,
    nose_under:      2,
    nose_nostrils_l: 358,
    nose_nostrils_r: 129,
    philtrum:        164,
    lips_top:        13,
    lips_bottom:     14,
    levre_sup_cotes_sup_l: 37,
    levre_sup_cotes_sup_r: 267,
    levre_sup_cotes_inf_l: 38,
    levre_sup_cotes_inf_r: 268,
    levre_inf_cotes_sup_l: 84,
    levre_inf_cotes_sup_r: 314,
    levre_inf_cotes_inf_l: 87,
    levre_inf_cotes_inf_r: 317,
    chin_top:        199,
    chin_bottom:     152,
    cheekbone_l:     234,
    cheekbone_r:     454,
    cheek_l:         50,
    cheek_r:         280,
    temple_l:        21,
    temple_r:        251,
    jaw_angle_l:     172,
    jaw_angle_r:     397,
    eye_outer_l:     33,
    eye_outer_r:     263,
    eye_inner_l:     133,
    eye_inner_r:     362,
    brow_inner_l:    55,
    brow_inner_r:    285,
    brow_outer_l:    46,
    brow_outer_r:    276,
    mouth_corner_l:  61,
    mouth_corner_r:  291,
    // ajouts arrondi sourcils + yeux
    brow_peak_l:     105,
    brow_peak_r:     334,
    eye_top_l:       159,
    eye_bot_l:       145,
    eye_top_r:       386,
    eye_bot_r:       374,
  };

  // -------- Helpers --------

  // R^T * pt — applique l'inverse rotation (R est orthogonal donc R^-1 = R^T)
  function deRotate(pt, R) {
    return {
      x: R[0][0] * pt.x + R[1][0] * pt.y + R[2][0] * pt.z,
      y: R[0][1] * pt.x + R[1][1] * pt.y + R[2][1] * pt.z,
      z: R[0][2] * pt.x + R[1][2] * pt.y + R[2][2] * pt.z,
    };
  }

  // Mappe une valeur centrée 0 (avec scale) vers slider 0-100 (50 = neutre)
  function toSlider(value, scale) {
    const norm = value / scale;
    const clamped = Math.max(-1, Math.min(1, norm));
    return Math.round(50 + clamped * 50);
  }

  // Angle (degrés) ABC : angle au sommet B entre les vecteurs BA et BC (2D, plan XY)
  function angleAt2D(A, B, C) {
    const v1x = A.x - B.x, v1y = A.y - B.y;
    const v2x = C.x - B.x, v2y = C.y - B.y;
    const n1 = Math.hypot(v1x, v1y);
    const n2 = Math.hypot(v2x, v2y);
    if (n1 === 0 || n2 === 0) return 180;
    const cos = (v1x * v2x + v1y * v2y) / (n1 * n2);
    return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
  }

  // Distance 2D (plan XY) entre deux points dé-rotés
  function dist2D(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  // -------- Main --------

  function computeFC26from3DDFA(tddfaResult, mpLandmarks) {
    if (!tddfaResult || !tddfaResult.pose || !tddfaResult.pose.R) {
      return { z_sliders: {}, angle_sliders: {}, volume_sliders: {} };
    }
    if (!mpLandmarks || mpLandmarks.length < 478) {
      console.warn('[3DDFA_mesh] MediaPipe landmarks manquants ou incomplets (', mpLandmarks?.length, ')');
      return { z_sliders: {}, angle_sliders: {}, volume_sliders: {} };
    }

    const R = tddfaResult.pose.R;

    // De-rotate les landmarks d'intérêt
    const pts = {};
    for (const [name, idx] of Object.entries(MP)) {
      const lm = mpLandmarks[idx];
      if (!lm) continue;
      pts[name] = deRotate(lm, R);
    }

    // Centre de référence : milieu inter-oculaire
    const center = {
      x: (pts.eye_outer_l.x + pts.eye_outer_r.x) / 2,
      y: (pts.eye_outer_l.y + pts.eye_outer_r.y) / 2,
      z: (pts.eye_outer_l.z + pts.eye_outer_r.z) / 2,
    };

    // Echelle visage (largeur entre pommettes) pour normaliser les profondeurs
    const faceWidth = Math.abs(pts.cheekbone_r.x - pts.cheekbone_l.x);
    const faceDepth = faceWidth * 0.85;  // approx BFM : depth ≈ 0.9 * width
    if (faceDepth < 1e-6) {
      return { z_sliders: {}, angle_sliders: {}, volume_sliders: {} };
    }

    // Convention MediaPipe : Z négatif = plus proche caméra = "vers l'avant"
    // → forwardness = -(pt.z - center.z) / faceDepth, positif = avant
    const fwd = (pt) => -(pt.z - center.z) / faceDepth;

    const mean = (...vals) => vals.reduce((a, b) => a + b, 0) / vals.length;

    // -------- Z sliders (_arriere_avant) --------
    // scale ~0.3-0.4 : un déplacement de 30-40% de la profondeur visage = extrême slider
    // L'offset (premier argument de fwd - X) correspond à la position attendue d'un visage neutre
    const z_sliders = {
      // Crâne / front : doivent être ~aligné avec le centre (offset 0)
      crane_arriere_avant:              toSlider(fwd(pts.forehead_top),                  0.4),
      crane_couronne_arriere_avant:     toSlider(fwd(pts.forehead_top) - 0.05,           0.4),
      crane_arriere_arriere_avant:      toSlider(fwd(pts.forehead_top) - 0.10,           0.4),
      tempes_arriere_avant:             toSlider(mean(fwd(pts.temple_l), fwd(pts.temple_r)) + 0.25, 0.3),
      front_sup_arriere_avant:          toSlider(fwd(pts.forehead_mid),                  0.3),
      front_inf_arriere_avant:          toSlider(fwd(pts.glabella),                      0.3),

      // Sourcils
      sourcils_arriere_avant:           toSlider(mean(fwd(pts.brow_inner_l), fwd(pts.brow_inner_r), fwd(pts.brow_outer_l), fwd(pts.brow_outer_r)), 0.25),
      sourcils_central_arriere_avant:   toSlider(mean(fwd(pts.brow_inner_l), fwd(pts.brow_inner_r)), 0.25),
      sourcils_ext_sup_arriere_avant:   toSlider(mean(fwd(pts.brow_outer_l), fwd(pts.brow_outer_r)), 0.25),

      // Yeux / orbites
      yeux_arriere_avant:               toSlider(mean(fwd(pts.eye_inner_l), fwd(pts.eye_inner_r)), 0.20),
      orbites_arriere_avant:            toSlider(mean(fwd(pts.eye_outer_l), fwd(pts.eye_outer_r)), 0.20),

      // Nez (le nez EST naturellement en avant → on retranche l'offset attendu ~0.3)
      nez_arriere_avant:                toSlider(fwd(pts.nose_tip)    - 0.30, 0.30),
      arete_nez_centrale_arriere_avant: toSlider(fwd(pts.nose_bridge) - 0.15, 0.25),
      arete_nez_sup_arriere_avant:      toSlider(fwd(pts.nose_root)   - 0.20, 0.20),

      // Joues / bouche
      joues_arriere_avant:              toSlider(mean(fwd(pts.cheekbone_l), fwd(pts.cheekbone_r)) + 0.35, 0.30),
      bouche_arriere_avant:             toSlider(mean(fwd(pts.lips_top), fwd(pts.lips_bottom))   - 0.20, 0.25),

      // Menton
      menton_arriere_avant:             toSlider(fwd(pts.chin_bottom), 0.40),
      menton_sup_arriere_avant:         toSlider(fwd(pts.chin_top),    0.40),

      // Mâchoire
      machoire_arriere_avant:           toSlider(mean(fwd(pts.jaw_angle_l), fwd(pts.jaw_angle_r)) + 0.20, 0.40),
      mandibule_arriere_avant:          toSlider(mean(fwd(pts.jaw_angle_l), fwd(pts.jaw_angle_r)) + 0.20, 0.40),

      // Commissures
      commissures_levres_arriere_avant:   toSlider(mean(fwd(pts.mouth_corner_l), fwd(pts.mouth_corner_r)) - 0.10, 0.25),

      // Lèvres (Chair)
      epaisseur_levre_sup_arriere_avant:  toSlider(fwd(pts.lips_top)    - 0.15, 0.25),
      epaisseur_levre_inf_arriere_avant:  toSlider(fwd(pts.lips_bottom) - 0.10, 0.25),
      levre_sup_centre_sup_arriere_avant: toSlider(fwd(pts.lips_top)    - 0.15, 0.25),
      levre_sup_centre_inf_arriere_avant: toSlider(fwd(pts.lips_top)    - 0.10, 0.25),
      levre_inf_centre_sup_arriere_avant: toSlider(fwd(pts.lips_bottom) - 0.10, 0.25),
      levre_inf_centre_inf_arriere_avant: toSlider(fwd(pts.lips_bottom) - 0.05, 0.25),
      philtrum_arriere_avant:             toSlider(fwd(pts.philtrum)    - 0.15, 0.25),

      // Lèvres côtés / coins
      levre_sup_cotes_sup_arriere_avant:  toSlider(mean(fwd(pts.levre_sup_cotes_sup_l), fwd(pts.levre_sup_cotes_sup_r)) - 0.15, 0.25),
      levre_sup_coins_sup_arriere_avant:  toSlider(mean(fwd(pts.mouth_corner_l), fwd(pts.mouth_corner_r)) - 0.10, 0.25),
      levre_sup_cotes_inf_arriere_avant:  toSlider(mean(fwd(pts.levre_sup_cotes_inf_l), fwd(pts.levre_sup_cotes_inf_r)) - 0.10, 0.25),
      levre_inf_cotes_sup_arriere_avant:  toSlider(mean(fwd(pts.levre_inf_cotes_sup_l), fwd(pts.levre_inf_cotes_sup_r)) - 0.08, 0.25),
      levre_inf_cotes_inf_arriere_avant:  toSlider(mean(fwd(pts.levre_inf_cotes_inf_l), fwd(pts.levre_inf_cotes_inf_r)) - 0.05, 0.25),
      levre_inf_coins_inf_arriere_avant:  toSlider(mean(fwd(pts.mouth_corner_l), fwd(pts.mouth_corner_r)) - 0.05, 0.25),
    };

    // -------- Angle sliders (_arrondi_angulaire) --------
    // Convention FC26 supposée : 0 = très angulaire, 100 = très arrondi.
    // Plus l'angle est ouvert (~180°), plus la région est "arrondie".
    // Calibrations empiriques (à ajuster avec data réelle).
    const jawAngleL = angleAt2D(pts.cheekbone_l, pts.jaw_angle_l, pts.chin_bottom);
    const jawAngleR = angleAt2D(pts.cheekbone_r, pts.jaw_angle_r, pts.chin_bottom);
    const jawAngle = (jawAngleL + jawAngleR) / 2;

    const chinAngle    = angleAt2D(pts.jaw_angle_l, pts.chin_bottom, pts.jaw_angle_r);
    const foreheadArc  = angleAt2D(pts.temple_l, pts.forehead_top, pts.temple_r);
    const cheekArcL    = angleAt2D(pts.cheekbone_l, pts.cheek_l, pts.jaw_angle_l);
    const cheekArcR    = angleAt2D(pts.cheekbone_r, pts.cheek_r, pts.jaw_angle_r);
    const cheekArc     = (cheekArcL + cheekArcR) / 2;

    // Sourcils : angle à l'apex (arc) — courbure de contour 2D
    const browArcL = angleAt2D(pts.brow_inner_l, pts.brow_peak_l, pts.brow_outer_l);
    const browArcR = angleAt2D(pts.brow_inner_r, pts.brow_peak_r, pts.brow_outer_r);
    const browArc  = (browArcL + browArcR) / 2;
    // Yeux : ouverture verticale / largeur (rond vs amande)
    const eyeRatioL = dist2D(pts.eye_top_l, pts.eye_bot_l) / (dist2D(pts.eye_outer_l, pts.eye_inner_l) || 1e-6);
    const eyeRatioR = dist2D(pts.eye_top_r, pts.eye_bot_r) / (dist2D(pts.eye_outer_r, pts.eye_inner_r) || 1e-6);
    const eyeRatio  = (eyeRatioL + eyeRatioR) / 2;

    // (angle - centre) / amplitude → [-1, 1] → slider 0-100
    const angle_sliders = {
      machoire_arrondi_angulaire:   toSlider((jawAngle    - 140) / 30, 1),  // 110°-170° → 0-100
      mandibule_arrondi_angulaire:  toSlider((jawAngle    - 140) / 30, 1),
      menton_arrondi_angulaire:     toSlider((chinAngle   - 110) / 40, 1),  // 70°-150°
      front_sup_arrondi_angulaire:  toSlider((foreheadArc - 120) / 35, 1),  // 85°-155°
      crane_arrondi_angulaire:      toSlider((foreheadArc - 120) / 35, 1),
      joues_arrondi_angulaire:      toSlider((cheekArc    - 120) / 35, 1),
      nez_arrondi_angulaire:        toSlider((angleAt2D(pts.nose_nostrils_l ?? pts.cheek_l, pts.nose_tip, pts.nose_nostrils_r ?? pts.cheek_r) - 100) / 40, 1),
      sourcils_arrondi_angulaire:   toSlider((browArc  - 161)  / 12,   1),  // PROVISOIRE - calibrer via _debug
      yeux_arrondi_angulaire:       toSlider((eyeRatio - 0.40) / 0.12, 1),  // PROVISOIRE - calibrer via _debug
    };

    // -------- Volume sliders (_moins_plus graisse) --------
    // Approche (c) ne peut pas mesurer l'épaisseur de graisse de façon fiable
    // (nécessiterait un mesh BFM lean vs un mesh observé). Laissé vide → fallback preset(50).
    const volume_sliders = {};

    return {
      z_sliders,
      angle_sliders,
      volume_sliders,
      _debug: { jawAngle, chinAngle, foreheadArc, cheekArc, browArc, eyeRatio, faceWidth, faceDepth },
    };
  }

  window.computeFC26from3DDFA = computeFC26from3DDFA;
})();
