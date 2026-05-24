// presetMatch.js — Matching preset par carnation + 9 zones pondérées
// Code copié EXACTEMENT depuis OLD_script.js (les 9 entités listées dans la consigne)
// + lookupPresetDNA (copié depuis lookupPresetDNA.js)
// Charge AVANT scanToSliders_v6.js, après PRESETS_DB_v3.js.

// ─── SEMANTIC_INDEX (OLD_script.js l.3165) ──────────────────────────────────
const SEMANTIC_INDEX = {
    skull_top:       10,
    temple_left:     21,
    temple_right:    251,
    jaw_angle_left:  172,
    jaw_angle_right: 397,
    chin_tip:        152,
    brow_left_peak:  105,
    brow_right_peak: 334,
    eye_left_outer:  33,
    eye_left_inner:  133,
    eye_right_inner: 362,
    eye_right_outer: 263,
    eyelid_left:     159,
    eyelid_right:    386,
    nose_bridge:     6,
    nose_tip:        4,
    nose_base:       2,
    nose_left:       129,
    nose_right:      358,
    cheek_left:      234,
    cheek_right:     454,
    mouth_top:       0,
    mouth_bottom:    17,
    mouth_left:      61,
    mouth_right:     291,
};

// ─── relDist / midPoint (OLD_script.js l.3858/3863) ─────────────────────────
function relDist(points, a, b) {
    if (!points[a] || !points[b]) return 0;
    return Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y);
}

function midPoint(points, a, b) {
    if (!points[a] || !points[b]) return { x: 0, y: 0 };
    return { x: (points[a].x + points[b].x) / 2, y: (points[a].y + points[b].y) / 2 };
}

// ─── calculateMixAttributes (OLD_script.js l.3868) ──────────────────────────
function calculateMixAttributes(rawPoints) {
    // Convertit les points indexés (clé = index MP) en noms sémantiques
    const points = {};
    Object.entries(SEMANTIC_INDEX).forEach(([name, idx]) => {
        const p = rawPoints[String(idx)];
        if (p) points[name] = p;
    });
    // brow_center dérivé si absent
    if (!points.brow_center) {
        points.brow_center = midPoint(points, 'brow_left_peak', 'brow_right_peak');
    }

    const faceHeight  = relDist(points, 'skull_top', 'chin_tip') || 1;
    const faceWidth   = relDist(points, 'temple_left', 'temple_right') || 1;
    const jawWidth    = relDist(points, 'jaw_angle_left', 'jaw_angle_right');
    const browWidth   = relDist(points, 'brow_left_peak', 'brow_right_peak');
    const eyeSpan     = relDist(points, 'eye_left_outer', 'eye_right_outer');
    const noseWidth   = relDist(points, 'nose_left', 'nose_right');
    const mouthWidth  = relDist(points, 'mouth_left', 'mouth_right');
    const mouthHeight = relDist(points, 'mouth_top', 'mouth_bottom');
    const chinToMouth = relDist(points, 'mouth_bottom', 'chin_tip');
    const cheekWidth  = relDist(points, 'cheek_left', 'cheek_right');
    const browCenter  = points.brow_center || midPoint(points, 'brow_left_peak', 'brow_right_peak');
    const eyelidMid   = midPoint(points, 'eyelid_left', 'eyelid_right');
    const eyeCenter   = (eyelidMid.x || eyelidMid.y) ? eyelidMid : midPoint(points, 'eye_left_inner', 'eye_right_inner');

    return {
        base: {
            width: faceWidth / faceHeight,
            height: faceHeight,
            volume: cheekWidth / faceWidth
        },
        front: {
            height: relDist(points, 'skull_top', 'brow_center') / faceHeight,
            width: browWidth / faceWidth
        },
        sourcils: {
            width: browWidth / faceWidth,
            height: Math.abs(browCenter.y - eyeCenter.y) / faceHeight,
            angle: ((points.brow_right_peak?.y || 0) - (points.brow_left_peak?.y || 0)) / faceHeight
        },
        yeux: {
            width: eyeSpan / faceWidth,
            spacing: relDist(points, 'eye_left_inner', 'eye_right_inner') / faceWidth,
            height: Math.abs(eyeCenter.y - browCenter.y) / faceHeight
        },
        nez: {
            width: noseWidth / faceWidth,
            height: relDist(points, 'nose_bridge', 'nose_tip') / faceHeight,
            projection: relDist(points, 'nose_base', 'mouth_top') / faceHeight
        },
        joues: {
            width: cheekWidth / faceWidth,
            height: Math.abs(((points.cheek_left?.y || 0) + (points.cheek_right?.y || 0)) / 2 - (points.nose_tip?.y || 0)) / faceHeight,
            volume: cheekWidth / jawWidth
        },
        bouche: {
            width: mouthWidth / faceWidth,
            height: mouthHeight / faceHeight,
            // placeholder - will be replaced below with normalized area ratio
            volume: mouthHeight / (mouthWidth || 1)
        },
        menton: {
            height: chinToMouth / faceHeight,
            width: relDist(points, 'jaw_angle_left', 'jaw_angle_right') / faceWidth
        },
        machoire: {
            width: jawWidth / faceWidth,
            height: Math.abs(((points.jaw_angle_left?.y || 0) + (points.jaw_angle_right?.y || 0)) / 2 - (points.chin_tip?.y || 0)) / faceHeight,
            angle: (() => {
                const chin = points.chin_tip;
                const jawL = points.jaw_angle_left;
                const jawR = points.jaw_angle_right;
                if (!chin || !jawL || !jawR) return 0;
                // Angle gauche : atan2(diffY, diffX) entre mâchoire_gauche et menton
                // diffY positif = mâchoire au-dessus du menton (remonte vers oreille)
                const diffY_g = chin.y - jawL.y; // positif quand mâchoire est au-dessus
                const diffX_g = chin.x - jawL.x; // horizontal gauche→centre
                const angle_g = Math.abs(Math.atan2(diffY_g, diffX_g));
                // Angle droit (symétrique)
                const diffY_d = chin.y - jawR.y;
                const diffX_d = jawR.x - chin.x;
                const angle_d = Math.abs(Math.atan2(diffY_d, diffX_d));
                // Moyenne, normalisée sur 0-1 (90° = 1)
                return ((angle_g + angle_d) / 2) / (Math.PI / 2);
            })()
        }
    };
}
window.calculateMixAttributes = calculateMixAttributes;

