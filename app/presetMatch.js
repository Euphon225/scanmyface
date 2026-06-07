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

// ─── HELPERS GÉOMÉTRIQUES (utilisés pour machoire.solidite / machoire.courbure) ──
// polygonArea : formule du lacet (shoelace), valeur absolue. Travaille sur {x,y}.
function polygonArea(pts) {
    if (!pts || pts.length < 3) return 0;
    let s = 0;
    for (let i = 0, n = pts.length; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        s += p.x * q.y - q.x * p.y;
    }
    return Math.abs(s) / 2;
}

// convexHull : enveloppe convexe 2D (algorithme monotone chain d'Andrew).
// Retourne les points du hull ordonnés (sens trigo / antihoraire).
function convexHull(pts) {
    if (!pts || pts.length < 3) return (pts || []).slice();
    const points = pts.slice().sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    const cross = (O, A, B) => (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
    const lower = [];
    for (const p of points) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
    }
    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

// turningAngles : pour chaque triplet (p[i-1], p[i], p[i+1]), angle signé entre
// (p[i]-p[i-1]) et (p[i+1]-p[i]) via atan2(cross, dot) ∈ (-π, π].
function _turningAngles(pts) {
    const out = [];
    if (!pts || pts.length < 3) return out;
    for (let i = 1; i < pts.length - 1; i++) {
        const ax = pts[i].x - pts[i - 1].x, ay = pts[i].y - pts[i - 1].y;
        const bx = pts[i + 1].x - pts[i].x, by = pts[i + 1].y - pts[i].y;
        const cross = ax * by - ay * bx;
        const dot = ax * bx + ay * by;
        out.push(Math.atan2(cross, dot));
    }
    return out;
}

function _stddev(arr) {
    if (!arr || arr.length === 0) return 0;
    const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
    const v = arr.reduce((s, x) => s + (x - mean) * (x - mean), 0) / arr.length;
    return Math.sqrt(v);
}

// perimetre : somme des distances entre points consécutifs, boucle fermée
// (dernier point reconnecté au premier). Travaille sur {x,y}.
function perimetre(pts) {
    if (!pts || pts.length < 2) return 0;
    let s = 0;
    for (let i = 0, n = pts.length; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        s += Math.hypot(q.x - p.x, q.y - p.y);
    }
    return s;
}

// eigenvalues2x2 : valeurs propres d'une matrice symétrique 2x2 [[a,b],[b,c]]
// via la formule analytique. Retourne [λ_max, λ_min] (λ1 ≥ λ2).
function eigenvalues2x2(M) {
    const a = M[0][0], b = M[0][1], c = M[1][1];
    const tr = a + c;
    const disc = Math.sqrt(Math.max(0, (a - c) * (a - c) + 4 * b * b));
    return [(tr + disc) / 2, (tr - disc) / 2];
}

// Contours des lèvres MediaPipe (FACEMESH_LIPS, boucles fermées dans l'ordre)
const LIP_OUTER_INDICES = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
const LIP_INNER_INDICES = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];

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

    // ── BOUCHE : 4 mesures de forme sur le contour des lèvres ────────────
    // Toutes invariantes échelle/translation (normalisées par face area ou sans dimension).
    // Laissées à null si un point manque ; _buildMahalanobisCov les exclut du Mahalanobis
    // tant que les 31 presets ne les ont pas (log "en attente de re-scan").
    attributes.bouche.aire = null;
    attributes.bouche.compacite = null;
    attributes.bouche.excentricite = null;
    attributes.bouche.ratio_levres = null;

    const lipOuter = [];
    for (const idx of LIP_OUTER_INDICES) {
        const p = byIndex(idx);
        if (!p) { lipOuter.length = 0; break; }
        lipOuter.push({ x: p.x, y: p.y });
    }
    if (lipOuter.length === LIP_OUTER_INDICES.length) {
        // 1. aire = shoelace(lipOuter) / face area  (remplace l'approximation rectangle×0.7
        //    de bouche.volume — bouche.volume est CONSERVÉ tel quel pour compatibilité).
        const aireLip = polygonArea(lipOuter);
        attributes.bouche.aire = aireLip / (faceAreaTotal || 1);

        // 2. compacité = 4π·aire / perimètre²  ∈ [0, 1].  =1 cercle, <1 forme allongée.
        const peri = perimetre(lipOuter);
        if (peri > 1e-12) {
            attributes.bouche.compacite = (4 * Math.PI * aireLip) / (peri * peri);
        }

        // 3. excentricité = sqrt(1 - λ_min / λ_max) sur la covariance 2x2 des points.
        //    λ_max/λ_min sont les variances le long des axes principaux de la bouche.
        //    Sans dimension, invariant échelle/translation. Bouche fine étirée → ~1.
        const n = lipOuter.length;
        let mx = 0, my = 0;
        for (const p of lipOuter) { mx += p.x; my += p.y; }
        mx /= n; my /= n;
        let cxx = 0, cxy = 0, cyy = 0;
        for (const p of lipOuter) {
            const dx = p.x - mx, dy = p.y - my;
            cxx += dx * dx; cxy += dx * dy; cyy += dy * dy;
        }
        cxx /= n; cxy /= n; cyy /= n;
        const [lmax, lmin] = eigenvalues2x2([[cxx, cxy], [cxy, cyy]]);
        if (lmax > 1e-12) {
            attributes.bouche.excentricite = Math.sqrt(Math.max(0, 1 - lmin / lmax));
        }
    }

    // 4. ratio_levres = épaisseur lèvre sup / épaisseur lèvre inf  (sans dimension).
    //    ep_sup = |y(point 0, haut externe) − y(point 13, haut interne)|
    //    ep_inf = |y(point 17, bas externe) − y(point 14, bas interne)|
    const lipExtTop = byIndex(0),  lipIntTop = byIndex(13);
    const lipExtBot = byIndex(17), lipIntBot = byIndex(14);
    if (lipExtTop && lipIntTop && lipExtBot && lipIntBot) {
        const epSup = Math.abs(lipExtTop.y - lipIntTop.y);
        const epInf = Math.abs(lipExtBot.y - lipIntBot.y);
        attributes.bouche.ratio_levres = epSup / (epInf || 1e-9);
    }

    if (!attributes.nez) attributes.nez = {};

    // ── Nez : métriques width / height / projection / narine + 3 mesures de forme ──

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

    // 4. Périmètre moyen des narines
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

    // ── Nez : compacité narine gauche (seule mesure de forme retenue, 1.46x d'amplitude
    //    sur les 31 presets). evasement (1.13x) et ratio_pointe_base (1.08x) retirés : plats.
    attributes.nez.compacite_narines = null;

    // Compacité de la narine gauche : 4π·aire / perimètre²  ∈ [0, 1].
    // Narine ronde → ~1 ; narine pincée/allongée → bas.
    // Contour ordonné en boucle : 75 (aile ext) → 79 → 237 (sommets) → 238 (interne) → 97 → 2 (base)
    const NARINE_LEFT_CONTOUR = [75, 79, 237, 238, 97, 2];
    const narineContour = [];
    for (const idx of NARINE_LEFT_CONTOUR) {
        const p = byIndex(idx);
        if (!p) { narineContour.length = 0; break; }
        narineContour.push({ x: p.x, y: p.y });
    }
    if (narineContour.length === NARINE_LEFT_CONTOUR.length) {
        const aireN = polygonArea(narineContour);
        const periN = perimetre(narineContour);
        if (periN > 1e-12) {
            attributes.nez.compacite_narines = (4 * Math.PI * aireN) / (periN * periN);
        }
    }

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

