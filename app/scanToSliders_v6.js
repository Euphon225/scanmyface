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

const PRESET_NEUTRE = 50;

// ─────────────────────────────────────────────
// FONCTION PRINCIPALE
// ─────────────────────────────────────────────

function scanToSliders(landmarks, tddfaResult = null) {
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

  const auto   = (obj, k, v) => { obj[k] = v; meta.autoCount++;   };
  const preset = (obj, k, v = PRESET_NEUTRE) => { obj[k] = v; meta.presetCount++; };

  // 3DDFA overrides : si tddfaResult fournit la clé, on prend sa valeur (comptée comme auto), sinon preset(50)
  const _tZ = tddfaResult?.z_sliders || {};
  const _tA = tddfaResult?.angle_sliders || {};
  const presetZ = (obj, k) => {
    if (Number.isFinite(_tZ[k])) { obj[k] = _tZ[k]; meta.autoCount++; }
    else { obj[k] = PRESET_NEUTRE; meta.presetCount++; }
  };
  const presetA = (obj, k) => {
    if (Number.isFinite(_tA[k])) { obj[k] = _tA[k]; meta.autoCount++; }
    else { obj[k] = PRESET_NEUTRE; meta.presetCount++; }
  };

  // ════════════════════════════════════════════
  // FAMILLE SQUELETTE
  // ════════════════════════════════════════════

  // ── TÊTE / CRÂNE ──
  // Largeur crânienne (pts temporaux latéraux)
  auto(S, 'crane_reduire_elargir',
    _norm(_dist(L[21], L[251]) / D_W, 0.45, 1.20));

  // Hauteur crânio-mentonnière (toujours = 1.0 par définition → ratio fixe)
  // On mesure plutôt la hauteur du front par rapport à la face
  auto(S, 'crane_bas_haut',
    _norm(_dist(L[10], L[9]) / D_H, 0.02, 0.45));

  // Axe Z → preset (non fiable sans matrice canonique)
  presetZ(S, 'crane_arriere_avant');
  presetA(S, 'crane_arrondi_angulaire');
  preset(S, 'crane_deplacement_gd');

  // Couronne → preset (extrapolation non fiable)
  preset(S, 'crane_couronne_reduire_elargir');
  preset(S, 'crane_couronne_bas_haut');
  presetZ(S, 'crane_couronne_arriere_avant');
  preset(S, 'crane_couronne_neutre_arrondi');
  preset(S, 'crane_couronne_deplacement_gd');

  // Arrière du crâne → preset (aucun landmark MediaPipe derrière la tête)
  preset(S, 'crane_arriere_reduire_elargir');
  preset(S, 'crane_arriere_bas_haut');
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
    _norm(_dist(_mid(L[46], L[276]), L[8]) / D_H, 0.02, 0.65));

  presetZ(S, 'sourcils_arriere_avant');
  preset(S, 'sourcils_arrondi_angulaire');

  // Sourcils centraux
  auto(S, 'sourcils_central_reduire_elargir',
    _norm(_dist(L[107], L[336]) / D_W, 0.02, 0.60));

  auto(S, 'sourcils_central_bas_haut',
    _norm(_dist(_mid(L[107], L[336]), L[8]) / D_H, 0.001, 0.60));

  presetZ(S, 'sourcils_central_arriere_avant');
  preset(S, 'sourcils_central_arrondi_angulaire');
  auto(S, 'sourcils_central_deplacement_gd',
    _norm(_mid(L[107], L[336]).x - 0.5, -0.08, 0.08));

  // Sourcils extérieurs supérieurs
  auto(S, 'sourcils_ext_sup_reduire_elargir',
    _norm(_dist(L[70], L[300]) / D_W, 0.40, 1.02));

  // CORRIGÉ : max étendu 0.42→0.65
  auto(S, 'sourcils_ext_sup_bas_haut',
    _norm(_dist(_mid(L[70], L[300]), L[8]) / D_H, 0.02, 0.65));

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
  preset(S, 'yeux_arrondi_angulaire');

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
  // Largeur narines
  auto(S, 'nez_reduire_elargir',
    _norm(_dist(L[129], L[358]) / D_W, 0.14, 0.42));

  // Longueur nez (nasion → pointe)
  auto(S, 'nez_bas_haut',
    _norm(_dist(L[8], L[4]) / D_H, 0.15, 0.38));

  presetZ(S, 'nez_arriere_avant');
  preset(S, 'nez_arrondi_angulaire');

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
  auto(S, 'bouche_reduire_elargir',
    _norm(_dist(L[61], L[291]) / D_W, 0.22, 0.55));

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
    _norm(_dist(L[175], L[152]) / D_W, 0.02, 0.40));

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
  auto(C, 'pointe_nez_sup_reduire_elargir',
    _norm(_dist(L[4], L[19]) / D_W, 0.04, 0.24));

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

  auto(C, 'pointe_nez_inf_reduire_elargir',
    _norm(_dist(L[94], L[274]) / D_W, 0.06, 0.30));

  auto(C, 'pointe_nez_inf_bas_haut',
    _norm((L[94].y + L[274].y) / 2, 0.38, 0.90));

  preset(C, 'pointe_nez_inf_arriere_avant');
  preset(C, 'pointe_nez_inf_arrondi_angulaire');
  preset(C, 'pointe_nez_inf_deplacement_gd');

  // ── JOUES Chair ──
  auto(C, 'joues_bas_haut',
    100 - _norm((L[116].y + L[345].y) / 2, 0.38, 0.68));

  // Zdev → preset pour V1
  preset(C, 'joues_moins_plus');
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

  preset(C, 'commissures_levres_arriere_avant');
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
  preset(C, 'levre_sup_centre_sup_arriere_avant');
  preset(C, 'levre_sup_centre_sup_arrondi_angulaire');
  preset(C, 'levre_sup_centre_sup_deplacement_gd');

  // Lèvre supérieure : côtés sup
  preset(C, 'levre_sup_cotes_sup_reduire_elargir');
  auto(C, 'levre_sup_cotes_sup_bas_haut',
    100 - _norm((L[37].y + L[267].y) / 2, 0.42, 0.86));
  preset(C, 'levre_sup_cotes_sup_arriere_avant');
  preset(C, 'levre_sup_cotes_sup_arrondi_angulaire');

  // Lèvre supérieure : coins sup
  preset(C, 'levre_sup_coins_sup_reduire_elargir');
  auto(C, 'levre_sup_coins_sup_bas_haut',
    100 - _norm((L[61].y + L[291].y) / 2, 0.52, 0.82));
  preset(C, 'levre_sup_coins_sup_arriere_avant');
  preset(C, 'levre_sup_coins_sup_arrondi_angulaire');

  // Lèvre supérieure : centre inf
  preset(C, 'levre_sup_centre_inf_reduire_elargir');
  // CORRIGÉ : plage étendue
  auto(C, 'levre_sup_centre_inf_bas_haut',
    _norm(L[13].y, 0.43, 0.86));
  preset(C, 'levre_sup_centre_inf_arriere_avant');
  preset(C, 'levre_sup_centre_inf_arrondi_angulaire');
  preset(C, 'levre_sup_centre_inf_deplacement_gd');

  // Lèvre supérieure : côtés inf
  preset(C, 'levre_sup_cotes_inf_reduire_elargir');
  auto(C, 'levre_sup_cotes_inf_bas_haut',
    _norm((L[82].y + L[312].y) / 2, 0.43, 0.86));
  preset(C, 'levre_sup_cotes_inf_arriere_avant');
  preset(C, 'levre_sup_cotes_inf_arrondi_angulaire');

  // Épaisseur lèvre supérieure
  auto(C, 'epaisseur_levre_sup_reduire_elargir',
    _norm(_dist(L[0], L[13]) / D_H, 0.012, 0.075));

  auto(C, 'epaisseur_levre_sup_bas_haut',
    100 - _norm((L[0].y + L[13].y) / 2, 0.48, 0.80));

  preset(C, 'epaisseur_levre_sup_arriere_avant');
  preset(C, 'epaisseur_levre_sup_arrondi_angulaire');

  // Philtrum
  // CORRIGÉ : max étendu 0.08→0.18
  auto(C, 'philtrum_reduire_elargir',
    _norm(_dist(L[164], L[0]) / D_H, 0.02, 0.14));

  auto(C, 'philtrum_bas_haut',
    _norm(L[0].y - L[164].y, 0.001, 0.15));

  preset(C, 'philtrum_arriere_avant');
  preset(C, 'philtrum_arrondi_angulaire');
  auto(C, 'philtrum_deplacement_gd',
    _norm(L[164].x - 0.5, -0.06, 0.06));

  // Épaisseur lèvre inférieure
  auto(C, 'epaisseur_levre_inf_reduire_elargir',
    _norm(_dist(L[14], L[17]) / D_H, 0.010, 0.10));

  auto(C, 'epaisseur_levre_inf_bas_haut',
    100 - _norm((L[14].y + L[17].y) / 2, 0.52, 0.85));

  preset(C, 'epaisseur_levre_inf_arriere_avant');
  preset(C, 'epaisseur_levre_inf_arrondi_angulaire');

  // Lèvre inférieure : centre sup (= "partie sup.centrale" dans le doc)
  preset(C, 'levre_inf_centre_sup_reduire_elargir');
  auto(C, 'levre_inf_centre_sup_bas_haut',
    100 - _norm(L[14].y, 0.45, 0.89));
  preset(C, 'levre_inf_centre_sup_arriere_avant');
  preset(C, 'levre_inf_centre_sup_arrondi_angulaire');
  preset(C, 'levre_inf_centre_sup_deplacement_gd');

  // Lèvre inférieure : côtés sup
  preset(C, 'levre_inf_cotes_sup_reduire_elargir');
  auto(C, 'levre_inf_cotes_sup_bas_haut',
    100 - _norm((L[84].y + L[314].y) / 2, 0.45, 0.89));
  preset(C, 'levre_inf_cotes_sup_arriere_avant');
  preset(C, 'levre_inf_cotes_sup_arrondi_angulaire');

  // Lèvre inférieure : centre inf (= "partie inf.centrale")
  preset(C, 'levre_inf_centre_inf_reduire_elargir');
  // CORRIGÉ : plage étendue
  auto(C, 'levre_inf_centre_inf_bas_haut',
    _norm(L[17].y, 0.47, 0.92));
  preset(C, 'levre_inf_centre_inf_arriere_avant');
  preset(C, 'levre_inf_centre_inf_arrondi_angulaire');
  preset(C, 'levre_inf_centre_inf_deplacement_gd');

  // Lèvre inférieure : côtés inf
  preset(C, 'levre_inf_cotes_inf_reduire_elargir');
  auto(C, 'levre_inf_cotes_inf_bas_haut',
    _norm((L[86].y + L[316].y) / 2, 0.47, 0.92));
  preset(C, 'levre_inf_cotes_inf_arriere_avant');
  preset(C, 'levre_inf_cotes_inf_arrondi_angulaire');

  // Lèvre inférieure : coins inf
  preset(C, 'levre_inf_coins_inf_reduire_elargir');
  auto(C, 'levre_inf_coins_inf_bas_haut',
    _norm((L[61].y + L[291].y) / 2, 0.52, 0.82));
  preset(C, 'levre_inf_coins_inf_arriere_avant');
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
  preset(C, 'machoire_moins_plus');

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
  auto(G, 'joues_sup_bas_haut',
    _norm((L[116].y + L[345].y) / 2, 0.35, 0.68));

  preset(G, 'joues_sup_moins_plus');

  auto(G, 'joues_inf_bas_haut',
    _norm((L[136].y + L[365].y) / 2, 0.42, 0.95));

  preset(G, 'joues_inf_moins_plus');

  auto(G, 'bajoue_bas_haut',
    _norm((L[172].y + L[397].y) / 2, 0.48, 0.97));

  preset(G, 'bajoue_moins_plus');

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
  auto(G, 'menton_bas_haut',
    _norm(L[152].y, 0.60, 0.95));

  preset(G, 'menton_moins_plus');

  auto(G, 'sous_menton_bas_haut',
    _norm(L[200].y, 0.52, 1.02));

  preset(G, 'sous_menton_moins_plus');

  // Mâchoire graisse
  auto(G, 'machoire_bas_haut',
    _norm((L[132].y + L[361].y) / 2, 0.38, 0.92));

  preset(G, 'machoire_moins_plus');

  // ── Finalisation méta ──
  meta.totalSliders  = meta.autoCount + meta.presetCount;
  meta.coverageRate  = Math.round((meta.autoCount / meta.totalSliders) * 100);

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