// ─── augmentAttributesWithCustomMetrics (OLD_script.js l.3960) ──────────────
// Post-process augmentation: compute mouth area ratio and nostrils size ratio
function augmentAttributesWithCustomMetrics(rawPoints, attributes) {
    if (!attributes || !rawPoints) return attributes;

    // helper to get point by raw index
    const byIndex = idx => rawPoints[String(idx)];
    const distIdx = (a, b) => {
        const A = byIndex(a); const B = byIndex(b);
        if (!A || !B) return 0;
        return Math.hypot(A.x - B.x, A.y - B.y);
    };

    // Mouth area (compute raw distances from MediaPipe indices)
    // mouth_left:61, mouth_right:291, mouth_top:0, mouth_bottom:17
    const mouthWidthRaw = distIdx(61, 291) || 0;
    const mouthHeightRaw = distIdx(0, 17) || 0;
    const mouthAreaRaw = (mouthWidthRaw * mouthHeightRaw) * 0.7;

    // Face total area for normalization: distance(pommete_gauche, pomette_droite) * distance(front_haut, menton)
    // pommete_gauche = index 234, pomette_droite = 454, front_haut = index 10, menton = index 152
    const faceWidthRaw = distIdx(234, 454) || 1;
    const faceHeightRaw = distIdx(10, 152) || 1;
    const faceAreaTotal = faceWidthRaw * faceHeightRaw || 1;

    const bouche_volume_ratio = mouthAreaRaw / faceAreaTotal;

    // Narines size: sums of segments
    // Left: narine_interne_gauche(238) -> narine_sommet_gauche(237) -> narine_externe_gauche(75)
    const leftSum = distIdx(238, 237) + distIdx(237, 75);
    // Right: narine_interne_droite(458) -> narine_sommet_droit(457) -> narine_externe_droite(305)
    const rightSum = distIdx(458, 457) + distIdx(457, 305);
    const narinesBrut = (leftSum + rightSum) / 2;
    const narines_taille_ratio = narinesBrut / (faceWidthRaw || 1);

    // Attach into attributes for UI: replace bouche.volume and add nez.volume
    if (!attributes.bouche) attributes.bouche = {};
    attributes.bouche.volume = bouche_volume_ratio;

    if (!attributes.nez) attributes.nez = {};
    attributes.nez.volume = narines_taille_ratio;

    // ── Nez : métriques width / height / projection / volume ────────────

    // 1. Largeur : dist(narine_externe_gauche[75], narine_externe_droite[305])
    //              / dist(pommete_gauche[234], pomette_droite[454])
    const face_larg      = distIdx(234, 454) || 1;
    attributes.nez.width = distIdx(75, 305) / face_larg;

    // 2. Hauteur : baseY = moy(narine_interne_gauche[238].y, narine_interne_droite[458].y)
    //              hauteur_brute = baseY − nez_sommet_haut[6].y
    //              / dist(front_haut[10], menton[152])
    const pt_nar_int_g = byIndex(238);  // narine_interne_gauche
    const pt_nar_int_d = byIndex(458);  // narine_interne_droite
    const pt_sommet    = byIndex(6);    // nez_sommet_haut
    const face_haut    = distIdx(10, 152) || 1;
    let nez_haut_brut  = 0;
    if (pt_nar_int_g && pt_nar_int_d && pt_sommet) {
        const baseY   = (pt_nar_int_g.y + pt_nar_int_d.y) / 2;
        nez_haut_brut = Math.abs(baseY - pt_sommet.y);
    }
    attributes.nez.height = nez_haut_brut / face_haut;

    // 3. Projection : voûte de narine (points 79 / 237 côté gauche, 309 / 457 côté droit)
    //    Côté gauche : point le plus haut (y min) entre narine_sommet_gauche[237] et narine_sommet_gauche_2[79]
    //    vault_g = narine_interne_gauche[238].y − min(237.y, 79.y)
    //    Côté droit  : point le plus haut entre narine_sommet_droit[457] et narine_sommet_droite_2[309]
    //    vault_d = narine_interne_droite[458].y − min(457.y, 309.y)
    //    projection  = moy(vault_g, vault_d) / hauteur_brute_nez
    const pt_som_g  = byIndex(237); // narine_sommet_gauche
    const pt_som_g2 = byIndex(79);  // narine_sommet_gauche_2
    const pt_som_d  = byIndex(457); // narine_sommet_droit
    const pt_som_d2 = byIndex(309); // narine_sommet_droite_2
    let nez_projection = 0;
    if (pt_nar_int_g && pt_nar_int_d && (pt_som_g || pt_som_g2) && (pt_som_d || pt_som_d2)) {
        const topG   = Math.min(pt_som_g  ? pt_som_g.y  : Infinity, pt_som_g2 ? pt_som_g2.y : Infinity);
        const topD   = Math.min(pt_som_d  ? pt_som_d.y  : Infinity, pt_som_d2 ? pt_som_d2.y : Infinity);
        const vault_g = pt_nar_int_g.y - topG;
        const vault_d = pt_nar_int_d.y - topD;
        const avg_vault = (vault_g + vault_d) / 2;
        nez_projection = avg_vault / (nez_haut_brut || 1);
    }
    attributes.nez.projection = nez_projection;

    // 4. Volume : aire estimée = (largeur_ailes * hauteur_brute) / 2
    //             largeur_ailes = dist(nez_aile_gauche[294], nez_aile_droite[64])
    //             / aire_visage(face_larg * face_haut)
    const largeur_ailes    = distIdx(294, 64); // nez_aile_gauche → nez_aile_droite
    const aire_nez         = (largeur_ailes * nez_haut_brut) / 2;
    const aire_visage      = face_larg * faceHeightRaw || 1;
    attributes.nez.volume  = aire_nez / aire_visage;

    // 5. Périmètre moyen des narines
    //    Gauche : dist(238,237) + dist(237,79) + dist(79,75) + dist(75,238)
    //             narine_interne_gauche → narine_sommet_gauche → narine_sommet_gauche_2 → narine_externe_gauche → narine_interne_gauche
    const perim_g = distIdx(238, 237)  // narine_interne_gauche → narine_sommet_gauche
                  + distIdx(237, 79)   // narine_sommet_gauche  → narine_sommet_gauche_2
                  + distIdx(79,  75)   // narine_sommet_gauche_2 → narine_externe_gauche
                  + distIdx(75,  238); // narine_externe_gauche  → narine_interne_gauche (base)

    //    Droite : dist(458,457) + dist(457,309) + dist(309,305) + dist(305,458)
    //             narine_interne_droite → narine_sommet_droit → narine_sommet_droite_2 → narine_externe_droite → narine_interne_droite
    const perim_d = distIdx(458, 457)  // narine_interne_droite → narine_sommet_droit
                  + distIdx(457, 309)  // narine_sommet_droit    → narine_sommet_droite_2
                  + distIdx(309, 305)  // narine_sommet_droite_2 → narine_externe_droite
                  + distIdx(305, 458); // narine_externe_droite  → narine_interne_droite (base)

    const perim_moyen = (perim_g + perim_d) / 2;
    attributes.nez.narine = perim_moyen / (face_larg || 1);

    return attributes;
}