// ─── Z-SCORE STATS pré-calculées sur les 31 presets (PRESETS_DB_v3.js, scanned_stats) ───
// Généré une fois : moyenne + écart-type par mesure zone.key. std<1e-9 → forcé à 1.
// Sert à normaliser les distances dans calculateCategoryDistance (sinon les mesures à grandes
// valeurs comme joues.volume écrasent les petites comme nez.narine).
const ZSCORE_STATS = {
  "base.height":     { mean: 0.6591893091627036,   std: 0.018916070731326454 },
  "base.volume":     { mean: 1.0695999207645586,   std: 0.0152269121779691   },
  "base.width":      { mean: 0.8587388366737854,   std: 0.03529328119669809  },
  "bouche.height":   { mean: 0.11143413495117663,  std: 0.027246778729886033 },
  "bouche.volume":   { mean: 0.029635666742049347, std: 0.00938530587213635  },
  "bouche.width":    { mean: 0.40077822015973225,  std: 0.031071737087938957 },
  "front.height":    { mean: 0.16922390069904353,  std: 0.009555017690847151 },
  "front.width":     { mean: 0.6480141920219339,   std: 0.014243494385945821 },
  "joues.height":    { mean: 0.04230116492435932,  std: 0.020929889593804162 },
  "joues.volume":    { mean: 1.2418946947553322,   std: 0.02071789276409705  },
  "joues.width":     { mean: 1.0695999207645586,   std: 0.0152269121779691   },
  "machoire.angle":  { mean: 0.2888942541587363,   std: 0.023813512212113763 },
  "machoire.height": { mean: 0.18018686649721338,  std: 0.015051286762304068 },
  "machoire.width":  { mean: 0.8615919478496559,   std: 0.0224649575135629   },
  "menton.height":   { mean: 0.22157491557034356,  std: 0.01882997235251153  },
  "menton.width":    { mean: 0.8615919478496559,   std: 0.0224649575135629   },
  "nez.height":      { mean: 0.21818139424464905,  std: 0.008735238832562848 },
  "nez.narine":      { mean: 0.13497465124802202,  std: 0.012229055878892763 },
  "nez.projection":  { mean: 0.10054612612922444,  std: 0.0074943011036626705},
  "nez.volume":      { mean: 0.029715456518899227, std: 0.0020050473808184794},
  "nez.width":       { mean: 0.18374663160031093,  std: 0.014109238040308048 },
  "sourcils.angle":  { mean: -0.005930269019686606,std: 0.006089567509587374 },
  "sourcils.height": { mean: 0.10602615940923776,  std: 0.009282785715635426 },
  "sourcils.width":  { mean: 0.6480141920219339,   std: 0.014243494385945821 },
  "yeux.height":     { mean: 0.10602615940923776,  std: 0.009282785715635426 },
  "yeux.spacing":    { mean: 0.26224360869693064,  std: 0.012475608681513579 },
  "yeux.width":      { mean: 0.6767857126481703,   std: 0.016490543089994574 }
};

