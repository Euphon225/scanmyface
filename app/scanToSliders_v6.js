/**
 * ScanMyFace — scanToSliders_v6.js
 * ============================================================
 * Convertit les landmarks MediaPipe Face Landmarker (478 points)
 * en valeurs de sliders FC26 (0-100).
 *
 * V6 — Calibration finale (mai 2026) + plages recalibrées (mai 2026)
 * Corrections majeures vs V1 :
 *   - Plages min/max recalibrées sur Ronaldo, Dwayne, Zlatan,
 *     Neymar, LeBron, Musk, Kim K, Ariana, Obama, Adele
 *   - Tous les sliders axe Z (arriere_avant, _zdev) → preset(50)
 *     car coordonnées Z brutes non fiables sans matrice canonique
 *   - Bug tempes_reduire_elargir corrigé (mauvais landmarks)
 *
 * Usage :
 *   const result = scanToSliders(landmarks);
 *   // result.squelette, result.chair, result.graisse
 *
 * Entrée :
 *   landmarks : Array[478] de { x, y, z } normalisés (0-1)
 *
 * Références de normalisation :
 *   D_W = d(234, 454) — largeur faciale zygomatique
 *   D_H = d(10, 152)  — hauteur crânio-mentonnière
 *   N() = normalisation Min-Max écrêtée 0-100
 * ============================================================
 */

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────

const _dist = (a, b) => Math.sqrt(
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
);

const _dist2D = (a, b) => Math.sqrt(
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2
);

const _mid = (a, b) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
  z: (a.z + b.z) / 2
});

/**
 * Normalisation Min-Max avec plages calibrées sur visages réels
 * Retourne un entier 0-100
 */
const _norm = (ratio, min, max) => {
  const clamped = Math.min(Math.max(ratio, min), max);
  return Math.round(((clamped - min) / (max - min)) * 100);
};

// Borne dure 0-100 + arrondi entier — utilisé pour les sliders calculés
// par déviation autour d'une ancre P9 (qui peuvent dépasser les bornes
// avec des morphologies extrêmes)
const softClampSlider = (v) => Math.round(Math.min(100, Math.max(0, v)));

const PRESET_NEUTRE = 50;

// Le VRAI selectBestPreset (carnation + 9 zones pondérées) vit dans presetMatch.js.
// On l'appelle via window.selectBestPreset(landmarks, skinTone).
// La DNA est lue via window.lookupPresetDNA(preset, flatKey).

// ─────────────────────────────────────────────
// PHASE 1 v2 — directScan (calibration empirique v7)
// ─────────────────────────────────────────────
// Kill switch : true → directScan écrase auto() ET preset() pour tous les
// sliders 2D mesurés en calibration v7. false → directScan revient à
// n'écraser QUE les preset() (comportement Phase 1 conservateur).
const DIRECTSCAN_OVERRIDE_AUTO = false;

// directScan(landmarks, key)
// Renvoie la valeur 0-100 calculée à partir de window.V7_SLIM (auto-généré
// par build_v7_slim.py) ou null si non calculable.
// Modèle linéaire x(s) = x0 + (s/100) · dx inversé et projeté en 2D :
//   midpoint_user = mid(L234,L454), D_W_user = dist2D(L234,L454)
//   pour chaque landmark top-K du slider :
//     p_user = (L.xy − midpoint_user) / D_W_user
//     q      = p_user − lm.p (déjà précalculé en p_v7 normalisé)
//     s      = 50 + 100 · (q · e) / (e · e)
//   moyenne pondérée par delta (lm.w) → softClamp 0-100.
function directScan(landmarks, key) {
  if (!window.V7_SLIM || !landmarks) return null;
  const entry = window.V7_SLIM[key];
  if (!entry || !entry.lms || !entry.lms.length) return null;

  const L234 = landmarks[234];
  const L454 = landmarks[454];
  if (!L234 || !L454) return null;

  const mx = (L234.x + L454.x) / 2;
  const my = (L234.y + L454.y) / 2;
  const dxw = L234.x - L454.x;
  const dyw = L234.y - L454.y;
  const Dw = Math.sqrt(dxw * dxw + dyw * dyw);
  if (Dw < 1e-6) return null;

  let wsum = 0;
  let ssum = 0;
  for (let i = 0; i < entry.lms.length; i++) {
    const lm = entry.lms[i];
    const node = landmarks[lm.id];
    if (!node) continue;

    const pux = (node.x - mx) / Dw;
    const puy = (node.y - my) / Dw;
    const qx  = pux - lm.px;
    const qy  = puy - lm.py;

    const dot_qe = qx * lm.ex + qy * lm.ey;
    const dot_ee = lm.ex * lm.ex + lm.ey * lm.ey;
    if (dot_ee < 1e-12) continue;

    const s = 50 + 100 * dot_qe / dot_ee;
    if (!Number.isFinite(s)) continue;

    wsum += lm.w;
    ssum += lm.w * s;
  }
  if (wsum <= 0) return null;
  const v = ssum / wsum;
  if (!Number.isFinite(v)) return null;
  return softClampSlider(v);
}

// ─────────────────────────────────────────────
// PHASE 3.1 — directScanRegressionChair(landmarks)
// ─────────────────────────────────────────────
// Calcule simultanément les 163 sliders Chair via régression multiple Ridge,
// pré-calculée au build par build_regression_chair.py et stockée dans
// window.V8_CHAIR (charged via index.html).
//
// Modèle :
//   d_obs_norm[i] = (landmark.axis - mid_user_axis) / D_W_user
//   delta[i]      = d_obs_norm[i] - V.ref_positions[i]
//   s_chair[j]    = 50 + 50 * sum_i(P[j, i] * delta[i])
//
// P_flat est stocké row-major : P_flat[j * n_obs + i] = P[j, i].
//
// Retourne { flat_key: value 0-100 } pour les sliders mesurables, ou null
// si V8_CHAIR absent / landmarks de référence (L234, L454) invalides.
// Les sliders non mesurables ne sont PAS dans la sortie → leur valeur
// d'origine est conservée par l'appelant.
function directScanRegressionChair(landmarks) {
  if (typeof window === 'undefined' || !window.V8_CHAIR || !landmarks) return null;
  const V = window.V8_CHAIR;
  const L234 = landmarks[234];
  const L454 = landmarks[454];
  if (!L234 || !L454) return null;

  const mx = (L234.x + L454.x) / 2;
  const my = (L234.y + L454.y) / 2;
  const dxw = L234.x - L454.x;
  const dyw = L234.y - L454.y;
  const Dw  = Math.sqrt(dxw * dxw + dyw * dyw);
  if (Dw < 1e-6) return null;

  // Cache lazy : set des sliders non mesurables (à skipper).
  let nonMesSet = V._nonMesSet;
  if (!nonMesSet) {
    nonMesSet = new Set(V.non_mesurable_sliders || []);
    V._nonMesSet = nonMesSet;
  }

  const n_obs    = V.observations.length;
  const n_slid   = V.slider_keys.length;
  const refs     = V.ref_positions;
  const P        = V.P_flat;
  const obs      = V.observations;

  // Pré-calcul du vecteur delta (n_obs)
  // PATCH GF3 — DÉSACTIVÉ — testé empiriquement et nuisible : la normalisation
  // par Dw_user est déjà invariante au cadrage. Voir CLAUDE.md session 8 juin
  // pour l'analyse complète.
  // const dwScale = V.meta.dw_baketime / Dw;
  const d = new Float64Array(n_obs);
  for (let i = 0; i < n_obs; i++) {
    const pair = obs[i];
    const lm_id = pair[0];
    const node = landmarks[lm_id];
    if (!node) {
      d[i] = 0; // delta=0 = neutre, ne perturbe pas la prédiction
      continue;
    }
    let norm;
    if (pair[1] === 'x') norm = (node.x - mx) / Dw;
    else                 norm = (node.y - my) / Dw;
    // d[i] = (norm * dwScale) - refs[i];  // ← variant GF3 (nuisible, voir CLAUDE.md 8 juin)
    d[i] = norm - refs[i];
  }

  const out = {};
  for (let j = 0; j < n_slid; j++) {
    const key = V.slider_keys[j];
    if (nonMesSet.has(key)) continue;
    let acc = 0;
    const offset = j * n_obs;
    for (let i = 0; i < n_obs; i++) {
      acc += P[offset + i] * d[i];
    }
    out[key] = softClampSlider(50 + 50 * acc);
  }
  return out;
}

// ─────────────────────────────────────────────
// FONCTION PRINCIPALE
// ─────────────────────────────────────────────