// ─── normalizeSkinToneLabel (OLD_script.js l.601) ───────────────────────────
function normalizeSkinToneLabel(skinTone) {
  const skinToneAliases = {
    'skin.tone.very.light': 'Claire',
    'skin.tone.light': 'Claire',
    'skin.tone.light.tanned': 'Claire-bronzée',
    'skin.tone.medium': 'Métis',
    'skin.tone.dark': 'Foncée',
    'skin.tone.very.dark': 'Très foncée'
  };
  return skinToneAliases[skinTone] ?? skinTone;
}

// ─── EUCLIDEAN DISTANCE CALCULATION FOR SCANNED_STATS ──────────────────────
/**
 * Calcule la distance euclidienne entre deux catégories de features
 * @param {Object} userCat - Catégorie de l'utilisateur (ex: user.nez)
 * @param {Object} presetCat - Catégorie du preset (ex: preset.scanned_stats.nez)
 * @param {string} categoryName - Nom de la catégorie ('nez', 'machoire', 'menton', 'yeux', etc.)
 * @returns {number} Distance pondérée
 */
function calculateCategoryDistance(userCat, presetCat, categoryName) {
  if (!userCat || !presetCat) return 0;

  let distance = 0;
  const keys = Object.keys(userCat);

  for (const key of keys) {
    if (typeof userCat[key] === 'number' && typeof presetCat[key] === 'number') {
      distance += Math.abs(userCat[key] - presetCat[key]);
    }
  }

  // Pondérations : nez 2.0x, machoire/menton/yeux 1.5x, autres 1.0x
  const weight = categoryName === 'nez' ? 2.0 :
                 (categoryName === 'machoire' || categoryName === 'menton' || categoryName === 'yeux') ? 1.5 :
                 1.0;

  return distance * weight;
}