// Mesures EXCLUES du calcul (bruit, pas de signal de forme) :
// - joues.height : varie d'un facteur ~4000 entre presets (instable)
// - base.height / base.volume : quasi plates, ne discriminent rien
// L'exclusion est appliquée par ORDERED_KEYS plus bas (ces clés n'y figurent pas).
// Constante conservée pour documentation + usage potentiel par d'autres modules.
const ZSCORE_EXCLUDED = new Set(['joues.height', 'base.height', 'base.volume']);

// ─── ORDRE FIXE DES MESURES PAR ZONE ───────────────────────────────────────
// Doit être identique à l'ordre utilisé pour construire la covariance par zone.
// (Les clés exclues ne figurent pas ici → automatiquement ignorées partout.)
const ORDERED_KEYS = {
  base:     ['width'],
  front:    ['width', 'height'],
  sourcils: ['width', 'height', 'angle'],
  yeux:     ['width', 'spacing', 'height'],
  nez:      ['width', 'height', 'projection', 'narine', 'compacite_narines'],
  joues:    ['width', 'volume'],
  bouche:   ['width', 'height', 'volume', 'aire', 'compacite', 'excentricite', 'ratio_levres'],
  menton:   ['width', 'height'],
  machoire: ['width', 'height', 'angle'],
};