function scanToSliders(landmarks, tddfaResult = null, skinTone = 'Foncée', forcePresetId = null) {
  const L = landmarks;

  // ── Références de normalisation ──
  const D_W = _dist(L[234], L[454]); // Largeur faciale zygomatique
  const D_H = _dist(L[10],  L[152]); // Hauteur crânio-mentonnière

  // ── Garde-fou bouche ouverte ──
  const mouthOpen = _dist(L[13], L[14]) / D_H > 0.04;

  const results = {
    squelette: {},
    chair:     {},
    graisse:   {},
    _meta: {
      D_W, D_H, mouthOpen,
      autoCount: 0,
      presetCount: 0
    }
  };

  const S    = results.squelette;
  const C    = results.chair;
  const G    = results.graisse;
  const meta = results._meta;

  // ── Signaux de forme : calculés tôt pour permettre le matching bestPreset ──
  const faceRatio = D_H / D_W;                       // élancement (validé en jeu)
  const cheekW    = _dist(L[116], L[345]);           // largeur pommettes
  const jawW      = _dist(L[172], L[397]);           // largeur mâchoire
  const taper     = jawW / cheekW;                   // plénitude (élevé = plein)

  // Socle cohérent : le preset EA le plus proche de ce visage via le VRAI matching
  // (carnation + 9 zones pondérées sur scanned_stats). Sert de DNA de remplissage
  // pour les sliders Squelette non mesurés (≠ neutre 50).
  let bestPreset = null;
  let bestOfficial = null;
  let topPresetsArr = [];
  let officialTopPresetsArr = [];
  try {
    if (typeof selectBestPreset === 'function') {
      const res = selectBestPreset(landmarks, skinTone);
      bestPreset = res && res.bestPreset ? res.bestPreset : null;
      bestOfficial = res && res.bestOfficial ? res.bestOfficial : null;
      topPresetsArr = (res && res.scores ? res.scores : []).slice(0, 4).map(s => ({
        id: s.preset_id,
        position: s.position,
        forme: s.preset && s.preset.forme_visage,
        carnation: s.preset && s.preset.couleur_peau,
        score: s.score
      }));
      officialTopPresetsArr = (res && res.officialTopPresets) ? res.officialTopPresets : [];
      meta.zoneMix = (res && res.zoneMix) ? res.zoneMix : null;
    }
  } catch (e) { console.warn('[matching] échec, fallback neutre:', e); }
  // Override manuel : un clic sur une alternative impose un preset précis.
  // L'override pilote la DNA ET la tête de réf affichée : si l'user clique
  // une alternative officielle, on aligne bestOfficial sur ce choix aussi.
  if (forcePresetId && window.PRESETS_DB) {
    const forced = window.PRESETS_DB.find(p => p.preset_id === forcePresetId);
    if (forced) {
      bestPreset = forced;
      if (forced.entry_type !== 'celebrity') bestOfficial = forced;
    }
  }
  meta.bestPresetId        = bestPreset ? bestPreset.preset_id    : null;
  meta.bestPresetPosition  = bestPreset ? bestPreset.position     : null;
  meta.bestPresetForme     = bestPreset ? bestPreset.forme_visage : null;
  meta.bestPresetCarnation = bestPreset ? bestPreset.couleur_peau : null;
  meta.bestPresetDisplayName = bestPreset ? (bestPreset.display_name || null) : null;
  meta.bestPresetEntryType = bestPreset ? (bestPreset.entry_type || null) : null;
  meta.topPresets          = topPresetsArr;
  // Phase 2.3 : bestOfficial pour l'UI étape 3 (toujours un preset EA <1000)
  meta.bestOfficialId        = bestOfficial ? bestOfficial.preset_id    : null;
  meta.bestOfficialPosition  = bestOfficial ? bestOfficial.position     : null;
  meta.bestOfficialForme     = bestOfficial ? bestOfficial.forme_visage : null;
  meta.bestOfficialCarnation = bestOfficial ? bestOfficial.couleur_peau : null;
  meta.officialTopPresets    = officialTopPresetsArr;
  console.log('[bestPreset]', meta.bestPresetId, meta.bestPresetForme, meta.bestPresetCarnation,
              '| official:', meta.bestOfficialId);

  // Suivi des sources (auto / preset / z3ddfa / angle3ddfa / directScan)
  // utilisé par le post-process directScan pour décider quoi écraser.
  S._sources = {}; C._sources = {}; G._sources = {};
  const _mark = (obj, k, src) => { obj._sources[k] = src; };

  const auto   = (obj, k, v) => { obj[k] = v; meta.autoCount++; _mark(obj, k, 'auto'); };
  const preset = (obj, k, v) => {
    if (v === undefined) {
      // socle cohérent : Squelette → DNA du preset choisi (via lookupPresetDNA), sinon neutre
      if (obj === S && bestPreset && typeof lookupPresetDNA === 'function') {
        const dnaVal = lookupPresetDNA(bestPreset, k);
        v = Number.isFinite(dnaVal) ? dnaVal : PRESET_NEUTRE;
      } else {
        v = PRESET_NEUTRE; // Chair/Graisse : neutre (sauf 3 taper qui sont en auto())
      }
    }
    obj[k] = v; meta.presetCount++; _mark(obj, k, 'preset');
  };

  // 3DDFA overrides : si tddfaResult fournit la clé, on prend sa valeur (comptée comme auto), sinon preset(50)
  const _tZ = tddfaResult?.z_sliders || {};
  const _tA = tddfaResult?.angle_sliders || {};
  const presetZ = (obj, k) => {
    if (Number.isFinite(_tZ[k])) { obj[k] = _tZ[k]; meta.autoCount++; _mark(obj, k, 'z3ddfa'); }
    else { obj[k] = PRESET_NEUTRE; meta.presetCount++; _mark(obj, k, 'preset'); }
  };
  const presetA = (obj, k) => {
    if (Number.isFinite(_tA[k])) { obj[k] = _tA[k]; meta.autoCount++; _mark(obj, k, 'angle3ddfa'); }
    else { obj[k] = PRESET_NEUTRE; meta.presetCount++; _mark(obj, k, 'preset'); }
  };

  // ════════════════════════════════════════════
  // FAMILLE SQUELETTE
  // ════════════════════════════════════════════

  // ── TÊTE / CRÂNE ──
  // Largeur crânienne (pts temporaux latéraux)
  auto(S, 'crane_reduire_elargir',
    _norm(_dist(L[21], L[251]) / D_W, 0.45, 1.20));

  // Élancement du visage : signal partagé D_H / D_W
  // Un faceRatio élevé → visage long ; bas → visage rond.
  // Propagé aux 3 sliders de hauteur crânienne en gardant les ancres P9.
  // (faceRatio est calculé plus haut pour permettre selectBestPreset)
  // R_P9 = ratio D_H/D_W mesuré sur le Preset 9 (image 9.png) via re-scan console.
  // P9 a un visage large/court → la majorité des visages réels auront faceRatio > R_P9.
  const R_P9 = 1.070; // mesuré sur 9.png (était 1.30 estimé)
  const K    = 45;    // sensibilité (était 100, saturait à 100 sur visages longs type Musk)
  const delta = (faceRatio - R_P9) * K;
  const crane_bas_haut_val          = softClampSlider(69 + delta);
  const crane_arriere_bas_haut_val  = softClampSlider(75 + delta);
  // couronne PLUS sensible (×1.4) : visage long → crâne s'étire vers le sommet,
  // donc couronne haute. Inversion du facteur 0.5 initial qui plafonnait à 34.
  const crane_couronne_bas_haut_val = softClampSlider(14 + 1.4 * delta);
  auto(S, 'crane_bas_haut',          crane_bas_haut_val);
  auto(S, 'crane_arriere_bas_haut',  crane_arriere_bas_haut_val);
  auto(S, 'crane_couronne_bas_haut', crane_couronne_bas_haut_val);
  console.log('[scanToSliders] faceRatio=', faceRatio.toFixed(3),
    '| crane_bas_haut=', crane_bas_haut_val,
    '| crane_arriere_bas_haut=', crane_arriere_bas_haut_val,
    '| crane_couronne_bas_haut=', crane_couronne_bas_haut_val);

  // ── PLÉNITUDE / VOLUME (proxy 2D, en remplacement de volume_sliders 3DDFA vide) ──
  // Signal d'effilement : un visage plein garde une mâchoire large sous les pommettes,
  // un visage maigre s'effile. Pentes par slider calibrées sur 3 visages
  // (Cumberbatch 0.822 / P9 0.879 / Elon 0.953).
  // (cheekW, jawW, taper sont calculés plus haut pour permettre selectBestPreset)
  const TAPER_P9 = 0.879; // mesuré sur 9.png via re-scan console
  const dT = taper - TAPER_P9;

  // Sliders prédits par le taper (pente individuelle, ancre = valeur P9)
  auto(C, 'machoire_moins_plus', softClampSlider(39 + 730 * dT)); // jaw chair (dominant)
  auto(C, 'joues_moins_plus',    softClampSlider(29 + 670 * dT));
  auto(G, 'bajoue_moins_plus',   softClampSlider(50 + 720 * dT));

  // NON prédits par le taper (bascule verticale, non-monotones) → on les laisse en P9
  preset(G, 'machoire_moins_plus'); // ne suit pas le taper de façon fiable → P9
  preset(G, 'joues_sup_moins_plus');
  preset(G, 'joues_inf_moins_plus');
  preset(G, 'menton_moins_plus');      // impact nul confirmé
  preset(G, 'sous_menton_moins_plus'); // impact nul confirmé

  console.log('[volume] taper=', taper.toFixed(3),
    '| machoireC=', results.chair.machoire_moins_plus,
    '| jouesC=', results.chair.joues_moins_plus,
    '| bajoue=', results.graisse.bajoue_moins_plus);

  // Axe Z → preset (non fiable sans matrice canonique)
  presetZ(S, 'crane_arriere_avant');
  presetA(S, 'crane_arrondi_angulaire');
  preset(S, 'crane_deplacement_gd');

  // Couronne → preset (extrapolation non fiable)
  preset(S, 'crane_couronne_reduire_elargir');
  presetZ(S, 'crane_couronne_arriere_avant');
  preset(S, 'crane_couronne_neutre_arrondi');
  preset(S, 'crane_couronne_deplacement_gd');

  // Arrière du crâne → preset (aucun landmark MediaPipe derrière la tête)
  preset(S, 'crane_arriere_reduire_elargir');
  presetZ(S, 'crane_arriere_arriere_avant');
  preset(S, 'crane_arriere_arrondi_angulaire');
  preset(S, 'crane_arriere_deplacement_gd');

  // ── TEMPES ──
  // CORRIGÉ : utiliser largeur frontale-temporale (103,332) et non (234,454)
  // car (234,454) = D_W → ratio toujours = 1.0 → toujours saturé à 100
  auto(S, 'tempes_reduire_elargir',
    _norm(_dist(L[103], L[332]) / D_W, 0.45, 0.95));

  auto(S, 'tempes_bas_haut',
    100 - _norm((L[234].y + L[454].y) / 2, 0.18, 0.62));

  // Axe Z → preset
  presetZ(S, 'tempes_arriere_avant');
  preset(S, 'tempes_arrondi_angulaire');

  // ── FRONT ──
  // Largeur front supérieur
  auto(S, 'front_sup_reduire_elargir',
    _norm(_dist(L[54], L[284]) / D_W, 0.45, 0.90));

  // Hauteur front supérieur (Y(10) - Y(103))
  // CORRIGÉ : doc FC26 dit "Neutre/Haut" pour front sup (pas "Bas/Haut")
  auto(S, 'front_sup_neutre_haut',
    _norm(L[103].y - L[10].y, 0.001, 0.32));

  // Axe Z → preset
  presetZ(S, 'front_sup_arriere_avant');
  presetA(S, 'front_sup_arrondi_angulaire');
  preset(S, 'front_sup_deplacement_gd');

  // Largeur front inférieur
  // CORRIGÉ : min abaissé 0.45→0.25, max étendu 0.70→0.80
  auto(S, 'front_inf_reduire_elargir',
    _norm(_dist(L[107], L[336]) / D_W, 0.02, 0.80));

  // Hauteur front inférieur
  // CORRIGÉ : max étendu 0.10→0.25
  auto(S, 'front_inf_bas_haut',
    _norm(L[9].y - L[107].y, -0.05, 0.18));

  presetZ(S, 'front_inf_arriere_avant');
  preset(S, 'front_inf_arrondi_angulaire');

  // ── SOURCILS ──
  // Largeur sourcils extérieurs
  // CORRIGÉ : max étendu 0.65→0.90
  auto(S, 'sourcils_reduire_elargir',
    _norm(_dist(L[46], L[276]) / D_W, 0.38, 0.90));

  // Hauteur sourcils (distance du milieu sourcils au nasion)
  // CORRIGÉ : max étendu 0.40→0.65
  auto(S, 'sourcils_bas_haut',
    _norm(_dist(_mid(L[46], L[276]), L[8]) / D_H, 0.02, 0.30));

  presetZ(S, 'sourcils_arriere_avant');
  presetA(S, 'sourcils_arrondi_angulaire');

  // Sourcils centraux
  auto(S, 'sourcils_central_reduire_elargir',
    _norm(_dist(L[107], L[336]) / D_W, 0.02, 0.60));

  auto(S, 'sourcils_central_bas_haut',
    _norm(_dist(_mid(L[107], L[336]), L[8]) / D_H, 0.001, 0.13));

  presetZ(S, 'sourcils_central_arriere_avant');
  preset(S, 'sourcils_central_arrondi_angulaire');
  auto(S, 'sourcils_central_deplacement_gd',
    _norm(_mid(L[107], L[336]).x - 0.5, -0.08, 0.08));

  // Sourcils extérieurs supérieurs
  auto(S, 'sourcils_ext_sup_reduire_elargir',
    _norm(_dist(L[70], L[300]) / D_W, 0.40, 1.02));

  // CORRIGÉ : max étendu 0.42→0.65
  auto(S, 'sourcils_ext_sup_bas_haut',
    _norm(_dist(_mid(L[70], L[300]), L[8]) / D_H, 0.02, 0.40));

  presetZ(S, 'sourcils_ext_sup_arriere_avant');
  preset(S, 'sourcils_ext_sup_arrondi_angulaire');

  // ── YEUX / ORBITES ──
  // Écartement inter-oculaire
  // CORRIGÉ : max étendu 0.55→0.85
  auto(S, 'yeux_reduire_elargir',
    _norm(_dist(L[33], L[263]) / D_W, 0.30, 0.85));

  // Hauteur yeux par rapport au nasion
  // CORRIGÉ : max étendu 0.55→0.75
  auto(S, 'yeux_bas_haut',
    _norm(_dist(_mid(L[33], L[263]), L[8]) / D_H, 0.03, 0.75));

  presetZ(S, 'yeux_arriere_avant');
  preset(S, 'yeux_arrondi_angulaire');   // eyeRatio plat (0.29/0.29 testé) -> P9, forme oeil = profondeur/expression

  // Taille des orbites
  // CORRIGÉ : max étendu 0.62→0.82
  auto(S, 'orbites_reduire_elargir',
    _norm(_dist(L[226], L[446]) / D_W, 0.28, 0.95));

  auto(S, 'orbites_bas_haut',
    _norm(_dist(_mid(L[226], L[446]), L[8]) / D_H, 0.02, 0.72));

  presetZ(S, 'orbites_arriere_avant');

  // Taille iris (si disponible)
  if (L[468] && L[473]) {
    // CORRIGÉ : max étendu 0.08→0.14
    auto(S, 'orbites_plus_grande_petite',
      _norm(_dist(L[468], L[473]) / D_W, 0.28, 0.72));
  } else {
    preset(S, 'orbites_plus_grande_petite');
  }

  // ── NEZ ──
  // Largeur narines — bornes resserrées 0.24-0.36 (étendue mesurée 0.273→0.320 sur 6 visages,
  // ancien 0.14-0.42 compressait tout autour de 50)
  auto(S, 'nez_reduire_elargir',
    _norm(_dist(L[129], L[358]) / D_W, 0.24, 0.36));

  // Longueur nez (nasion → pointe)
  auto(S, 'nez_bas_haut',
    100 - _norm((L[2].y - L[8].y) / (L[152].y - L[8].y), 0.38, 0.54));

  presetZ(S, 'nez_arriere_avant');
  presetA(S, 'nez_arrondi_angulaire');  // 3DDFA actif : angle réel pointe du nez (rond vs pointu)

  // Déplacement latéral pointe du nez
  auto(S, 'nez_deplacement_gd',
    _norm(L[4].x - 0.5, -0.03, 0.03));

  // Arête côtés
  auto(S, 'arete_nez_cotes_reduire_elargir',
    _norm(_dist(L[217], L[437]) / D_W, 0.08, 0.30));

  auto(S, 'arete_nez_cotes_bas_haut',
    _norm((L[217].y + L[437].y) / 2, 0.28, 0.80));

  preset(S, 'arete_nez_cotes_arriere_avant');
  preset(S, 'arete_nez_cotes_arrondi_angulaire');

  // Arête centrale
  // CORRIGÉ : max étendu 0.22→0.40
  auto(S, 'arete_nez_centrale_reduire_elargir',
    _norm(_dist2D(L[193], L[417]) / D_W, 0.02, 0.40));

  auto(S, 'arete_nez_centrale_bas_haut',
    _norm(L[195].y, 0.28, 0.76));

  presetZ(S, 'arete_nez_centrale_arriere_avant');
  preset(S, 'arete_nez_centrale_arrondi_angulaire');
  auto(S, 'arete_nez_centrale_deplacement_gd',
    _norm(L[195].x - 0.5, -0.05, 0.05));

  // Arête supérieure
  auto(S, 'arete_nez_sup_reduire_elargir',
    _norm(_dist(L[193], L[417]) / D_W, 0.06, 0.28));

  // CORRIGÉ : max étendu 0.10→0.25
  auto(S, 'arete_nez_sup_bas_haut',
    _norm(_dist(L[8], L[193]) / D_H, 0.01, 0.22));

  presetZ(S, 'arete_nez_sup_arriere_avant');
  preset(S, 'arete_nez_sup_arrondi_angulaire');
  auto(S, 'arete_nez_sup_deplacement_gd',
    _norm(L[8].x - 0.5, -0.05, 0.05));

  // ── JOUES ──
  // CORRIGÉ : max étendu 0.80→0.97
  auto(S, 'joues_reduire_elargir',
    _norm(_dist(L[116], L[345]) / D_W, 0.45, 0.97));

  // CORRIGÉ : ajustement pour que ce slider soit valide
  auto(S, 'joues_bas_haut',
    100 - _norm((L[116].y + L[345].y) / 2, 0.38, 0.68));

  presetZ(S, 'joues_arriere_avant');
  presetA(S, 'joues_arrondi_angulaire');

  // ── BOUCHE ──
  // Bornes resserrées 0.28-0.46 (plage humaine réelle observée sur 5 visages)
  auto(S, 'bouche_reduire_elargir',
    _norm(_dist(L[61], L[291]) / D_W, 0.28, 0.46));

  // CORRIGÉ : ajout plage étendue
  auto(S, 'bouche_bas_haut',
    _norm(_dist(_mid(L[61], L[291]), L[4]) / D_H, 0.22, 0.55));

  presetZ(S, 'bouche_arriere_avant');
  preset(S, 'bouche_arrondi_angulaire');
  auto(S, 'bouche_deplacement_gd',
    _norm(_mid(L[61], L[291]).x - 0.5, -0.06, 0.06));

  auto(S, 'ext_bouche_sup_reduire_elargir',
    _norm(_dist(L[185], L[409]) / D_W, 0.18, 0.50));

  auto(S, 'ext_bouche_sup_bas_haut',
    _norm((L[185].y + L[409].y) / 2, 0.40, 0.92));

  preset(S, 'ext_bouche_sup_arriere_avant');
  preset(S, 'ext_bouche_sup_arrondi_angulaire');

  // ── MENTON ──
  // CORRIGÉ : max étendu 0.20→0.40
  auto(S, 'menton_reduire_elargir',
    _norm(_dist(L[149], L[378]) / D_W, 0.40, 0.51));  // FIX largeur horizontale (était 175/152 = hauteur)

  auto(S, 'menton_bas_haut',
    _norm(_dist(L[152], L[17]) / D_H, 0.10, 0.35));

  presetZ(S, 'menton_arriere_avant');
  presetA(S, 'menton_arrondi_angulaire');
  auto(S, 'menton_deplacement_gd',
    _norm(L[152].x - 0.5, -0.06, 0.06));

  auto(S, 'menton_sup_reduire_elargir',
    _norm(_dist(L[169], L[393]) / D_W, 0.04, 0.80));

  auto(S, 'menton_sup_bas_haut',
    _norm(_dist(L[17], L[200]) / D_H, 0.03, 0.20));

  presetZ(S, 'menton_sup_arriere_avant');
  preset(S, 'menton_sup_arrondi_angulaire');
  auto(S, 'menton_sup_deplacement_gd',
    _norm(L[200].x - 0.5, -0.06, 0.06));

  // ── MÂCHOIRE / MAXILLAIRE / MANDIBULE ──
  // CORRIGÉ : max étendu 0.78→0.97
  auto(S, 'machoire_reduire_elargir',
    _norm(_dist(L[172], L[397]) / D_W, 0.38, 0.97));

  // CORRIGÉ : plage ajustée
  auto(S, 'machoire_bas_haut',
    _norm(L[152].y - L[234].y, 0.18, 0.52));

  presetZ(S, 'machoire_arriere_avant');
  presetA(S, 'machoire_arrondi_angulaire');

  auto(S, 'maxillaire_reduire_elargir',
    _norm(_dist(L[101], L[330]) / D_W, 0.30, 0.72));

  auto(S, 'maxillaire_bas_haut',
    _norm((L[101].y + L[330].y) / 2, 0.28, 0.80));

  preset(S, 'maxillaire_arriere_avant');
  preset(S, 'maxillaire_arrondi_angulaire');

  // CORRIGÉ : max étendu 0.72→0.92
  auto(S, 'mandibule_reduire_elargir',
    _norm(_dist(L[132], L[361]) / D_W, 0.38, 1.10));

  // CORRIGÉ : max étendu 0.45→0.62
  auto(S, 'mandibule_bas_haut',
    _norm(_dist(L[132], L[152]) / D_H, 0.12, 0.90));

  presetZ(S, 'mandibule_arriere_avant');
  presetA(S, 'mandibule_arrondi_angulaire');

  // ════════════════════════════════════════════
  // FAMILLE CHAIR — Sliders fiables XY uniquement
  // ════════════════════════════════════════════

  // ── TEMPES Chair ──
  // Axe Z → preset
  preset(C, 'tempes_moins_plus');

  // ── SOURCILS Chair ──
  auto(C, 'sourcils_central_bas_haut',
    _norm(_dist(_mid(L[107], L[336]), L[8]) / D_H, 0.001, 0.60));

  preset(C, 'sourcils_central_moins_plus');

  auto(C, 'espace_sourcils_bas_haut',
    _norm(_dist(_mid(L[70], L[300]), L[9]) / D_H, 0.0, 0.65));

  preset(C, 'espace_sourcils_moins_plus');

  // ── PAUPIÈRES Chair ──
  // Ouverture paupière centrale → mappé sur reduire_elargir (axe FC26)
  auto(C, 'pli_paupieres_central_reduire_elargir',
    _norm(_dist(L[159], L[145]) / D_H, 0.015, 0.085));

  // Hauteur plis paupières (fiable en 2D)
  auto(C, 'pli_paupieres_central_bas_haut',
    _norm((L[159].y + L[145].y) / 2, 0.28, 0.58));

  preset(C, 'pli_paupieres_central_arriere_avant');
  preset(C, 'pli_paupieres_central_plus_petite');

  preset(C, 'pli_paupieres_ext_reduire_elargir');

  auto(C, 'pli_paupieres_ext_bas_haut',
    _norm((L[33].y + L[130].y) / 2, 0.28, 0.58));

  preset(C, 'pli_paupieres_ext_arriere_avant');
  preset(C, 'pli_paupieres_ext_plus_petite');

  preset(C, 'pli_paupieres_int_reduire_elargir');

  auto(C, 'pli_paupieres_int_bas_haut',
    _norm((L[133].y + L[173].y) / 2, 0.28, 0.58));

  preset(C, 'pli_paupieres_int_arriere_avant');
  preset(C, 'pli_paupieres_int_plus_petite');

  // Paupières inférieures
  preset(C, 'paupiere_inf_centrale_reduire_elargir');

  auto(C, 'paupiere_inf_centrale_bas_haut',
    100 - _norm(L[145].y, 0.32, 0.62));

  preset(C, 'paupiere_inf_centrale_plus_petite');

  preset(C, 'paupiere_inf_ext_reduire_elargir');

  auto(C, 'paupiere_inf_ext_bas_haut',
    100 - _norm((L[144].y + L[163].y) / 2, 0.32, 0.62));

  preset(C, 'paupiere_inf_ext_plus_petite');

  preset(C, 'paupiere_inf_int_reduire_elargir');

  auto(C, 'paupiere_inf_int_bas_haut',
    100 - _norm((L[153].y + L[154].y) / 2, 0.32, 0.62));

  preset(C, 'paupiere_inf_int_plus_petite');

  // Paupières supérieures
  // Ouverture paupière supérieure centrale → mappé sur reduire_elargir
  auto(C, 'paupiere_sup_centrale_reduire_elargir',
    _norm(_dist(L[159], L[145]) / D_H, 0.015, 0.085));

  auto(C, 'paupiere_sup_centrale_bas_haut',
    100 - _norm((L[159].y + L[160].y) / 2, 0.25, 0.55));

  preset(C, 'paupiere_sup_centrale_neutre_avant');
  preset(C, 'paupiere_sup_centrale_plus_petite');

  preset(C, 'paupiere_sup_ext_reduire_elargir');

  auto(C, 'paupiere_sup_ext_bas_haut',
    100 - _norm((L[160].y + L[161].y) / 2, 0.25, 0.55));

  preset(C, 'paupiere_sup_ext_plus_petite');

  preset(C, 'paupiere_sup_int_reduire_elargir');

  auto(C, 'paupiere_sup_int_bas_haut',
    100 - _norm((L[157].y + L[158].y) / 2, 0.25, 0.55));

  preset(C, 'paupiere_sup_int_plus_petite');

  // Coins de l'oeil
  preset(C, 'coin_oeil_ext_reduire_elargir');

  auto(C, 'coin_oeil_ext_bas_haut',
    100 - _norm((L[33].y + L[263].y) / 2, 0.28, 0.58));

  preset(C, 'coin_oeil_ext_plus_petite');

  // CORRIGÉ : max étendu pour coin_oeil_int
  auto(C, 'coin_oeil_int_reduire_elargir',
    _norm(_dist(L[133], L[362]) / D_W, 0.06, 0.35));

  auto(C, 'coin_oeil_int_bas_haut',
    100 - _norm((L[133].y + L[362].y) / 2, 0.28, 0.58));

  preset(C, 'coin_oeil_int_plus_petite');

  // ── NEZ Chair ──
  // CORRIGÉ : max étendu 0.25→0.45
  auto(C, 'narine_sup_reduire_elargir',
    _norm(_dist(L[48], L[278]) / D_W, 0.06, 0.45));

  auto(C, 'narine_sup_bas_haut',
    _norm((L[48].y + L[278].y) / 2, 0.42, 0.85));

  preset(C, 'narine_sup_arriere_avant');
  preset(C, 'narine_sup_arrondi_angulaire');

  auto(C, 'narine_sup_ext_reduire_elargir',
    _norm(_dist(L[129], L[358]) / D_W, 0.12, 0.48));

  auto(C, 'narine_sup_ext_bas_haut',
    _norm((L[129].y + L[358].y) / 2, 0.42, 0.85));

  preset(C, 'narine_sup_ext_arriere_avant');
  preset(C, 'narine_sup_ext_arrondi_angulaire');

  auto(C, 'narine_inf_reduire_elargir',
    _norm(_dist(L[166], L[393]) / D_W, 0.06, 0.28));

  auto(C, 'narine_inf_bas_haut',
    _norm((L[166].y + L[393].y) / 2, 0.38, 0.88));

  preset(C, 'narine_inf_arriere_avant');
  preset(C, 'narine_inf_arrondi_angulaire');

  // Narine supérieure centrale → entièrement preset (sous-zone interne, non observable)
  preset(C, 'narine_sup_centrale_reduire_elargir');
  preset(C, 'narine_sup_centrale_bas_haut');
  preset(C, 'narine_sup_centrale_arriere_avant');
  preset(C, 'narine_sup_centrale_arrondi_angulaire');

  // Extérieur de la narine (partie ext + centrale) → preset
  preset(C, 'ext_narine_ext_reduire_elargir');
  preset(C, 'ext_narine_ext_bas_haut');
  preset(C, 'ext_narine_ext_arriere_avant');
  preset(C, 'ext_narine_ext_arrondi_angulaire');

  preset(C, 'ext_narine_centrale_reduire_elargir');
  preset(C, 'ext_narine_centrale_bas_haut');
  preset(C, 'ext_narine_centrale_arriere_avant');
  preset(C, 'ext_narine_centrale_arrondi_angulaire');

  // Pointe du nez
  preset(C, 'pointe_nez_sup_reduire_elargir'); // signal plat en 2D (profondeur) → P9

  // CORRIGÉ : plage étendue pour pointe_nez_bas_haut
  auto(C, 'pointe_nez_sup_bas_haut',
    _norm(L[4].y, 0.35, 0.88));

  preset(C, 'pointe_nez_sup_arriere_avant');
  preset(C, 'pointe_nez_sup_arrondi_angulaire');
  auto(C, 'pointe_nez_sup_deplacement_gd',
    _norm(L[4].x - 0.5, -0.06, 0.06));

  // Pointe du nez : partie sous-jacente → entièrement preset
  preset(C, 'pointe_nez_sous_jacente_reduire_elargir');
  preset(C, 'pointe_nez_sous_jacente_bas_haut');
  preset(C, 'pointe_nez_sous_jacente_arriere_avant');
  preset(C, 'pointe_nez_sous_jacente_arrondi_angulaire');
  preset(C, 'pointe_nez_sous_jacente_deplacement_gd');

  preset(C, 'pointe_nez_inf_reduire_elargir'); // signal plat en 2D (profondeur) → P9

  auto(C, 'pointe_nez_inf_bas_haut',
    _norm((L[94].y + L[274].y) / 2, 0.38, 0.90));

  preset(C, 'pointe_nez_inf_arriere_avant');
  preset(C, 'pointe_nez_inf_arrondi_angulaire');
  preset(C, 'pointe_nez_inf_deplacement_gd');

  // Diagnostic largeurs nez (sliders calculés + ratios bruts avant _norm)
  // → comparer les ratios aux bornes des _norm() pour repérer la compression bas d'échelle
  console.log('[nez] nez_larg=', results.squelette.nez_reduire_elargir,
    '| pointe_sup=', results.chair.pointe_nez_sup_reduire_elargir,
    '| pointe_inf=', results.chair.pointe_nez_inf_reduire_elargir,
    '| arete_cotes=', results.squelette.arete_nez_cotes_reduire_elargir,
    '| narine_sup=', results.chair.narine_sup_reduire_elargir,
    '| narine_inf=', results.chair.narine_inf_reduire_elargir);
  console.log('[nez ratios] pointeSup=', (_dist(L[4], L[19]) / D_W).toFixed(3),
    '| pointeInf=', (_dist(L[94], L[274]) / D_W).toFixed(3),
    '| narines=', (_dist(L[129], L[358]) / D_W).toFixed(3));

  // ── JOUES Chair ──
  auto(C, 'joues_bas_haut',
    100 - _norm((L[116].y + L[345].y) / 2, 0.38, 0.68));

  // Zdev → preset pour V1
  // joues_moins_plus : set par le bloc PLÉNITUDE / VOLUME (haut de fonction)
  preset(C, 'joues_ext_sup_moins_plus');
  preset(C, 'joues_yeux_int_sup_bas_haut');  // doc: "[Yeux:partie interne supérieure]" sous Joues
  preset(C, 'joues_yeux_int_sup_moins_plus');
  preset(C, 'joues_int_sup_moins_plus');     // doc: "[Joues:partie interne supérieure]" → 14
  preset(C, 'joues_int_inf_neutre_moins');   // CORRIGÉ : doc dit Neutre/Moins, pas Moins/Plus
  preset(C, 'joues_ext_inf_neutre_moins');

  // ── BOUCHE Chair ──
  auto(C, 'commissures_levres_reduire_elargir',
    _norm(_dist(L[61], L[291]) / D_W, 0.22, 0.55));

  auto(C, 'commissures_levres_bas_haut',
    _norm((L[61].y + L[291].y) / 2, 0.42, 0.86));

  presetZ(C, 'commissures_levres_arriere_avant');
  preset(C, 'commissures_levres_arrondi_angulaire');

  // Espacement lèvres — avec garde-fou bouche ouverte
  // CORRIGÉ : plage resserrée + renommage axes complets (doc FC26: reduire_elargir, bas_haut, arriere_avant, arrondi_angulaire)
  preset(C, 'espacement_levres_centre_reduire_elargir');
  if (!mouthOpen) {
    auto(C, 'espacement_levres_centre_bas_haut',
      _norm(_dist(L[13], L[14]) / D_H, 0.0, 0.035));
    auto(C, 'espacement_levres_cotes_reduire_elargir',
      _norm(_dist(L[78], L[308]) / D_W, 0.18, 0.52));
  } else {
    preset(C, 'espacement_levres_centre_bas_haut');
    preset(C, 'espacement_levres_cotes_reduire_elargir');
  }
  preset(C, 'espacement_levres_centre_arriere_avant');
  preset(C, 'espacement_levres_centre_arrondi_angulaire');
  preset(C, 'espacement_levres_cotes_bas_haut');
  preset(C, 'espacement_levres_cotes_arriere_avant');
  preset(C, 'espacement_levres_cotes_arrondi_angulaire');

  // Lèvre supérieure : centre sup
  preset(C, 'levre_sup_centre_sup_reduire_elargir');
  // CORRIGÉ : plage étendue pour les positions Y
  auto(C, 'levre_sup_centre_sup_bas_haut',
    100 - _norm(L[0].y, 0.42, 0.85));
  presetZ(C, 'levre_sup_centre_sup_arriere_avant');
  preset(C, 'levre_sup_centre_sup_arrondi_angulaire');
  preset(C, 'levre_sup_centre_sup_deplacement_gd');

  // Lèvre supérieure : côtés sup
  preset(C, 'levre_sup_cotes_sup_reduire_elargir');
  auto(C, 'levre_sup_cotes_sup_bas_haut',
    100 - _norm((L[37].y + L[267].y) / 2, 0.42, 0.86));
  presetZ(C, 'levre_sup_cotes_sup_arriere_avant');
  preset(C, 'levre_sup_cotes_sup_arrondi_angulaire');

  // Lèvre supérieure : coins sup
  preset(C, 'levre_sup_coins_sup_reduire_elargir');
  auto(C, 'levre_sup_coins_sup_bas_haut',
    100 - _norm((L[61].y + L[291].y) / 2, 0.52, 0.82));
  presetZ(C, 'levre_sup_coins_sup_arriere_avant');
  preset(C, 'levre_sup_coins_sup_arrondi_angulaire');

  // Lèvre supérieure : centre inf
  preset(C, 'levre_sup_centre_inf_reduire_elargir');
  // CORRIGÉ : plage étendue
  auto(C, 'levre_sup_centre_inf_bas_haut',
    _norm(L[13].y, 0.43, 0.86));
  presetZ(C, 'levre_sup_centre_inf_arriere_avant');
  preset(C, 'levre_sup_centre_inf_arrondi_angulaire');
  preset(C, 'levre_sup_centre_inf_deplacement_gd');

  // Lèvre supérieure : côtés inf
  preset(C, 'levre_sup_cotes_inf_reduire_elargir');
  auto(C, 'levre_sup_cotes_inf_bas_haut',
    _norm((L[82].y + L[312].y) / 2, 0.43, 0.86));
  presetZ(C, 'levre_sup_cotes_inf_arriere_avant');
  preset(C, 'levre_sup_cotes_inf_arrondi_angulaire');

  // Épaisseur lèvre supérieure — bornes resserrées 0.042-0.072 (plage humaine réelle)
  auto(C, 'epaisseur_levre_sup_reduire_elargir',
    _norm(_dist(L[0], L[13]) / D_H, 0.042, 0.072));

  auto(C, 'epaisseur_levre_sup_bas_haut',
    100 - _norm((L[0].y + L[13].y) / 2, 0.529, 0.753)); // bornes calées : Kim→75, Zlatan→0

  presetZ(C, 'epaisseur_levre_sup_arriere_avant');
  preset(C, 'epaisseur_levre_sup_arrondi_angulaire');

  // Philtrum
  // CORRIGÉ : max étendu 0.08→0.18
  auto(C, 'philtrum_reduire_elargir',
    _norm(_dist(L[37], L[267]) / D_W, 0.04, 0.12));  // FIX largeur horizontale (était 164/0 = longueur)

  auto(C, 'philtrum_bas_haut',
    _norm(L[0].y - L[164].y, 0.001, 0.15));

  presetZ(C, 'philtrum_arriere_avant');
  preset(C, 'philtrum_arrondi_angulaire');
  auto(C, 'philtrum_deplacement_gd',
    _norm(L[164].x - 0.5, -0.06, 0.06));

  // Épaisseur lèvre inférieure — bornes resserrées 0.038-0.092 (plage humaine réelle)
  auto(C, 'epaisseur_levre_inf_reduire_elargir',
    _norm(_dist(L[14], L[17]) / D_H, 0.038, 0.092));

  auto(C, 'epaisseur_levre_inf_bas_haut',
    _norm((L[14].y + L[17].y) / 2, 0.570, 0.793)); // bornes calées : Kim→23, Zlatan→93

  // Diagnostic largeur bouche + épaisseur lèvres (sliders + ratios bruts avant _norm)
  // → comparer aux bornes des _norm() pour repérer compression bas/haut d'échelle
  console.log('[bouche] largeur=', results.squelette.bouche_reduire_elargir,
    '| epaisseur_sup=', results.chair.epaisseur_levre_sup_reduire_elargir,
    '| epaisseur_inf=', results.chair.epaisseur_levre_inf_reduire_elargir);
  console.log('[bouche ratios] largeur=', (_dist(L[61], L[291]) / D_W).toFixed(3),
    '| ep_sup=', (_dist(L[0], L[13]) / D_H).toFixed(3),
    '| ep_inf=', (_dist(L[14], L[17]) / D_H).toFixed(3));

  presetZ(C, 'epaisseur_levre_inf_arriere_avant');
  preset(C, 'epaisseur_levre_inf_arrondi_angulaire');

  // Lèvre inférieure : centre sup (= "partie sup.centrale" dans le doc)
  preset(C, 'levre_inf_centre_sup_reduire_elargir');
  auto(C, 'levre_inf_centre_sup_bas_haut',
    100 - _norm(L[14].y, 0.45, 0.89));
  presetZ(C, 'levre_inf_centre_sup_arriere_avant');
  preset(C, 'levre_inf_centre_sup_arrondi_angulaire');
  preset(C, 'levre_inf_centre_sup_deplacement_gd');

  // Lèvre inférieure : côtés sup
  preset(C, 'levre_inf_cotes_sup_reduire_elargir');
  auto(C, 'levre_inf_cotes_sup_bas_haut',
    100 - _norm((L[84].y + L[314].y) / 2, 0.45, 0.89));
  presetZ(C, 'levre_inf_cotes_sup_arriere_avant');
  preset(C, 'levre_inf_cotes_sup_arrondi_angulaire');

  // Lèvre inférieure : centre inf (= "partie inf.centrale")
  preset(C, 'levre_inf_centre_inf_reduire_elargir');
  // CORRIGÉ : plage étendue
  auto(C, 'levre_inf_centre_inf_bas_haut',
    _norm(L[17].y, 0.47, 0.92));
  presetZ(C, 'levre_inf_centre_inf_arriere_avant');
  preset(C, 'levre_inf_centre_inf_arrondi_angulaire');
  preset(C, 'levre_inf_centre_inf_deplacement_gd');

  // Lèvre inférieure : côtés inf
  preset(C, 'levre_inf_cotes_inf_reduire_elargir');
  auto(C, 'levre_inf_cotes_inf_bas_haut',
    _norm((L[86].y + L[316].y) / 2, 0.47, 0.92));
  presetZ(C, 'levre_inf_cotes_inf_arriere_avant');
  preset(C, 'levre_inf_cotes_inf_arrondi_angulaire');

  // Lèvre inférieure : coins inf
  preset(C, 'levre_inf_coins_inf_reduire_elargir');
  auto(C, 'levre_inf_coins_inf_bas_haut',
    _norm((L[61].y + L[291].y) / 2, 0.52, 0.82));
  presetZ(C, 'levre_inf_coins_inf_arriere_avant');
  preset(C, 'levre_inf_coins_inf_arrondi_angulaire');

  // Plis coins bouche → preset (Z non fiable)
  preset(C, 'plis_coin_bouche_neutre_moins');

  // ── MENTON Chair ──
  // CORRIGÉ : plage étendue 0.78,0.92→0.60,0.92
  auto(C, 'fossette_mentonniere_bas_haut',
    _norm(L[152].y, 0.40, 1.25));

  auto(C, 'fossette_mentonniere_deplacement_gd',
    _norm(L[152].x - 0.5, -0.12, 0.12));

  // Zdev → preset
  preset(C, 'menton_cotes_neutre_moins');

  // ── MÂCHOIRE Chair ──
  // machoire_moins_plus : set par le bloc PLÉNITUDE / VOLUME (haut de fonction)

  // ── TEMPES Chair ──

  // ════════════════════════════════════════════
  // FAMILLE GRAISSE
  // Tous les sliders Graisse utilisent l'axe Z ou le volume
  // → Preset(50) pour V1 (nécessite matrice canonique)
  // Exception : positions Y des graisses (fiables en 2D)
  // ════════════════════════════════════════════

  // Haut du cou → preset total
  preset(G, 'haut_cou_bas_haut');
  preset(G, 'haut_cou_moins_plus');

  // Front — position Y calculable, volume Z → preset
  auto(G, 'front_centre_bas_haut',
    _norm((L[10].y + L[9].y + L[8].y) / 3, 0.03, 0.50));

  preset(G, 'front_centre_moins_plus');

  auto(G, 'front_cotes_bas_haut',
    _norm((L[103].y + L[332].y) / 2, 0.10, 0.40));

  preset(G, 'front_cotes_moins_plus');

  // Yeux graisse — position Y calculable
  auto(G, 'paupiere_sup_bas_haut',
    _norm((L[159].y + L[386].y) / 2, 0.22, 0.58));

  preset(G, 'paupiere_sup_moins_plus');

  auto(G, 'paupiere_inf_bas_haut',
    _norm((L[145].y + L[374].y) / 2, 0.30, 0.65));

  preset(G, 'paupiere_inf_moins_plus');

  preset(G, 'cernes_inf_bas_haut');
  preset(G, 'cernes_inf_moins_plus');

  // Nez graisse → preset total
  preset(G, 'nez_moins_plus');

  // Joues graisse — position Y calculable
  // joues_sup_moins_plus / joues_inf_moins_plus / bajoue_moins_plus :
  // set par le bloc PLÉNITUDE / VOLUME (haut de fonction)
  auto(G, 'joues_sup_bas_haut',
    _norm((L[116].y + L[345].y) / 2, 0.35, 0.68));

  auto(G, 'joues_inf_bas_haut',
    _norm((L[136].y + L[365].y) / 2, 0.42, 0.95));

  auto(G, 'bajoue_bas_haut',
    _norm((L[172].y + L[397].y) / 2, 0.48, 0.97));

  auto(G, 'joues_int_sup_bas_haut',
    _norm((L[50].y + L[280].y) / 2, 0.30, 0.80));

  preset(G, 'joues_int_sup_moins_plus');

  auto(G, 'joues_int_inf_bas_haut',
    _norm((L[147].y + L[376].y) / 2, 0.38, 0.85));

  preset(G, 'joues_int_inf_moins_plus');

  auto(G, 'tempes_bas_haut',
    100 - _norm((L[103].y + L[332].y) / 2, 0.05, 0.58));

  preset(G, 'tempes_moins_plus');

  // Bouche graisse
  auto(G, 'cotes_bouche_bas_haut',
    _norm((L[61].y + L[291].y) / 2, 0.52, 0.82));

  preset(G, 'cotes_bouche_moins_plus');

  auto(G, 'levres_sup_bas_haut',
    _norm((L[0].y + L[13].y) / 2, 0.48, 0.80));

  preset(G, 'levres_sup_moins_plus');

  auto(G, 'levres_inf_bas_haut',
    _norm((L[14].y + L[17].y) / 2, 0.52, 0.85));

  preset(G, 'levres_inf_moins_plus');

  // Menton graisse
  // menton_moins_plus / sous_menton_moins_plus / machoire_moins_plus :
  // set par le bloc PLÉNITUDE / VOLUME (haut de fonction)
  auto(G, 'menton_bas_haut',
    _norm(L[152].y, 0.60, 0.95));

  auto(G, 'sous_menton_bas_haut',
    _norm(L[200].y, 0.52, 1.02));

  // Mâchoire graisse
  auto(G, 'machoire_bas_haut',
    _norm((L[132].y + L[361].y) / 2, 0.38, 0.92));

  // ── Finalisation méta ──
  meta.totalSliders  = meta.autoCount + meta.presetCount;
  meta.coverageRate  = Math.round((meta.autoCount / meta.totalSliders) * 100);

  // ════════════════════════════════════════════
  // PHASE 1 v2 + 1.4 — Post-process directScan + DNA Squelette
  // ════════════════════════════════════════════
  // Ordre de résolution :
  //   Squelette : (1) DNA bestPreset si dispo, sinon (2) directScan
  //   Chair/Graisse : directScan (kill switch protège auto si false)
  // Si DIRECTSCAN_OVERRIDE_AUTO=false, on laisse les auto() intacts
  // (comportement Phase 1 conservateur, on n'écrase que les preset).
  const _ds_stats = {
    auto: 0, z3ddfa: 0, angle3ddfa: 0, directScan: 0, preset: 0,
    dna_squelette: 0,
    ds_overrides_auto: 0,
    ds_overrides_preset: 0,
    ds_overrides_angle3ddfa: 0,
    ds_skipped_no_lm: 0,
    ds_skipped_kill_switch: 0
  };
  // Compte les sources existantes (avant directScan / DNA)
  for (const fam of [S, C, G]) {
    for (const k in fam._sources) {
      const s = fam._sources[k];
      if (s in _ds_stats) _ds_stats[s]++;
    }
  }

  // Phase 1.4 : DNA bestPreset prêt pour la priorité Squelette.
  // bestPreset est résolu plus haut (selectBestPreset, ligne ~170).
  const _hasDnaLookup = (typeof lookupPresetDNA === 'function');

  if (window.V7_SLIM && landmarks) {
    const FAMILY_MAP = { squelette: S, chair: C, graisse: G };
    for (const key in window.V7_SLIM) {
      const entry = window.V7_SLIM[key];
      const target = FAMILY_MAP[entry.family];
      if (!target) continue;

      // === Phase 1.4 : DNA Squelette prioritaire sur directScan ===
      // Pour Squelette uniquement : si la DNA du bestPreset est dispo et
      // finie, on l'utilise telle quelle. directScan ne touche plus à ce
      // slider. Chair/Graisse : pas de DNA fiable hors Phase 2 célébrités
      // → comportement inchangé.
      if (entry.family === 'squelette' && bestPreset && _hasDnaLookup) {
        const dnaValue = lookupPresetDNA(bestPreset, key);
        if (Number.isFinite(dnaValue)) {
          target[key] = dnaValue;
          target._sources[key] = 'dna';
          _ds_stats.dna_squelette++;
          continue; // skip directScan pour ce slider
        }
      }

      const v = directScan(landmarks, key);
      if (v === null || !Number.isFinite(v)) {
        _ds_stats.ds_skipped_no_lm++;
        continue;
      }

      const prevSrc = target._sources[key];
      if (prevSrc === 'auto' && !DIRECTSCAN_OVERRIDE_AUTO) {
        _ds_stats.ds_skipped_kill_switch++;
        continue;
      }

      target[key] = v;
      target._sources[key] = 'directScan';
      _ds_stats.directScan++;
      if (prevSrc === 'auto')       _ds_stats.ds_overrides_auto++;
      else if (prevSrc === 'preset') _ds_stats.ds_overrides_preset++;
      else if (prevSrc === 'angle3ddfa') _ds_stats.ds_overrides_angle3ddfa++;
    }
  }

  // ════════════════════════════════════════════
  // Phase 3.1 — Régression multiple Chair (override des sliders mesurables)
  // ════════════════════════════════════════════
  // S'exécute AVANT la 2e passe DNA et AVANT le snapshot debug : le snapshot
  // capture donc l'état final pré-DNA, incluant l'override régression.
  // Filet de sécurité : si V8_CHAIR pas chargé ou landmarks de réf invalides,
  // chairRegression = null → on retombe automatiquement sur le comportement
  // pré-3.1 (DNA pass 2 Chair s'applique).
  const chairRegression = directScanRegressionChair(L);
  let _chair_regression_n = 0;
  if (chairRegression) {
    for (const key in chairRegression) {
      if (Object.prototype.hasOwnProperty.call(C, key)) {
        C[key] = chairRegression[key];
        if (C._sources) C._sources[key] = 'regression_chair';
        _chair_regression_n++;
      }
    }
    _ds_stats.regression_chair = _chair_regression_n;
    console.log('[regression] chair override:', _chair_regression_n, 'sliders');
  }

  // ════════════════════════════════════════════
  // PHASE 4.0 — Matching par sous-onglet via ratios morphologiques
  // ════════════════════════════════════════════
  // Pour chaque zone définie dans zone_definitions.json, on calcule un best
  // preset Layer 1 sur les ratios morphologiques de cette zone, puis on
  // applique baseline + delta via régression locale. Écrase les sources
  // précédentes (auto / preset / regression v8) sur les sliders couverts.
  // Filet de sécurité : si artifacts pas chargés ou userAttrs nuls,
  // zoneResults reste vide → DNA pass2 prend le relais normalement.
  const zoneCoveredSliders = new Set();
  const zoneResults = {};
  if (typeof window.matchZoneByStats === 'function'
      && window._zoneDefinitions && window._zoneRegressions) {
    let userAttrs = null;
    try {
      if (typeof window.calculateMixAttributes === 'function'
          && typeof window.augmentAttributesWithCustomMetrics === 'function') {
        userAttrs = window.calculateMixAttributes(landmarks);
        userAttrs = window.augmentAttributesWithCustomMetrics(landmarks, userAttrs);
      }
    } catch (e) {
      console.warn('[Phase 4.0] userAttrs compute fail:', e && e.message ? e.message : e);
    }

    if (userAttrs && Array.isArray(window.PRESETS_DB)) {
      const FAMILY_OBJ = { squelette: S, chair: C, graisse: G };
      const zoneDefs = (window._zoneDefinitions && window._zoneDefinitions.zones) || {};
      // Phase 4.1 — routage cohérence-d'abord : les zones "aveugles"
      // (signal insuffisant sur les ratios actuels, cf. audit_zone_validity.py)
      // ne sont PAS matchées par zone ; elles héritent du preset global via la
      // 2e passe DNA. On écrit quand même une méta avec confidence=APPROX +
      // source=global_fallback pour piloter le badge UI.
      const _validityZones = (window._zoneValidity && window._zoneValidity.zones) || null;
      const _globalMorpho = bestPreset ? bestPreset.preset_id : null;
      let _blindCount = 0;

      // Helper local (defini en const pour eviter toute ambiguite de hoisting) :
      // verifie si une zoneKey est marquee aveugle dans le snapshot zone_validity.
      const _isBlindZoneScan = (zoneKey, validityZones) => {
        if (!validityZones) return false;
        const z = validityZones[zoneKey];
        return !!(z && z.status === 'aveugle');
      };

      // ── Phase 4.2 : matching par GROUPE anatomique via SIGNATURE globale
      // (fallback Phase 4.1.3 si signature_disabled OU preset.group_signatures
      // absent du batch). Pour chaque groupe :
      //   1) Si une signature est definissable (contour ferme valide), on
      //      calcule la signature user et on cherche le preset le plus proche
      //      au sens Fisher-pondere sur les features de signature. Marge
      //      stricte = 3x pour les escapes.
      //   2) Sinon, fallback selectPresetForGroup (4.1.3, agregation des
      //      sous-onglets, marge 2x).
      // Les sous-onglets restants prendront le DNA de p* au lieu de leur
      // matching individuel -> recette coherente sur la region anatomique.
      //
      // window.lastUserAttrs est expose AVANT l'appel matchGroupBy* pour que la
      // regle d'escape (par sous-onglet, distance Fisher zone par zone) puisse
      // evaluer chaque sous-onglet sans recalculer.
      window.lastUserAttrs = userAttrs;

      // Phase 4.3 : features Farkas calculees une fois et reutilisees
      // sur tous les groupes encore en aggregation (machoire_menton, joues,
      // front, narines, nez) + visage_global diagnostique.
      let userFarkas = null;
      if (typeof window.computeFarkasFeatures === 'function' && window._farkasFeatures) {
        try {
          userFarkas = window.computeFarkasFeatures(landmarks);
        } catch (e) {
          console.warn('[Phase 4.3] computeFarkasFeatures fail:', e && e.message ? e.message : e);
        }
        if (userFarkas) meta.farkas_user = userFarkas;
      }

      const groupResults = {};      // groupKey -> { preset_id, preset, source, ... }
      const subtabToGroup = {};     // zoneKey -> groupKey
      const groupedSubtabs = new Set(); // zones gerees par leur groupe (non escaped)
      const userGroupSignatures = {}; // groupKey -> signature object (debug)
      const groupsRoot = window._zoneGroups && window._zoneGroups.groups;
      const sigsRoot   = window._groupSignatures && window._groupSignatures.groups;
      const farkRoot   = window._farkasFeatures  && window._farkasFeatures.groups;

      if (groupsRoot) {
        for (const gKey in groupsRoot) {
          const gDef = groupsRoot[gKey];
          if (!gDef || !Array.isArray(gDef.subtabs)) continue;
          for (const z of gDef.subtabs) subtabToGroup[z] = gKey;

          let gres = null;
          let mode = null;

          // 1) Tentative signature 4.2
          const sigDef = sigsRoot ? sigsRoot[gKey] : null;
          const sigEnabled = sigDef && sigDef.signature_disabled !== true;
          if (sigEnabled && typeof window.matchGroupBySignature === 'function') {
            try {
              gres = window.matchGroupBySignature(gKey, landmarks, window.PRESETS_DB);
            } catch (e) {
              console.warn(`[Phase 4.2] signature ${gKey} fail:`, e && e.message ? e.message : e);
            }
            if (gres) {
              mode = 'signature';
              if (gres.signature_user) userGroupSignatures[gKey] = gres.signature_user;
            }
          }
          // 2) Tentative Farkas 4.3 (Mahalanobis sur features morphometriques)
          //    Fail-soft : null si farkas_features manquant ou preset pool < 10.
          if (!gres && userFarkas && farkRoot && farkRoot[gKey]
              && typeof window.matchGroupByFarkas === 'function') {
            try {
              gres = window.matchGroupByFarkas(gKey, userFarkas, window.PRESETS_DB);
            } catch (e) {
              console.warn(`[Phase 4.3] farkas ${gKey} fail:`, e && e.message ? e.message : e);
            }
            if (gres) mode = 'farkas';
          }
          // 3) Fallback agregation 4.1.3
          if (!gres && typeof window.selectPresetForGroup === 'function') {
            try {
              gres = window.selectPresetForGroup(gKey, userAttrs, window.PRESETS_DB);
            } catch (e) {
              console.warn(`[Phase 4.1.3] group ${gKey} match fail:`, e && e.message ? e.message : e);
            }
            if (gres) mode = 'aggregation';
          }
          if (!gres) continue;
          gres._mode = mode;
          groupResults[gKey] = gres;
          for (const z of gDef.subtabs) {
            if (gres.escaped_subtabs && gres.escaped_subtabs.has(z)) continue;
            if (_isBlindZoneScan(z, _validityZones)) continue; // aveugle reste sur global_fallback
            groupedSubtabs.add(z);
          }
        }

        // Phase 4.3 : visage_global est diagnostique seulement (pas de sliders,
        // pas dans zone_groups). On le calcule a part pour exposer dans meta.
        if (userFarkas && farkRoot && farkRoot['visage_global']
            && typeof window.matchGroupByFarkas === 'function') {
          try {
            const vg = window.matchGroupByFarkas('visage_global', userFarkas, window.PRESETS_DB);
            if (vg) {
              meta.global_farkas_match = {
                preset_id: vg.preset_id,
                distance: vg.distance,
                n_features_used: vg.n_features_used,
                top3: vg.top3,
                source: 'farkas',
                method: 'mahalanobis',
              };
            }
          } catch (e) {
            console.warn('[Phase 4.3] farkas visage_global fail:', e && e.message ? e.message : e);
          }
        }

        if (Object.keys(groupResults).length) {
          meta.group_matches = {};
          for (const gKey in groupResults) {
            const r = groupResults[gKey];
            // Champs distance : signature/farkas emettent "distance", 4.1.3 emet "aggregate_distance"
            const dist = (typeof r.distance === 'number') ? r.distance
                       : (typeof r.aggregate_distance === 'number') ? r.aggregate_distance
                       : null;
            meta.group_matches[gKey] = {
              preset_id: r.preset_id,
              source: r._mode || (r.source || 'aggregation'),
              method: r.method || null,
              distance: dist,
              n_used: r.n_used || r.n_zones_used || null,
              n_features_used: r.n_features_used || null,
              escaped_subtabs: Array.from(r.escaped_subtabs || []),
              top3: r.top3 || null,
            };
          }
          const sigCount  = Object.values(groupResults).filter(r => r._mode === 'signature').length;
          const farkCount = Object.values(groupResults).filter(r => r._mode === 'farkas').length;
          const aggCount  = Object.values(groupResults).filter(r => r._mode === 'aggregation').length;
          console.log('[Phase 4.3] groups matched:', Object.keys(groupResults).length,
                      '| signature:', sigCount,
                      '| farkas:', farkCount,
                      '| aggregation:', aggCount,
                      '| zones covered:', groupedSubtabs.size);
        }
        if (Object.keys(userGroupSignatures).length) {
          meta.group_signatures = userGroupSignatures;
        }
      }

      // ── Helper local : applique le DNA du preset de groupe a une zone ────
      // Reproduit la branche "sliders" de matchZoneByStats (lookup DNA par
      // famille + softClamp) sans relancer le matching individuel.
      const _applyGroupPresetToZone = (groupKey, zoneKey, def, target) => {
        const gr = groupResults[groupKey];
        if (!gr || !gr.preset) return null;
        const family = def.family;
        const lookup = window.lookupPresetDNAByFamily;
        if (typeof lookup !== 'function') return null;
        const sliderList = def.sliders || [];
        let n = 0;
        for (const sk of sliderList) {
          const v = lookup(gr.preset, family, sk);
          if (!Number.isFinite(v)) continue;
          target[sk] = softClampSlider(v);
          if (target._sources) target._sources[sk] = `group:${groupKey}`;
          zoneCoveredSliders.add(`${family}:${sk}`);
          n++;
        }
        return n;
      };

      let _groupedZoneCount = 0;
      for (const zoneKey in zoneDefs) {
        const def = zoneDefs[zoneKey];
        const target = FAMILY_OBJ[def && def.family];
        if (!target) continue;
        const validity = _validityZones ? _validityZones[zoneKey] : null;
        if (validity && validity.status === 'aveugle') {
          // Pas de match par zone : on hérite du preset global (DNA pass2).
          zoneResults[zoneKey] = {
            morpho_id: _globalMorpho,
            display_id: null,
            distance: null,
            confidence: 'APPROX',
            source: 'global_fallback',
          };
          _blindCount++;
          continue;
        }
        // Phase 4.1.3 : zone couverte par un groupe (non escaped) -> DNA du groupe.
        const groupKey = subtabToGroup[zoneKey];
        if (groupKey && groupedSubtabs.has(zoneKey)) {
          const gr = groupResults[groupKey];
          const nApplied = _applyGroupPresetToZone(groupKey, zoneKey, def, target);
          const morphoId = gr.preset_id;
          const isCelebMorpho = (typeof morphoId === 'number' && morphoId >= 10000);
          let displayId = null;
          if (isCelebMorpho && window._celebrityToOfficialPerZone
              && window._celebrityToOfficialPerZone[zoneKey]) {
            const m = window._celebrityToOfficialPerZone[zoneKey][String(morphoId)];
            if (m && Number.isFinite(m.best_official) && m.best_official !== morphoId) {
              displayId = m.best_official;
            }
          }
          zoneResults[zoneKey] = {
            morpho_id: morphoId,
            display_id: displayId,
            distance: gr.aggregate_distance,
            confidence: 'GROUPE',
            source: 'group_match',
            group: groupKey,
            sliders_written: nApplied || 0,
          };
          _groupedZoneCount++;
          continue;
        }
        // Sinon (zone hors groupe OU escaped) : matching individuel comme avant.
        let r = null;
        try {
          r = window.matchZoneByStats(userAttrs, zoneKey, window.PRESETS_DB);
        } catch (e) {
          console.warn(`[Phase 4.0] zone ${zoneKey} match fail:`, e && e.message ? e.message : e);
        }
        if (!r) continue;
        // display_id : officiel mappe via _celebrityToOfficialPerZone uniquement
        // si Layer 1 est une celebrite (ID 5 chiffres, >= 10000), sinon null.
        // Cohérent avec la règle d'identification présente plus haut (L1064-style).
        const _morphoId = r.best_preset_id_morpho;
        const _isCelebMorpho = (typeof _morphoId === 'number' && _morphoId >= 10000);
        const _displayId = (_isCelebMorpho
                              && typeof r.display_official_id === 'number'
                              && r.display_official_id !== _morphoId)
                            ? r.display_official_id : null;
        zoneResults[zoneKey] = {
          morpho_id: _morphoId,
          display_id: _displayId,
          distance: r.distance,
          confidence: r.confidence || null,
          source: groupKey ? 'zone_match_escaped' : 'zone_match',
          group: groupKey || undefined,
        };
        if (!r.sliders) continue;
        for (const sk in r.sliders) {
          const v = softClampSlider(r.sliders[sk]);
          target[sk] = v;
          if (target._sources) target._sources[sk] = `zone:${zoneKey}`;
          zoneCoveredSliders.add(`${def.family}:${sk}`);
        }
      }
      if (Object.keys(zoneResults).length) {
        _ds_stats.zone_matches = Object.keys(zoneResults).length;
        _ds_stats.zone_covered_sliders = zoneCoveredSliders.size;
        _ds_stats.zone_blind_fallback   = _blindCount;
        _ds_stats.zone_grouped          = _groupedZoneCount;
        _ds_stats.groups_matched        = Object.keys(groupResults).length;
        meta.zone_matches = zoneResults;
        console.log('[Phase 4.0] zones matched:', Object.keys(zoneResults).length,
                    '| blind→global:', _blindCount,
                    '| group-covered:', _groupedZoneCount,
                    '| sliders overridden:', zoneCoveredSliders.size);
      }
    }
  }

  // ════════════════════════════════════════════
  // DEBUG HOOK — snapshot pré-DNA pour diagnostic batch
  // ════════════════════════════════════════════
  // No-op total en prod (bloc skipped si flag absente). Activable uniquement
  // via window.__SMF_DEBUG_CAPTURE_PRE_DNA__ posée AVANT l'appel scan.
  // Capture S/C/G + leurs _sources juste avant que la 2e passe DNA n'écrase.
  if (typeof window !== 'undefined' && window.__SMF_DEBUG_CAPTURE_PRE_DNA__) {
    results._pre_dna_snapshot = {
      squelette: JSON.parse(JSON.stringify(S)),
      chair:     JSON.parse(JSON.stringify(C)),
      graisse:   JSON.parse(JSON.stringify(G)),
    };
  }

  // ════════════════════════════════════════════
  // Phase 2.1 — 2e passe DNA (Squelette hors V7_SLIM + Chair + Graisse)
  // ════════════════════════════════════════════
  // Pour chaque slider dans S, C, G : si la DNA bestPreset est dispo, on écrase.
  // Squelette : via lookupPresetDNA (DNA_KEY_MAP) — marche officiels + célébs.
  // Chair / Graisse : via faconner.<family>[key] — célébrités uniquement
  // (les officiels n'ont pas la structure flat → lookup retourne undefined
  // → fallback comportement actuel).
  //
  // GF1 Phase 3.1 : skipper la famille Chair si la régression a réussi ET
  // que window.__ENABLE_DNA_FALLBACK_CHAIR__ n'est pas true. Permet un
  // rollback instantané sans redéploy (poser la flag en console).
  const ENABLE_DNA_FALLBACK_CHAIR = (typeof window !== 'undefined' &&
                                     window.__ENABLE_DNA_FALLBACK_CHAIR__ === true);
  if (bestPreset && typeof window.lookupPresetDNAByFamily === 'function') {
    const FAMILIES = [
      ['squelette', S],
      ['chair', C],
      ['graisse', G],
    ];

    for (const [familyName, target] of FAMILIES) {
      if (!target) continue;
      if (familyName === 'chair' && chairRegression && !ENABLE_DNA_FALLBACK_CHAIR) {
        _ds_stats.dna_chair_pass2_skipped_regression = (target ? Object.keys(target).filter(k => !k.startsWith('_')).length : 0);
        continue;
      }

      for (const key in target) {
        if (key.startsWith('_')) continue; // skip _sources, _meta, etc.

        // PHASE 4.0 — preserve zone-matched values from DNA pass2 overwrite
        if (zoneCoveredSliders.has(`${familyName}:${key}`)) continue;

        const dnaValue = window.lookupPresetDNAByFamily(bestPreset, familyName, key);
        if (!Number.isFinite(dnaValue)) continue;

        const prevSource = target._sources ? target._sources[key] : undefined;

        target[key] = dnaValue;
        if (target._sources) target._sources[key] = 'dna';

        _ds_stats[`dna_${familyName}_pass2`] = (_ds_stats[`dna_${familyName}_pass2`] || 0) + 1;

        if (prevSource && prevSource !== 'dna') {
          const ovKey = `dna_overrides_${prevSource}`;
          _ds_stats[ovKey] = (_ds_stats[ovKey] || 0) + 1;
        }
      }
    }
  }

  meta.source_counts = _ds_stats;

  // Diag pose 3DDFA : stash le brut { pose, shape, expr } pose par script_spa.js
  // dans window._lastTddfa apres le scan principal. Pas de raw (redondant avec
  // shape+expr). Skipped silencieusement si 3DDFA a echoue ou n'a pas tourne.
  // UNITES : pose.yaw/pitch/roll en DEGRES (run3DDFA.js L148-152 applique
  // * 180/PI a la sortie de extractPose). tx/ty en pixels image source, scale
  // = facteur d'echelle de la camera matrix.
  const _tddfa = (typeof window !== 'undefined') ? window._lastTddfa : null;
  if (_tddfa && _tddfa.pose) {
    const _p = _tddfa.pose;
    meta.pose3ddfa = {
      yaw:   _p.yaw,
      pitch: _p.pitch,
      roll:  _p.roll,
      tx:    _p.tx,
      ty:    _p.ty,
      scale: _p.scale,
      shape: _tddfa.shape ? Array.from(_tddfa.shape) : null,  // 40 floats
      expr:  _tddfa.expr  ? Array.from(_tddfa.expr)  : null,  // 10 floats
    };
  }

  // Expose le dernier scan en global pour outils diag (stabilite zone_matches
  // + pose3ddfa). Ne change rien au flow runtime — sert juste à inspecter en
  // console : window.lastScanResult._meta.zone_matches / pose3ddfa
  if (typeof window !== 'undefined') window.lastScanResult = results;
  console.log('[directScan] override:', _ds_stats);

  return results;
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scanToSliders };
}