/**
 * Calcule la distance euclidienne globale entre deux objets scanned_stats complets
 * @param {Object} userAttr - Attributs de l'utilisateur (retour de calculateMixAttributes)
 * @param {Object} presetAttr - Attributs du preset (preset.scanned_stats)
 * @returns {number} Distance globale sommée
 */
function computeGlobalDistance(userAttr, presetAttr) {
  if (!userAttr || !presetAttr) return Infinity;

  const categories = ['base', 'front', 'sourcils', 'yeux', 'nez', 'joues', 'bouche', 'menton', 'machoire'];
  let totalDistance = 0;

  for (const cat of categories) {
    const userCat = userAttr[cat];
    const presetCat = presetAttr[cat];
    if (userCat && presetCat) {
      totalDistance += calculateCategoryDistance(userCat, presetCat, cat);
    }
  }

  return totalDistance;
}

// ─── 7. SÉLECTION DU MEILLEUR PRESET ──────────────────────
function selectBestPreset(landmarks, skinTone) {
  // Extrait et prépare les attributs de l'utilisateur
  let userAttr = null;
  if (Array.isArray(landmarks) && landmarks.length > 0) {
    // landmarks est un tableau de points MediaPipe
    userAttr = calculateMixAttributes(landmarks);
    userAttr = augmentAttributesWithCustomMetrics(landmarks, userAttr);
  } else if (typeof landmarks === 'object' && landmarks !== null) {
    // landmarks est déjà un objet d'attributs
    userAttr = landmarks;
  }

  if (!userAttr) {
    console.warn('⚠️ selectBestPreset: userAttr non disponible');
    return { bestPreset: null, ratios: {}, scores: [] };
  }

  const resolvedSkinTone = normalizeSkinToneLabel(skinTone);
  const neighborhoods = {
    "Claire":         ["Claire", "Claire-bronzée"],
    "Claire-bronzée": ["Claire", "Claire-bronzée", "Métis"],
    "Métis":          ["Claire-bronzée", "Métis", "Foncée"],
    "Foncée":         ["Métis", "Foncée", "Très foncée"],
    "Très foncée":    ["Foncée", "Très foncée"],
  };
  const allowedSkinTones = neighborhoods[resolvedSkinTone] ?? [resolvedSkinTone];
  const candidates = PRESETS_DB.filter(p => allowedSkinTones.includes(p.couleur_peau));
  const scoringPool = candidates.length > 0 ? candidates : PRESETS_DB;

  const distances = [];

  // Calcule la distance pour chaque preset
  for (const preset of scoringPool) {
    if (preset.scanned_stats) {
      const distance = computeGlobalDistance(userAttr, preset.scanned_stats);
      // Convertit la distance en pourcentage : score élevé = faible distance
      // Normalise la distance sur une échelle [0, 100] où 100 = meilleure correspondance
      const score = Math.max(0, 100 - distance * 25);   // échelle douce : dist 0→100, 2→50, 4→0
      distances.push({
        preset_id: preset.preset_id,
        position: preset.position,
        distance: distance,
        score: score,
        preset: preset
      });
    }
  }

  // Trie par distance CROISSANTE (plus petite = meilleur match). Le score (affichage)
  // saturait quand toutes les distances >1.0 → tri par score perdait son discriminant.
  distances.sort((a, b) => a.distance - b.distance);

  const bestPreset = distances.length > 0 ? distances[0].preset : null;

  // Affiche les 3 meilleurs pour debug
  console.log("🏆 Top 3 presets :", distances.slice(0, 3).map(d => ({
    preset_id: d.preset_id,
    position: d.position,
    score: d.score.toFixed(1)
  })));

  return { bestPreset, ratios: userAttr, scores: distances };
}
window.selectBestPreset = selectBestPreset;