// ─── INVERSION DE MATRICE (sans librairie : k=1/2/3 analytique, k>=4 Gauss-Jordan) ──
function _invertMatrix(M) {
  const n = M.length;
  if (n === 1) {
    const v = M[0][0];
    if (Math.abs(v) < 1e-12) return null;
    return [[1 / v]];
  }
  if (n === 2) {
    const a = M[0][0], b = M[0][1], c = M[1][0], d = M[1][1];
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-12) return null;
    return [[ d / det, -b / det], [-c / det,  a / det]];
  }
  if (n === 3) {
    const a = M[0][0], b = M[0][1], c = M[0][2];
    const d = M[1][0], e = M[1][1], f = M[1][2];
    const g = M[2][0], h = M[2][1], i = M[2][2];
    const A =  (e * i - f * h);
    const B = -(d * i - f * g);
    const C =  (d * h - e * g);
    const det = a * A + b * B + c * C;
    if (Math.abs(det) < 1e-12) return null;
    return [
      [A / det, -(b * i - c * h) / det,  (b * f - c * e) / det],
      [B / det,  (a * i - c * g) / det, -(a * f - c * d) / det],
      [C / det, -(a * h - b * g) / det,  (a * e - b * d) / det],
    ];
  }
  // k >= 4 : Gauss-Jordan avec pivot partiel
  const A = M.map((row, r) => [...row, ...Array.from({ length: n }, (_, j) => (r === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let pivotRow = col, maxAbs = Math.abs(A[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > maxAbs) { maxAbs = Math.abs(A[r][col]); pivotRow = r; }
    }
    if (maxAbs < 1e-12) return null;
    if (pivotRow !== col) { const tmp = A[col]; A[col] = A[pivotRow]; A[pivotRow] = tmp; }
    const piv = A[col][col];
    for (let j = 0; j < 2 * n; j++) A[col][j] /= piv;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = A[r][col];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * n; j++) A[r][j] -= factor * A[col][j];
    }
  }
  return A.map(row => row.slice(n));
}

// ─── HELPER : pool matchable (Phase 2.0 Étape 1) ──────────────────────────
// Filtre PRESETS_DB pour ne garder que les entrées exploitables par le
// matcher Mahalanobis : scanned_stats présents ET _matchable !== false.
// Les célébrités Phase 2.0 ont scanned_stats:null + _matchable:false jusqu'à
// l'Étape 2 (batch scan) → exclues d'office, le matcher continue à piocher
// dans les 31 officiels sans crash NaN.
function _matchablePool() {
  if (typeof PRESETS_DB === 'undefined' || !Array.isArray(PRESETS_DB)) return [];
  return PRESETS_DB.filter(p => p.scanned_stats && p._matchable !== false);
}

// Pool des presets officiels EA (exclut les célébrités). Utilisé par l'UI
// étape 3 : la tête de référence + Mix Frankenstein doivent être des presets
// sélectionnables dans FC26 (les célébrités preset_id ≥ 10001 n'existent pas
// en jeu). Le matcher DNA (pool complet) reste inchangé en arrière-plan.
function _officialPool() {
  if (typeof PRESETS_DB === 'undefined' || !Array.isArray(PRESETS_DB)) return [];
  return PRESETS_DB.filter(p =>
    p.scanned_stats &&
    p._matchable !== false &&
    p.entry_type !== 'celebrity'
  );
}

// ─── COVARIANCES PAR ZONE (Ledoit-Wolf simplifié, α=0.2) ───────────────────
// Calculées UNE SEULE FOIS au chargement, depuis PRESETS_DB[].scanned_stats.
// Stocke C_reg + Cinv par zone. Si singulière malgré shrinkage → fallback diagonal.
const MAHALANOBIS_COV = (function _buildMahalanobisCov() {
  const ALPHA = 0.2;
  const out = {};
  const pool = _matchablePool();
  if (pool.length < 2) {
    console.warn('⚠️ MAHALANOBIS_COV : pool matchable insuffisant (<2 presets avec scanned_stats) — Mahalanobis désactivé.');
    return out;
  }
  for (const zone of Object.keys(ORDERED_KEYS)) {
    const declared = ORDERED_KEYS[zone];
    // Garde uniquement les clés présentes (numériques) sur TOUS les presets matchables.
    // Les clés manquantes (ex. machoire.solidite / courbure avant re-scan) sont
    // exclues silencieusement de la covariance — le code tourne avant ET après le re-scan.
    const present = [];
    const missing = [];
    for (const key of declared) {
      let allHaveIt = pool.length > 0;
      for (const p of pool) {
        const z = p.scanned_stats && p.scanned_stats[zone];
        if (!z || typeof z[key] !== 'number') { allHaveIt = false; break; }
      }
      (allHaveIt ? present : missing).push(key);
    }
    if (missing.length) {
      console.warn(`⏳ MAHALANOBIS_COV : clés en attente de re-scan : ${missing.map(k => `${zone}.${k}`).join(', ')}`);
    }
    if (present.length === 0) continue;
    const keys = present;
    const k = keys.length;
    const vectors = pool.map(p => keys.map(key => p.scanned_stats[zone][key]));
    if (vectors.length < 2) continue;
    const N = vectors.length;
    const mean = keys.map((_, j) => vectors.reduce((s, v) => s + v[j], 0) / N);
    const C = Array.from({ length: k }, () => Array(k).fill(0));
    for (const v of vectors) for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) {
      C[i][j] += (v[i] - mean[i]) * (v[j] - mean[j]);
    }
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) C[i][j] /= N;
    for (let i = 0; i < k; i++) if (C[i][i] < 1e-9) C[i][i] = 1e-9;
    const Creg = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) =>
      i === j ? C[i][i] : (1 - ALPHA) * C[i][j]
    ));
    let Cinv = _invertMatrix(Creg);
    let fallback = false;
    if (!Cinv) {
      console.warn(`⚠️ MAHALANOBIS_COV : zone '${zone}' singulière malgré shrinkage → fallback diagonal.`);
      Cinv = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) =>
        i === j ? 1 / Math.max(Creg[i][i], 1e-9) : 0
      ));
      fallback = true;
    }
    out[zone] = { keys, Creg, Cinv, fallback };
  }
  return out;
})();
if (typeof window !== 'undefined') window.MAHALANOBIS_COV = MAHALANOBIS_COV;