// ─────────────────────────────────────────────
// RÉSUMÉ DES CORRECTIONS V2
// ─────────────────────────────────────────────
//
// SLIDERS CORRIGÉS (plages recalibrées) :
//   tempes_reduire_elargir   → changé landmarks (103,332) au lieu de (234,454)
//   sourcils_reduire_elargir → max 0.65 → 0.90
//   yeux_reduire_elargir     → max 0.55 → 0.85
//   orbites_reduire_elargir  → max 0.62 → 0.82
//   orbites_plus_grande_petite → max 0.08 → 0.14
//   joues_reduire_elargir    → max 0.80 → 0.97
//   machoire_reduire_elargir → max 0.78 → 0.97
//   mandibule_reduire_elargir → max 0.72 → 0.92
//   mandibule_bas_haut       → max 0.45 → 0.62
//   narine_sup_reduire_elargir → max 0.25 → 0.45
//   front_sup_bas_haut       → max 0.15 → 0.35
//   front_inf_reduire_elargir → min 0.45→0.25, max 0.70→0.80
//   front_inf_bas_haut       → max 0.10 → 0.25
//   sourcils_bas_haut        → max 0.40 → 0.65
//   sourcils_ext_sup_bas_haut → max 0.42 → 0.65
//   yeux_bas_haut            → max 0.55 → 0.75
//   arete_nez_sup_bas_haut   → max 0.10 → 0.25
//   arete_nez_centrale_reduire_elargir → max 0.22 → 0.40
//   menton_reduire_elargir   → max 0.20 → 0.40
//   maxillaire_arriere_avant → preset (Z non fiable)
//   philtrum_bas_haut        → max 0.08 → 0.18
//   espacement_levres_centre → max 0.03 → 0.018 (resserré)
//   fossette_mentonniere_bas_haut → min 0.78 → 0.60
//   levre_sup_centre_sup_bas_haut → plage étendue
//   levre_inf_centre_inf_bas_haut → plage étendue
//   coin_oeil_ext_bas_haut   → plage étendue
//   coin_oeil_int_reduire_elargir → max 0.25 → 0.35
//   front_centre_bas_haut    → min 0.12 → 0.05
//   paupiere_sup_bas_haut    → plage étendue 0.32,0.48 → 0.22,0.58
//
// SLIDERS PASSÉS EN PRESET (axe Z non fiable sans matrice canonique) :
//   Tous les *_arriere_avant (12 sliders)
//   Tous les *_zdev (16 sliders)
//   crane_arrondi_angulaire, machoire_arrondi_angulaire, etc.
//   tempes_moins_plus, joues_moins_plus, menton_cotes, machoire_moins_plus
//   plis_coin_bouche
//   Famille GRAISSE *_moins_plus (tous)
//
// PROCHAINES ÉTAPES V2 → V3 :
//   - Implémenter facialTransformationMatrixes pour l'espace canonique
//   - Recalibrer les axes Z sur les mêmes 10 visages
//   - Récupérer les *_moins_plus de la famille Graisse

// Expose globalement pour script_spa.js
if (typeof window !== 'undefined') {
  window.scanToSliders = scanToSliders;
}
