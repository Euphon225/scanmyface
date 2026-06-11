/**
 * ScanMyFace — scanToSliders_v6.js
 * ============================================================
 * PHASE 5.0 — MODE A INTÉGRAL (11 juin 2026)
 *
 * Trois écrivains de sliders, dans cet ordre de priorité croissante :
 *   (1) DNA tête de réf (init des 303)  <  (2) groupes 4.2/4.3  <  (3) zones 4.0/4.1
 *
 * SUPPRIMÉ depuis Phase 4.3 :
 *   - tous les appels auto() / preset() / presetZ() / presetA()
 *   - les ~800 lignes de formules (faceRatio, taper, _norm, ancres P9, etc.)
 *   - V7_SLIM / directScan / DIRECTSCAN_OVERRIDE_AUTO
 *   - V8_CHAIR / regression_chair / __ENABLE_DNA_FALLBACK_CHAIR__
 *   - la passe DNA pass2 (devenue redondante avec l'init intégral)
 *
 * Le squelette = 100 % DNA de la tête de réf (un squelette EA est toujours
 * cohérent). Chair + Graisse gardent la cascade 4.x (signatures → Farkas →
 * zones Fisher → fallback DNA).
 *
 * Signature inchangée : scanToSliders(landmarks, tddfaResult, skinTone, forcePresetId)
 * Le paramètre tddfaResult n'écrit plus aucun slider — conservé pour ne pas
 * casser les call-sites + pour le stash diag meta.pose3ddfa.
 * ============================================================
 */

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────

const _dist = (a, b) => Math.sqrt(
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
);

// Borne dure 0-100 + arrondi entier — utilisé par la cascade 4.x.
const softClampSlider = (v) => Math.round(Math.min(100, Math.max(0, v)));

// Phase 5.0 — un seul interrupteur de réactivation test :
// si le test in-game montre une perte d'identité nez/mâchoire, passer à true
// pour autoriser groupes+zones à écrire AUSSI sur la famille squelette.
const ALLOW_SQUELETTE_OVERRIDES = false;

// 5.0.2 — groupes autorisés à écrire leur squelette même avec le verrou global.
// Critère d'admission : features Farkas à très haut ICC (nez/narines = 0.96)
// ET distances de match systématiquement < 2. NE PAS y ajouter machoire_menton/
// joues/front (dist 3.5-5, plafond 2D documenté).
const SQUELETTE_OVERRIDE_GROUPS = new Set(['nez', 'narines']);