// ─── DISTANCE DE MAHALANOBIS PAR CATÉGORIE ─────────────────────────────────
/**
 * Distance de Mahalanobis régularisée entre deux vecteurs de mesures d'une zone.
 * d_zone = sqrt( (u - p)^T  Cinv  (u - p) )  où Cinv = inverse de la covariance
 * (avec shrinkage α=0.2). Décorrèle les mesures redondantes (ex. width/height).
 * @param {Object} userCat - Catégorie de l'utilisateur (ex: user.nez)
 * @param {Object} presetCat - Catégorie du preset (ex: preset.scanned_stats.nez)
 * @param {string} categoryName - 'nez', 'machoire', 'menton', 'yeux', etc.
 * @returns {number} Distance de Mahalanobis × pondération de zone
 */
function calculateCategoryDistance(userCat, presetCat, categoryName) {
  if (!userCat || !presetCat) return 0;
  const cov = MAHALANOBIS_COV[categoryName];
  if (!cov) return 0;
  const { keys, Cinv } = cov;
  const k = keys.length;
  const d = new Array(k);
  for (let i = 0; i < k; i++) {
    const u = userCat[keys[i]], p = presetCat[keys[i]];
    if (typeof u !== 'number' || typeof p !== 'number') return 0;
    d[i] = u - p;
  }
  // forme quadratique d^T Cinv d
  let q = 0;
  for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) q += d[i] * Cinv[i][j] * d[j];
  if (q < 0) q = 0; // garde-fou numérique (Cinv symétrique semi-définie positive)
  const distance = Math.sqrt(q);
  // Pondérations de zone : nez 2.0x, machoire/menton/yeux 1.5x, autres 1.0x
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
  // Phase 2.0 Étape 1 : on ne pioche que dans le pool matchable (scanned_stats + _matchable!=false).
  const matchable = _matchablePool();
  const candidates = matchable.filter(p => allowedSkinTones.includes(p.couleur_peau));
  const scoringPool = candidates.length > 0 ? candidates : matchable;

  const distances = [];

  // Calcule la distance pour chaque preset
  for (const preset of scoringPool) {
    if (preset.scanned_stats) {
      const distance = computeGlobalDistance(userAttr, preset.scanned_stats);
      // Score d'affichage (cosmétique) : exp(−distance / D0).
      // D0 = 75 calibré pour que la MEILLEURE distance Mahalanobis observée
      // entre 2 presets de la DB (~7.7) donne un score ~90 :
      //   exp(−7.7 / 75) ≈ 0.903 → 90.3.
      // Le tri (ligne plus bas) reste sur distance croissante : le score n'influence rien.
      const D0 = 75;
      const score = Math.max(0, 100 * Math.exp(-distance / D0));
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

  // ── Phase 2.3 : pool officiel pour l'UI ─────────────────────────────────
  // bestPreset (pool 41) sert au matcher DNA (peut être célébrité, preset_id
  // ≥ 10001). Mais l'UI doit afficher une tête sélectionnable dans FC26 →
  // recalcul sur les officiels uniquement, en respectant la même
  // restriction carnation (neighborhoods).
  const officialFromPool = scoringPool.filter(p => p.entry_type !== 'celebrity');
  // Fallback : si la carnation user n'a aucun officiel proche, on élargit au
  // pool officiel complet plutôt que de retomber sur les célébrités.
  const officialScoringPool = officialFromPool.length > 0 ? officialFromPool : _officialPool();

  const officialDistances = [];
  for (const preset of officialScoringPool) {
    if (!preset.scanned_stats) continue;
    const distance = computeGlobalDistance(userAttr, preset.scanned_stats);
    const D0 = 75;
    const score = Math.max(0, 100 * Math.exp(-distance / D0));
    officialDistances.push({
      preset_id: preset.preset_id,
      position: preset.position,
      distance,
      score,
      preset,
    });
  }
  officialDistances.sort((a, b) => a.distance - b.distance);

  const bestOfficial = officialDistances.length > 0 ? officialDistances[0].preset : null;
  const officialTopPresets = officialDistances.slice(0, 4).map(s => ({
    id: s.preset_id,
    position: s.position,
    forme: s.preset && s.preset.forme_visage,
    carnation: s.preset && s.preset.couleur_peau,
    score: s.score,
  }));

  // Mix Frankenstein : calculé sur les OFFICIELS uniquement (sinon une zone
  // pourrait renvoyer preset_id 10001+ → non sélectionnable en jeu).
  const zoneMix = computeZoneMix(userAttr, officialScoringPool);

  return {
    bestPreset,           // pool 41 (DNA) — peut être célébrité
    ratios: userAttr,
    scores: distances,
    zoneMix,              // calculé sur officiels uniquement
    bestOfficial,         // pool 31 (UI tête de réf)
    officialScores: officialDistances,
    officialTopPresets,   // top 3-4 officiels pour le bloc Alternatives
  };
}
window.selectBestPreset = selectBestPreset;

// ─── computeZoneMix : meilleur preset PAR ZONE (mix Frankenstein) ───────────
// Pour chaque zone, classe les presets du pool par distance Mahalanobis sur CETTE
// zone seule et renvoie {best, distance, separation, top3}.
// `separation` = (d2 − d1) / d1 : grand = choix net, petit = indécis.
function computeZoneMix(userAttr, scoringPool) {
  // Zones affichables (toutes celles de ORDERED_KEYS sauf 'base' qui est interne)
  const ZONES = ['front', 'sourcils', 'yeux', 'nez', 'joues', 'bouche', 'menton', 'machoire'];
  const mix = {};
  for (const zone of ZONES) {
    if (!userAttr[zone]) continue;
    const ranked = scoringPool
      .filter(p => p.scanned_stats && p.scanned_stats[zone])
      .map(p => ({
        preset_id: p.preset_id,
        distance: calculateCategoryDistance(userAttr[zone], p.scanned_stats[zone], zone)
      }))
      .sort((a, b) => a.distance - b.distance);
    if (ranked.length === 0) continue;
    const separation = ranked.length > 1
      ? (ranked[1].distance - ranked[0].distance) / (ranked[0].distance || 1)
      : 1;
    mix[zone] = {
      best: ranked[0].preset_id,
      distance: ranked[0].distance,
      separation: separation,        // >0.15 = choix net, <0.05 = indécis
      top3: ranked.slice(0, 3).map(r => ({ id: r.preset_id, d: r.distance }))
    };
  }
  return mix;
}
window.computeZoneMix = computeZoneMix;

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

function lookupPresetDNAByFamily(preset, family, flatKey) {
  if (!preset) return undefined;
  if (family === 'squelette') {
    return lookupPresetDNA(preset, flatKey);
  }
  // Chair / Graisse : flat key direct dans faconner.<family>
  // Présent uniquement sur les célébrités (faconner zone-groupé sur officiels).
  const fam = preset.faconner && preset.faconner[family];
  if (!fam || typeof fam !== 'object') return undefined;
  const v = fam[flatKey];
  return Number.isFinite(v) ? v : undefined;
}
window.lookupPresetDNAByFamily = lookupPresetDNAByFamily;