// ─── DNA lookup (copié depuis lookupPresetDNA.js) ───────────────────────────
// Table générée et validée (3191/3193) : clé plate -> [zone .avance, abrév]
const DNA_KEY_MAP = {"crane_reduire_elargir":["crane","re"],"crane_bas_haut":["crane","bh"],"crane_arriere_avant":["crane","na"],"crane_arrondi_angulaire":["crane","aa"],"crane_deplacement_gd":["crane","gd"],"crane_couronne_reduire_elargir":["couronne","re"],"crane_couronne_bas_haut":["couronne","bh"],"crane_couronne_arriere_avant":["couronne","aa"],"crane_couronne_neutre_arrondi":["couronne","nr"],"crane_couronne_deplacement_gd":["couronne","gd"],"crane_arriere_reduire_elargir":["arriere_crane","re"],"crane_arriere_bas_haut":["arriere_crane","bh"],"crane_arriere_arriere_avant":["arriere_crane","aa"],"crane_arriere_arrondi_angulaire":["arriere_crane","ang"],"crane_arriere_deplacement_gd":["arriere_crane","gd"],"tempes_reduire_elargir":["tempes","re"],"tempes_bas_haut":["tempes","bh"],"tempes_arriere_avant":["tempes","aa"],"tempes_arrondi_angulaire":["tempes","ang"],"front_sup_reduire_elargir":["front_sup","re"],"front_sup_arriere_avant":["front_sup","aa"],"front_sup_neutre_haut":["front_sup","nh"],"front_sup_arrondi_angulaire":["front_sup","ang"],"front_sup_deplacement_gd":["front_sup","gd"],"front_inf_reduire_elargir":["front_inf","re"],"front_inf_bas_haut":["front_inf","bh"],"front_inf_arriere_avant":["front_inf","aa"],"front_inf_arrondi_angulaire":["front_inf","ang"],"sourcils_reduire_elargir":["sourcils","re"],"sourcils_bas_haut":["sourcils","bh"],"sourcils_arriere_avant":["sourcils","aa"],"sourcils_arrondi_angulaire":["sourcils","ang"],"sourcils_central_reduire_elargir":["sourcils_ctr","re"],"sourcils_central_bas_haut":["sourcils_ctr","bh"],"sourcils_central_arriere_avant":["sourcils_ctr","aa"],"sourcils_central_arrondi_angulaire":["sourcils_ctr","ang"],"sourcils_central_deplacement_gd":["sourcils_ctr","gd"],"sourcils_ext_sup_reduire_elargir":["sourcils_ext","re"],"sourcils_ext_sup_bas_haut":["sourcils_ext","bh"],"sourcils_ext_sup_arriere_avant":["sourcils_ext","aa"],"sourcils_ext_sup_arrondi_angulaire":["sourcils_ext","ang"],"yeux_reduire_elargir":["yeux","re"],"yeux_bas_haut":["yeux","bh"],"yeux_arriere_avant":["yeux","aa"],"yeux_arrondi_angulaire":["yeux","ang"],"orbites_reduire_elargir":["orbites","re"],"orbites_bas_haut":["orbites","bh"],"orbites_arriere_avant":["orbites","aa"],"orbites_plus_grande_petite":["orbites","gp"],"nez_reduire_elargir":["nez_adv","re"],"nez_bas_haut":["nez_adv","bh"],"nez_arriere_avant":["nez_adv","aa"],"nez_arrondi_angulaire":["nez_adv","ang"],"nez_deplacement_gd":["nez_adv","gd"],"arete_nez_cotes_reduire_elargir":["arete_cotes","re"],"arete_nez_cotes_bas_haut":["arete_cotes","bh"],"arete_nez_cotes_arriere_avant":["arete_cotes","aa"],"arete_nez_cotes_arrondi_angulaire":["arete_cotes","ang"],"arete_nez_centrale_reduire_elargir":["arete_centrale","re"],"arete_nez_centrale_bas_haut":["arete_centrale","bh"],"arete_nez_centrale_arriere_avant":["arete_centrale","aa"],"arete_nez_centrale_arrondi_angulaire":["arete_centrale","ang"],"arete_nez_centrale_deplacement_gd":["arete_centrale","gd"],"arete_nez_sup_reduire_elargir":["arete_sup","re"],"arete_nez_sup_bas_haut":["arete_sup","bh"],"arete_nez_sup_arriere_avant":["arete_sup","aa"],"arete_nez_sup_arrondi_angulaire":["arete_sup","ang"],"arete_nez_sup_deplacement_gd":["arete_sup","gd"],"joues_reduire_elargir":["joues_adv","re"],"joues_bas_haut":["joues_adv","bh"],"joues_arriere_avant":["joues_adv","aa"],"joues_arrondi_angulaire":["joues_adv","ang"],"bouche_reduire_elargir":["bouche_adv","re"],"bouche_bas_haut":["bouche_adv","bh"],"bouche_arriere_avant":["bouche_adv","aa"],"bouche_arrondi_angulaire":["bouche_adv","ang"],"bouche_deplacement_gd":["bouche_adv","gd"],"ext_bouche_sup_reduire_elargir":["bouche_ext","re"],"ext_bouche_sup_bas_haut":["bouche_ext","bh"],"ext_bouche_sup_arriere_avant":["bouche_ext","aa"],"ext_bouche_sup_arrondi_angulaire":["bouche_ext","ang"],"menton_reduire_elargir":["menton_adv","re"],"menton_bas_haut":["menton_adv","bh"],"menton_arriere_avant":["menton_adv","aa"],"menton_arrondi_angulaire":["menton_adv","ang"],"menton_deplacement_gd":["menton_adv","gd"],"menton_sup_reduire_elargir":["menton_sup","re"],"menton_sup_bas_haut":["menton_sup","bh"],"menton_sup_arriere_avant":["menton_sup","aa"],"menton_sup_arrondi_angulaire":["menton_sup","ang"],"menton_sup_deplacement_gd":["menton_sup","gd"],"machoire_reduire_elargir":["machoire_adv","re"],"machoire_bas_haut":["machoire_adv","bh"],"machoire_arriere_avant":["machoire_adv","aa"],"machoire_arrondi_angulaire":["machoire_adv","ang"],"maxillaire_reduire_elargir":["maxillaire","re"],"maxillaire_bas_haut":["maxillaire","bh"],"maxillaire_arriere_avant":["maxillaire","aa"],"maxillaire_arrondi_angulaire":["maxillaire","ang"],"mandibule_reduire_elargir":["mandibule","re"],"mandibule_bas_haut":["mandibule","bh"],"mandibule_arriere_avant":["mandibule","aa"],"mandibule_arrondi_angulaire":["mandibule","ang"]};

function lookupPresetDNA(preset, flatKey) {
  if (!preset || !preset.avance) return undefined;
  const za = DNA_KEY_MAP[flatKey];
  if (!za) return undefined;
  const zone = preset.avance[za[0]];
  if (!zone) return undefined;
  const v = zone[za[1]];
  return Number.isFinite(v) ? v : undefined;
}
window.lookupPresetDNA = lookupPresetDNA;