// Phase 5.0 — clés canoniques 303 (générées depuis slider_ui_order.json,
// avec 2 renommages prod-cohérent pour squelette :
//   crane_neutre_avant      → crane_arriere_avant      (DNA_KEY_MAP)
//   yeux_plus_grande_petite → yeux_arrondi_angulaire   (DNA_KEY_MAP + zone_definitions)
// Sans ces renommages, 82 sliders seraient 'dna_missing' sur TOUS les visages).
// ne pas éditer à la main — régénérer si slider_ui_order.json évolue.
const SLIDER_KEYS_303 = {
  squelette: [
    "crane_reduire_elargir",
    "crane_bas_haut",
    "crane_arriere_avant",
    "crane_arrondi_angulaire",
    "crane_deplacement_gd",
    "crane_couronne_reduire_elargir",
    "crane_couronne_bas_haut",
    "crane_couronne_arriere_avant",
    "crane_couronne_neutre_arrondi",
    "crane_couronne_deplacement_gd",
    "crane_arriere_reduire_elargir",
    "crane_arriere_bas_haut",
    "crane_arriere_arriere_avant",
    "crane_arriere_arrondi_angulaire",
    "crane_arriere_deplacement_gd",
    "tempes_reduire_elargir",
    "tempes_bas_haut",
    "tempes_arriere_avant",
    "tempes_arrondi_angulaire",
    "front_sup_reduire_elargir",
    "front_sup_arriere_avant",
    "front_sup_neutre_haut",
    "front_sup_arrondi_angulaire",
    "front_sup_deplacement_gd",
    "front_inf_reduire_elargir",
    "front_inf_bas_haut",
    "front_inf_arriere_avant",
    "front_inf_arrondi_angulaire",
    "sourcils_reduire_elargir",
    "sourcils_bas_haut",
    "sourcils_arriere_avant",
    "sourcils_arrondi_angulaire",
    "sourcils_central_reduire_elargir",
    "sourcils_central_bas_haut",
    "sourcils_central_arriere_avant",
    "sourcils_central_arrondi_angulaire",
    "sourcils_central_deplacement_gd",
    "sourcils_ext_sup_reduire_elargir",
    "sourcils_ext_sup_bas_haut",
    "sourcils_ext_sup_arriere_avant",
    "sourcils_ext_sup_arrondi_angulaire",
    "yeux_reduire_elargir",
    "yeux_bas_haut",
    "yeux_arriere_avant",
    "yeux_arrondi_angulaire",
    "orbites_reduire_elargir",
    "orbites_bas_haut",
    "orbites_arriere_avant",
    "orbites_plus_grande_petite",
    "nez_reduire_elargir",
    "nez_bas_haut",
    "nez_arriere_avant",
    "nez_arrondi_angulaire",
    "nez_deplacement_gd",
    "arete_nez_cotes_reduire_elargir",
    "arete_nez_cotes_bas_haut",
    "arete_nez_cotes_arriere_avant",
    "arete_nez_cotes_arrondi_angulaire",
    "arete_nez_centrale_reduire_elargir",
    "arete_nez_centrale_bas_haut",
    "arete_nez_centrale_arriere_avant",
    "arete_nez_centrale_arrondi_angulaire",
    "arete_nez_centrale_deplacement_gd",
    "arete_nez_sup_reduire_elargir",
    "arete_nez_sup_bas_haut",
    "arete_nez_sup_arriere_avant",
    "arete_nez_sup_arrondi_angulaire",
    "arete_nez_sup_deplacement_gd",
    "joues_reduire_elargir",
    "joues_bas_haut",
    "joues_arriere_avant",
    "joues_arrondi_angulaire",
    "bouche_reduire_elargir",
    "bouche_bas_haut",
    "bouche_arriere_avant",
    "bouche_arrondi_angulaire",
    "bouche_deplacement_gd",
    "ext_bouche_sup_reduire_elargir",
    "ext_bouche_sup_bas_haut",
    "ext_bouche_sup_arriere_avant",
    "ext_bouche_sup_arrondi_angulaire",
    "menton_reduire_elargir",
    "menton_bas_haut",
    "menton_arriere_avant",
    "menton_arrondi_angulaire",
    "menton_deplacement_gd",
    "menton_sup_reduire_elargir",
    "menton_sup_bas_haut",
    "menton_sup_arriere_avant",
    "menton_sup_arrondi_angulaire",
    "menton_sup_deplacement_gd",
    "machoire_reduire_elargir",
    "machoire_bas_haut",
    "machoire_arriere_avant",
    "machoire_arrondi_angulaire",
    "maxillaire_reduire_elargir",
    "maxillaire_bas_haut",
    "maxillaire_arriere_avant",
    "maxillaire_arrondi_angulaire",
    "mandibule_reduire_elargir",
    "mandibule_bas_haut",
    "mandibule_arriere_avant",
    "mandibule_arrondi_angulaire"
  ],
  chair: [
    "tempes_moins_plus",
    "sourcils_central_bas_haut",
    "sourcils_central_moins_plus",
    "espace_sourcils_bas_haut",
    "espace_sourcils_moins_plus",
    "pli_paupieres_central_reduire_elargir",
    "pli_paupieres_central_bas_haut",
    "pli_paupieres_central_arriere_avant",
    "pli_paupieres_central_plus_petite",
    "pli_paupieres_ext_reduire_elargir",
    "pli_paupieres_ext_bas_haut",
    "pli_paupieres_ext_arriere_avant",
    "pli_paupieres_ext_plus_petite",
    "pli_paupieres_int_reduire_elargir",
    "pli_paupieres_int_bas_haut",
    "pli_paupieres_int_arriere_avant",
    "pli_paupieres_int_plus_petite",
    "paupiere_inf_centrale_reduire_elargir",
    "paupiere_inf_centrale_bas_haut",
    "paupiere_inf_centrale_plus_petite",
    "paupiere_inf_ext_reduire_elargir",
    "paupiere_inf_ext_bas_haut",
    "paupiere_inf_ext_plus_petite",
    "paupiere_inf_int_reduire_elargir",
    "paupiere_inf_int_bas_haut",
    "paupiere_inf_int_plus_petite",
    "paupiere_sup_centrale_reduire_elargir",
    "paupiere_sup_centrale_bas_haut",
    "paupiere_sup_centrale_neutre_avant",
    "paupiere_sup_centrale_plus_petite",
    "paupiere_sup_ext_reduire_elargir",
    "paupiere_sup_ext_bas_haut",
    "paupiere_sup_ext_plus_petite",
    "paupiere_sup_int_reduire_elargir",
    "paupiere_sup_int_bas_haut",
    "paupiere_sup_int_plus_petite",
    "coin_oeil_ext_reduire_elargir",
    "coin_oeil_ext_bas_haut",
    "coin_oeil_ext_plus_petite",
    "coin_oeil_int_reduire_elargir",
    "coin_oeil_int_bas_haut",
    "coin_oeil_int_plus_petite",
    "narine_sup_reduire_elargir",
    "narine_sup_bas_haut",
    "narine_sup_arriere_avant",
    "narine_sup_arrondi_angulaire",
    "narine_sup_ext_reduire_elargir",
    "narine_sup_ext_bas_haut",
    "narine_sup_ext_arriere_avant",
    "narine_sup_ext_arrondi_angulaire",
    "narine_sup_centrale_reduire_elargir",
    "narine_sup_centrale_bas_haut",
    "narine_sup_centrale_arriere_avant",
    "narine_sup_centrale_arrondi_angulaire",
    "narine_inf_reduire_elargir",
    "narine_inf_bas_haut",
    "narine_inf_arriere_avant",
    "narine_inf_arrondi_angulaire",
    "ext_narine_ext_reduire_elargir",
    "ext_narine_ext_bas_haut",
    "ext_narine_ext_arriere_avant",
    "ext_narine_ext_arrondi_angulaire",
    "ext_narine_centrale_reduire_elargir",
    "ext_narine_centrale_bas_haut",
    "ext_narine_centrale_arriere_avant",
    "ext_narine_centrale_arrondi_angulaire",
    "pointe_nez_sup_reduire_elargir",
    "pointe_nez_sup_bas_haut",
    "pointe_nez_sup_arriere_avant",
    "pointe_nez_sup_arrondi_angulaire",
    "pointe_nez_sup_deplacement_gd",
    "pointe_nez_sous_jacente_reduire_elargir",
    "pointe_nez_sous_jacente_bas_haut",
    "pointe_nez_sous_jacente_arriere_avant",
    "pointe_nez_sous_jacente_arrondi_angulaire",
    "pointe_nez_sous_jacente_deplacement_gd",
    "pointe_nez_inf_reduire_elargir",
    "pointe_nez_inf_bas_haut",
    "pointe_nez_inf_arriere_avant",
    "pointe_nez_inf_arrondi_angulaire",
    "pointe_nez_inf_deplacement_gd",
    "joues_bas_haut",
    "joues_moins_plus",
    "joues_ext_sup_moins_plus",
    "joues_yeux_int_sup_bas_haut",
    "joues_yeux_int_sup_moins_plus",
    "joues_int_sup_moins_plus",
    "joues_ext_inf_neutre_moins",
    "joues_int_inf_neutre_moins",
    "commissures_levres_reduire_elargir",
    "commissures_levres_bas_haut",
    "commissures_levres_arriere_avant",
    "commissures_levres_arrondi_angulaire",
    "espacement_levres_centre_reduire_elargir",
    "espacement_levres_centre_bas_haut",
    "espacement_levres_centre_arriere_avant",
    "espacement_levres_centre_arrondi_angulaire",
    "espacement_levres_cotes_reduire_elargir",
    "espacement_levres_cotes_bas_haut",
    "espacement_levres_cotes_arriere_avant",
    "espacement_levres_cotes_arrondi_angulaire",
    "levre_sup_centre_sup_reduire_elargir",
    "levre_sup_centre_sup_bas_haut",
    "levre_sup_centre_sup_arriere_avant",
    "levre_sup_centre_sup_arrondi_angulaire",
    "levre_sup_centre_sup_deplacement_gd",
    "levre_sup_cotes_sup_reduire_elargir",
    "levre_sup_cotes_sup_bas_haut",
    "levre_sup_cotes_sup_arriere_avant",
    "levre_sup_cotes_sup_arrondi_angulaire",
    "levre_sup_coins_sup_reduire_elargir",
    "levre_sup_coins_sup_bas_haut",
    "levre_sup_coins_sup_arriere_avant",
    "levre_sup_coins_sup_arrondi_angulaire",
    "levre_sup_centre_inf_reduire_elargir",
    "levre_sup_centre_inf_bas_haut",
    "levre_sup_centre_inf_arriere_avant",
    "levre_sup_centre_inf_arrondi_angulaire",
    "levre_sup_centre_inf_deplacement_gd",
    "levre_sup_cotes_inf_reduire_elargir",
    "levre_sup_cotes_inf_bas_haut",
    "levre_sup_cotes_inf_arriere_avant",
    "levre_sup_cotes_inf_arrondi_angulaire",
    "epaisseur_levre_sup_reduire_elargir",
    "epaisseur_levre_sup_bas_haut",
    "epaisseur_levre_sup_arriere_avant",
    "epaisseur_levre_sup_arrondi_angulaire",
    "philtrum_reduire_elargir",
    "philtrum_bas_haut",
    "philtrum_arriere_avant",
    "philtrum_arrondi_angulaire",
    "philtrum_deplacement_gd",
    "epaisseur_levre_inf_reduire_elargir",
    "epaisseur_levre_inf_bas_haut",
    "epaisseur_levre_inf_arriere_avant",
    "epaisseur_levre_inf_arrondi_angulaire",
    "levre_inf_centre_sup_reduire_elargir",
    "levre_inf_centre_sup_bas_haut",
    "levre_inf_centre_sup_arriere_avant",
    "levre_inf_centre_sup_arrondi_angulaire",
    "levre_inf_centre_sup_deplacement_gd",
    "levre_inf_cotes_sup_reduire_elargir",
    "levre_inf_cotes_sup_bas_haut",
    "levre_inf_cotes_sup_arriere_avant",
    "levre_inf_cotes_sup_arrondi_angulaire",
    "levre_inf_centre_inf_reduire_elargir",
    "levre_inf_centre_inf_bas_haut",
    "levre_inf_centre_inf_arriere_avant",
    "levre_inf_centre_inf_arrondi_angulaire",
    "levre_inf_centre_inf_deplacement_gd",
    "levre_inf_cotes_inf_reduire_elargir",
    "levre_inf_cotes_inf_bas_haut",
    "levre_inf_cotes_inf_arriere_avant",
    "levre_inf_cotes_inf_arrondi_angulaire",
    "levre_inf_coins_inf_reduire_elargir",
    "levre_inf_coins_inf_bas_haut",
    "levre_inf_coins_inf_arriere_avant",
    "levre_inf_coins_inf_arrondi_angulaire",
    "plis_coin_bouche_neutre_moins",
    "fossette_mentonniere_bas_haut",
    "fossette_mentonniere_deplacement_gd",
    "menton_cotes_neutre_moins",
    "machoire_moins_plus"
  ],
  graisse: [
    "haut_cou_bas_haut",
    "haut_cou_moins_plus",
    "front_centre_bas_haut",
    "front_centre_moins_plus",
    "front_cotes_bas_haut",
    "front_cotes_moins_plus",
    "paupiere_sup_bas_haut",
    "paupiere_sup_moins_plus",
    "paupiere_inf_bas_haut",
    "paupiere_inf_moins_plus",
    "cernes_inf_bas_haut",
    "cernes_inf_moins_plus",
    "nez_moins_plus",
    "joues_sup_bas_haut",
    "joues_sup_moins_plus",
    "joues_inf_bas_haut",
    "joues_inf_moins_plus",
    "bajoue_bas_haut",
    "bajoue_moins_plus",
    "joues_int_sup_bas_haut",
    "joues_int_sup_moins_plus",
    "joues_int_inf_bas_haut",
    "joues_int_inf_moins_plus",
    "tempes_bas_haut",
    "tempes_moins_plus",
    "cotes_bouche_bas_haut",
    "cotes_bouche_moins_plus",
    "levres_sup_bas_haut",
    "levres_sup_moins_plus",
    "levres_inf_bas_haut",
    "levres_inf_moins_plus",
    "menton_bas_haut",
    "menton_moins_plus",
    "sous_menton_bas_haut",
    "sous_menton_moins_plus",
    "machoire_bas_haut",
    "machoire_moins_plus"
  ]
};

// Assertion runtime (sans throw — fail-soft).
(function _assertSliderKeys() {
  const counts = {
    squelette: SLIDER_KEYS_303.squelette.length,
    chair: SLIDER_KEYS_303.chair.length,
    graisse: SLIDER_KEYS_303.graisse.length,
  };
  if (counts.squelette !== 103 || counts.chair !== 163 || counts.graisse !== 37) {
    console.error('[5.0] SLIDER_KEYS_303 counts inattendus:', counts);
  }
})();

// ─────────────────────────────────────────────
// FONCTION PRINCIPALE
// ─────────────────────────────────────────────

function scanToSliders(landmarks, tddfaResult = null, skinTone = 'Foncée', forcePresetId = null) {
  const L = landmarks;

  // ── Références de normalisation (utilisées par meta + 3DDFA diag) ──
  const D_W = _dist(L[234], L[454]); // Largeur faciale zygomatique
  const D_H = _dist(L[10],  L[152]); // Hauteur crânio-mentonnière
  const mouthOpen = _dist(L[13], L[14]) / D_H > 0.04;

  const results = {
    squelette: {},
    chair:     {},
    graisse:   {},
    _meta: { D_W, D_H, mouthOpen }
  };

  const S    = results.squelette;
  const C    = results.chair;
  const G    = results.graisse;
  const meta = results._meta;

  // _sources : marqueur par slider (utilisé par script_spa.getVal pour le
  // badge AI/P9 à l'étape 4). Sources Phase 5.0 :
  //   'dna'                 = init DNA de la tête de réf (lookupPresetDNAByFamily)
  //   'dna_missing'         = lookup retourné non-finite → fallback 50
  //   'neutral'             = bestPreset null → tout à 50
  //   'group:<groupKey>'    = écriture par cascade groupes 4.2/4.3
  //   'zone:<zoneKey>'      = écriture par cascade zones 4.0/4.1
  S._sources = {}; C._sources = {}; G._sources = {};

  // ════════════════════════════════════════════
  // 1) MATCHING — sélection de la tête de réf
  // ════════════════════════════════════════════
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
      meta.zoneMix       = (res && res.zoneMix) ? res.zoneMix : null;
      // Phase 5.0 — diag contour gate.
      meta.contourUser        = res ? res.contourUser || null : null;
      meta.contourTop         = res ? res.contourTop || [] : [];
      meta.contourTopOfficial = res ? res.contourTopOfficial || [] : [];
    }
  } catch (e) { console.warn('[matching] échec, fallback neutre:', e); }

  // Override manuel : un clic sur une alternative impose un preset précis.
  if (forcePresetId && window.PRESETS_DB) {
    const forced = window.PRESETS_DB.find(p => p.preset_id === forcePresetId);
    if (forced) {
      bestPreset = forced;
      if (forced.entry_type !== 'celebrity') bestOfficial = forced;
    }
  }

  meta.bestPresetId          = bestPreset ? bestPreset.preset_id    : null;
  meta.bestPresetPosition    = bestPreset ? bestPreset.position     : null;
  meta.bestPresetForme       = bestPreset ? bestPreset.forme_visage : null;
  meta.bestPresetCarnation   = bestPreset ? bestPreset.couleur_peau : null;
  meta.bestPresetDisplayName = bestPreset ? (bestPreset.display_name || null) : null;
  meta.bestPresetEntryType   = bestPreset ? (bestPreset.entry_type   || null) : null;
  meta.topPresets            = topPresetsArr;
  meta.bestOfficialId        = bestOfficial ? bestOfficial.preset_id    : null;
  meta.bestOfficialPosition  = bestOfficial ? bestOfficial.position     : null;
  meta.bestOfficialForme     = bestOfficial ? bestOfficial.forme_visage : null;
  meta.bestOfficialCarnation = bestOfficial ? bestOfficial.couleur_peau : null;
  meta.officialTopPresets    = officialTopPresetsArr;
  console.log('[5.0] ref=', meta.bestPresetId, meta.bestPresetForme, meta.bestPresetCarnation,
              '| official:', meta.bestOfficialId,
              '| contourTop=', (meta.contourTop || []).map(t => t.id));

  // ════════════════════════════════════════════
  // 2) INIT DNA INTÉGRAL — les 303 sliders en une passe
  // ════════════════════════════════════════════
  const FAMILY_OBJS = [
    ['squelette', S],
    ['chair',     C],
    ['graisse',   G],
  ];
  const dnaMissing = [];
  let dnaOk = 0;
  const _hasLookup = (typeof window !== 'undefined' && typeof window.lookupPresetDNAByFamily === 'function');

  if (!bestPreset || !_hasLookup) {
    // bestPreset null OU lookup indisponible → tout à 50 source 'neutral'.
    for (const [fam, obj] of FAMILY_OBJS) {
      for (const k of SLIDER_KEYS_303[fam]) {
        obj[k] = 50;
        obj._sources[k] = 'neutral';
      }
    }
    console.warn('[5.0] init: bestPreset null OU lookup indisponible → 303 sliders neutres');
  } else {
    for (const [fam, obj] of FAMILY_OBJS) {
      for (const k of SLIDER_KEYS_303[fam]) {
        const v = window.lookupPresetDNAByFamily(bestPreset, fam, k);
        if (Number.isFinite(v)) {
          obj[k] = v;
          obj._sources[k] = 'dna';
          dnaOk++;
        } else {
          obj[k] = 50;
          obj._sources[k] = 'dna_missing';
          dnaMissing.push(`${fam}:${k}`);
        }
      }
    }
    if (dnaMissing.length) {
      console.warn(`[5.0] dna_missing (${dnaMissing.length}) →`, dnaMissing.slice(0, 20),
                   dnaMissing.length > 20 ? '...' : '');
    }
  }
  meta.dna_missing = dnaMissing;

  // ════════════════════════════════════════════
  // 3) CASCADE GROUPES 4.2/4.3 + ZONES 4.0/4.1 — INTACTE
  //    Skip squelette derrière ALLOW_SQUELETTE_OVERRIDES (Phase 5.0).
  // ════════════════════════════════════════════
  const _ds_stats = {
    dna: dnaOk,
    dna_missing: dnaMissing.length,
    group: 0,
    zone: 0,
    group_squelette_skipped: 0,
    group_squelette_whitelist: 0,
    zone_squelette_skipped: 0,
  };

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
      const _validityZones = (window._zoneValidity && window._zoneValidity.zones) || null;
      const _globalMorpho = bestPreset ? bestPreset.preset_id : null;
      let _blindCount = 0;

      const _isBlindZoneScan = (zoneKey, validityZones) => {
        if (!validityZones) return false;
        const z = validityZones[zoneKey];
        return !!(z && z.status === 'aveugle');
      };

      window.lastUserAttrs = userAttrs;

      // Phase 4.3 : features Farkas (calculées une fois)
      let userFarkas = null;
      if (typeof window.computeFarkasFeatures === 'function' && window._farkasFeatures) {
        try {
          userFarkas = window.computeFarkasFeatures(landmarks);
        } catch (e) {
          console.warn('[Phase 4.3] computeFarkasFeatures fail:', e && e.message ? e.message : e);
        }
        if (userFarkas) meta.farkas_user = userFarkas;
      }

      const groupResults = {};
      const subtabToGroup = {};
      const groupedSubtabs = new Set();
      const userGroupSignatures = {};
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
          if (!gres && userFarkas && farkRoot && farkRoot[gKey]
              && typeof window.matchGroupByFarkas === 'function') {
            try {
              gres = window.matchGroupByFarkas(gKey, userFarkas, window.PRESETS_DB);
            } catch (e) {
              console.warn(`[Phase 4.3] farkas ${gKey} fail:`, e && e.message ? e.message : e);
            }
            if (gres) mode = 'farkas';
          }
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
            if (_isBlindZoneScan(z, _validityZones)) continue;
            groupedSubtabs.add(z);
          }
        }

        // visage_global diagnostique (jamais d'écriture sliders)
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
                      '| signature:', sigCount, '| farkas:', farkCount,
                      '| aggregation:', aggCount, '| zones covered:', groupedSubtabs.size);
        }
        if (Object.keys(userGroupSignatures).length) {
          meta.group_signatures = userGroupSignatures;
        }
      }

      // Applique le DNA du preset de groupe à une zone (cascade 4.2/4.3).
      // Phase 5.0 : skip si family === 'squelette' et !ALLOW_SQUELETTE_OVERRIDES.
      // 5.0.2 : whitelist par groupe (SQUELETTE_OVERRIDE_GROUPS) lève le skip
      // pour les groupes à très haut ICC (nez/narines). Le verrou global reste
      // intact pour tous les autres groupes (machoire_menton/joues/front/etc.).
      // _whitelistedByGroup agrège pour un log unique par groupe à la fin.
      const _whitelistedByGroup = {}; // { groupKey: { n, presetId } }
      const _applyGroupPresetToZone = (groupKey, zoneKey, def, target) => {
        const gr = groupResults[groupKey];
        if (!gr || !gr.preset) return null;
        const family = def.family;
        const isSqueletteWhitelisted = (family === 'squelette'
                                        && SQUELETTE_OVERRIDE_GROUPS.has(groupKey));
        if (family === 'squelette' && !ALLOW_SQUELETTE_OVERRIDES && !isSqueletteWhitelisted) {
          _ds_stats.group_squelette_skipped++;
          return 0;
        }
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
          if (isSqueletteWhitelisted) {
            _ds_stats.group_squelette_whitelist++;
            if (!_whitelistedByGroup[groupKey]) {
              _whitelistedByGroup[groupKey] = { n: 0, presetId: gr.preset_id };
            }
            _whitelistedByGroup[groupKey].n++;
          }
          _ds_stats.group++;
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
          // Diag : zone aveugle hérite du preset global (DNA init). On garde
          // l'entrée meta pour le badge UI APPROX, mais aucune écriture.
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
        // Sinon : matching individuel comme avant.
        // Phase 5.0 : skip écriture squelette si flag false.
        const isSqueletteSkipped = (def.family === 'squelette' && !ALLOW_SQUELETTE_OVERRIDES);
        let r = null;
        try {
          r = window.matchZoneByStats(userAttrs, zoneKey, window.PRESETS_DB);
        } catch (e) {
          console.warn(`[Phase 4.0] zone ${zoneKey} match fail:`, e && e.message ? e.message : e);
        }
        if (!r) continue;
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
          source: isSqueletteSkipped ? 'skipped_squelette'
                : (groupKey ? 'zone_match_escaped' : 'zone_match'),
          group: groupKey || undefined,
        };
        if (isSqueletteSkipped) {
          _ds_stats.zone_squelette_skipped++;
          continue;
        }
        if (!r.sliders) continue;
        for (const sk in r.sliders) {
          const v = softClampSlider(r.sliders[sk]);
          target[sk] = v;
          if (target._sources) target._sources[sk] = `zone:${zoneKey}`;
          zoneCoveredSliders.add(`${def.family}:${sk}`);
          _ds_stats.zone++;
        }
      }
      if (Object.keys(zoneResults).length) {
        _ds_stats.zone_matches         = Object.keys(zoneResults).length;
        _ds_stats.zone_covered_sliders = zoneCoveredSliders.size;
        _ds_stats.zone_blind_fallback  = _blindCount;
        _ds_stats.zone_grouped         = _groupedZoneCount;
        _ds_stats.groups_matched       = Object.keys(groupResults).length;
        meta.zone_matches              = zoneResults;
        console.log('[Phase 4.0] zones matched:', Object.keys(zoneResults).length,
                    '| blind→global:', _blindCount,
                    '| group-covered:', _groupedZoneCount,
                    '| sliders overridden:', zoneCoveredSliders.size);
      }
      // 5.0.2 — log unique par groupe whitelisté ayant écrit des sliders squelette.
      for (const gKey in _whitelistedByGroup) {
        const wb = _whitelistedByGroup[gKey];
        console.log('[5.0.2] squelette whitelist:', gKey,
                    '→', wb.n, 'sliders depuis preset', wb.presetId);
      }
    }
  }

  // ════════════════════════════════════════════
  // 4) DEBUG HOOK — snapshot pré-finalisation
  // ════════════════════════════════════════════
  if (typeof window !== 'undefined' && window.__SMF_DEBUG_CAPTURE_PRE_DNA__) {
    results._pre_dna_snapshot = {
      squelette: JSON.parse(JSON.stringify(S)),
      chair:     JSON.parse(JSON.stringify(C)),
      graisse:   JSON.parse(JSON.stringify(G)),
    };
  }

  // ════════════════════════════════════════════
  // 5) FINALISATION — méta + diag pose 3DDFA
  // ════════════════════════════════════════════
  meta.source_counts = _ds_stats;
  // identityCoverage = % de sliders sourcés zone:/group: (la part « identité mesurée »).
  // Remplace coverageRate/autoCount (Phase 5.0).
  const identityWritten = _ds_stats.zone + _ds_stats.group;
  meta.identityCoverage = Math.round((identityWritten / 303) * 100);

  // Diag pose 3DDFA : tddfaResult/window._lastTddfa restent stockés pour diag,
  // mais n'écrivent plus aucun slider en Phase 5.0.
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
      shape: _tddfa.shape ? Array.from(_tddfa.shape) : null,
      expr:  _tddfa.expr  ? Array.from(_tddfa.expr)  : null,
    };
  }

  if (typeof window !== 'undefined') window.lastScanResult = results;
  console.log('[5.0] sources:', _ds_stats, '| identityCoverage:', meta.identityCoverage + '%');

  return results;
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scanToSliders };
}

// Expose globalement pour script_spa.js
if (typeof window !== 'undefined') {
  window.scanToSliders = scanToSliders;
}
