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

// ─── Phase 4.1 — Roll-alignment (axe inter-pupillaire) ──────────────────────
// computeRollAlignedPoints(rawPoints) : retourne un dict {String(idx) -> {x,y,z}}
// avec TOUS les points tournés de -theta autour du centre du visage, où theta
// est l'angle de l'axe inter-pupillaire avec l'horizontale.
//   centre yeux gauche  = moyenne iris L468..472 (sinon contour œil gauche)
//   centre yeux droit   = moyenne iris L473..477 (sinon contour œil droit)
//   theta = atan2(c_droite.y - c_gauche.y, c_droite.x - c_gauche.x)
//   centre du visage    = milieu(L234, L454)
// Si l'un des centres n'est pas calculable → retourne rawPoints inchangé
// (rétro-compat : tout le pipeline existant reste valide). La rotation est
// appliquée UNIQUEMENT aux features par zone (Phase 4.1) ; les chemins legacy
// (extractMorphRatios, auto()) continuent d'utiliser rawPoints.
function _meanXY(rawPoints, indices) {
    let sx = 0, sy = 0, n = 0;
    for (const i of indices) {
        const p = rawPoints[String(i)];
        if (!p) continue;
        sx += p.x; sy += p.y; n++;
    }
    if (n === 0) return null;
    return { x: sx / n, y: sy / n };
}
const _IRIS_LEFT_PRIMARY  = [468, 469, 470, 471, 472];
const _IRIS_RIGHT_PRIMARY = [473, 474, 475, 476, 477];
const _EYE_LEFT_FALLBACK  = [33, 133, 159, 145];   // contour œil gauche (MP)
const _EYE_RIGHT_FALLBACK = [362, 263, 386, 374];  // contour œil droit (MP)
function computeRollAlignedPoints(rawPoints) {
    if (!rawPoints) return rawPoints;
    let cL = _meanXY(rawPoints, _IRIS_LEFT_PRIMARY)
          || _meanXY(rawPoints, _EYE_LEFT_FALLBACK);
    let cR = _meanXY(rawPoints, _IRIS_RIGHT_PRIMARY)
          || _meanXY(rawPoints, _EYE_RIGHT_FALLBACK);
    const L234 = rawPoints['234'], L454 = rawPoints['454'];
    if (!cL || !cR || !L234 || !L454) return rawPoints;
    const theta = Math.atan2(cR.y - cL.y, cR.x - cL.x);
    if (!Number.isFinite(theta) || Math.abs(theta) < 1e-9) return rawPoints;
    const cosT = Math.cos(-theta), sinT = Math.sin(-theta);
    const cx = (L234.x + L454.x) / 2, cy = (L234.y + L454.y) / 2;
    const out = {};
    for (const k in rawPoints) {
        const p = rawPoints[k];
        if (!p) continue;
        const dx = p.x - cx, dy = p.y - cy;
        out[k] = {
            x: cx + dx * cosT - dy * sinT,
            y: cy + dx * sinT + dy * cosT,
            z: p.z,
        };
    }
    return out;
}
if (typeof window !== 'undefined') window.computeRollAlignedPoints = computeRollAlignedPoints;

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

    // ── PHASE 4.0 — Mesures morphologiques par sous-onglet (v4.0.1, 5 ratios) ──
    // Philtrum : zone trapézoïdale entre base du nez (L97-L2-L326) et arc de
    // cupidon (L37-L0-L267). L167 / L393 = arches latérales philtrum (validées
    // MediaPipe). L164 = sillon central pour profondeur Z.
    // Tous les ratios XY sont normalisés par faceWidthRaw (= dist(L234, L454))
    // pour rester invariants au cadrage. profondeur_z reste brute (axe Z déjà
    // dimensionné par MediaPipe relativement à la taille du visage).
    const L37_  = byIndex(37);
    const L267_ = byIndex(267);
    const L2_   = byIndex(2);
    const L0_   = byIndex(0);
    const L97_  = byIndex(97);
    const L326_ = byIndex(326);
    const L167_ = byIndex(167);
    const L393_ = byIndex(393);
    const L164_ = byIndex(164);
    if (faceWidthRaw > 1e-6
        && L37_ && L267_ && L2_ && L0_
        && L97_ && L326_ && L167_ && L393_ && L164_) {
        const largeur_sup    = distIdx(97, 326) / faceWidthRaw;
        const largeur_milieu = distIdx(167, 393) / faceWidthRaw;
        const largeur_inf    = distIdx(37, 267)  / faceWidthRaw;
        const hauteur        = distIdx(2,  0)    / faceWidthRaw;
        const profondeur_z   = L164_.z - (L2_.z + L0_.z) / 2;
        attributes.philtrum = {
            largeur_sup,
            largeur_milieu,
            largeur_inf,
            hauteur,
            profondeur_z,
        };
    }

    // ── PHASE 4.0 / v4.1.0 — Ratios géométriques génériques (20 sous-onglets) ──
    // Pour chaque zone de zone_definitions.json portant `landmarks_selected`
    // (nouveau format mapper, v4.1+), `computeZoneGeometry()` produit 6 ratios
    // invariants échelle/translation :
    //   largeur_max  = (max_x - min_x) / faceW
    //   hauteur_max  = (max_y - min_y) / faceH
    //   aire_bbox    = largeur_max * hauteur_max          (sans dimension)
    //   aspect_ratio = (max_y - min_y) / (max_x - min_x)  (null si dx≈0)
    //   centroide_x  = (mean_x - cx_visage) / faceW       (~0 pour zones centrées)
    //   dispersion   = sqrt(mean((p-mean)^2)) / faceW     (étalement radial normalisé)
    // Si un seul landmark manque → ratios tous null (Mahalanobis les exclut
    // tant que les 41 presets ne les ont pas, même pattern que bouche).
    // Les clés philtrum / nez (5 ratios spécifiques) restent intactes et
    // continuent d'alimenter le matching GLOBAL via computeGlobalDistance.
    const _zdef = (typeof window !== 'undefined') ? window._zoneDefinitions : null;
    if (_zdef && _zdef.zones
        && faceWidthRaw > 1e-6 && faceHeightRaw > 1e-6
        && byIndex(234) && byIndex(454)) {
        // Phase 4.1 — roll-aligned point cloud pour TOUTES les mesures par zone.
        // Reste sans effet si l'axe inter-pupillaire est introuvable (fallback rawPoints).
        const alignedPoints = (typeof computeRollAlignedPoints === 'function')
            ? computeRollAlignedPoints(rawPoints)
            : rawPoints;
        const cxFace = (byIndex(234).x + byIndex(454).x) / 2;
        for (const zoneKey of Object.keys(_zdef.zones)) {
            const zone = _zdef.zones[zoneKey];
            if (!zone || !Array.isArray(zone.landmarks_selected)) continue;
            // Ne pas écraser une zone déjà calculée (philtrum / nez / etc.)
            if (attributes[zoneKey] !== undefined) continue;
            // geom_family ∈ {bande,contour,arc,pointe,patch} → features v2 typées
            // Absent → 6 ratios v1 (rétro-compat le temps de la migration).
            attributes[zoneKey] = computeZoneGeometry(
                alignedPoints, zone.landmarks_selected,
                faceWidthRaw, faceHeightRaw, cxFace,
                zone.geom_family
            );
        }
    }

    // ── PILOTE 5.0.x — silhouette mâchoire (machoire_silhouette) ─────────
    // Diagnostic UNIQUEMENT (jamais écrit en sliders). 6 features scale-free
    // ou normalisées LOCALEMENT (W_gonion / H_jaw, pas /faceW) — leçon audit
    // §10 : /faceW pénalise les visages larges. Roll-aligned points pour
    // robustesse rotation. Fail-soft : un landmark manquant ou normalisateur
    // dégénéré → bloc absent + warn (pas de throw).
    //
    // JAW_ARC_ORDER : arc mandibulaire canonique gauche→menton→droite
    // (sous-séquence de FACEMESH_FACE_OVAL). Ordre fixe, PAS de tri angulaire
    // (les segments consécutifs ne doivent jamais se croiser).
    try {
        const JAW_ARC_ORDER = [132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361];
        // Toutes les mesures sur les points ROLL-ALIGNÉS.
        const _alignedJaw = (typeof computeRollAlignedPoints === 'function')
            ? computeRollAlignedPoints(rawPoints)
            : rawPoints;
        const _jawGet = (idx) => {
            const p = _alignedJaw && _alignedJaw[String(idx)];
            return (p && Number.isFinite(p.x) && Number.isFinite(p.y)) ? p : null;
        };

        const _jawPts = [];
        let _jawOk = true;
        for (const idx of JAW_ARC_ORDER) {
            const p = _jawGet(idx);
            if (!p) { _jawOk = false; break; }
            _jawPts.push({ x: p.x, y: p.y });
        }

        // Ancres locales (gonions = moyenne 3 landmarks ; menton = L152).
        const _jawGonion = (ids) => {
            let sx = 0, sy = 0, n = 0;
            for (const i of ids) {
                const p = _jawGet(i);
                if (!p) continue;
                sx += p.x; sy += p.y; n++;
            }
            if (n === 0) return null;
            return { x: sx / n, y: sy / n };
        };
        const G_g = _jawGonion([172, 136, 150]);
        const G_d = _jawGonion([397, 365, 379]);
        const menton = _jawGet(152);

        if (_jawOk && G_g && G_d && menton) {
            const W_gonion = Math.hypot(G_d.x - G_g.x, G_d.y - G_g.y);
            const H_jaw    = Math.abs(menton.y - (G_g.y + G_d.y) / 2);

            if (W_gonion > 1e-9 && H_jaw > 1e-9) {
                // Aire (shoelace) + périmètre du polygone fermé (arc + corde implicite 361→132).
                const A = polygonArea(_jawPts);
                const P = perimetre(_jawPts);

                // Feature 1 : compacité 4πA / P² (∈ [0,1], 1 = cercle).
                const compacite = (P > 1e-12) ? (4 * Math.PI * A) / (P * P) : null;

                // Feature 2 : excentricité = √(1 - λmin/λmax) sur la cov 2x2 des 17 points.
                let mx = 0, my = 0;
                for (const p of _jawPts) { mx += p.x; my += p.y; }
                mx /= _jawPts.length; my /= _jawPts.length;
                let cxx = 0, cxy = 0, cyy = 0;
                for (const p of _jawPts) {
                    const dx = p.x - mx, dy = p.y - my;
                    cxx += dx * dx; cxy += dx * dy; cyy += dy * dy;
                }
                cxx /= _jawPts.length; cxy /= _jawPts.length; cyy /= _jawPts.length;
                const [_lmax, _lmin] = eigenvalues2x2([[cxx, cxy], [cxy, cyy]]);
                const excentricite = (_lmax > 1e-12)
                    ? Math.sqrt(Math.max(0, 1 - _lmin / _lmax))
                    : null;

                // Feature 3 : angle au gonion entre (G→ancre_haute) et (G→menton), moyenne G/D, en degrés.
                // Ancre_haute = L132 à gauche, L361 à droite. Atan2(|cross|, dot) ∈ [0, π].
                const L132 = _jawGet(132), L361 = _jawGet(361);
                let angle_gonion_moyen = null;
                if (L132 && L361) {
                    const _jawAngleAt = (pivot, a, b) => {
                        const ax = a.x - pivot.x, ay = a.y - pivot.y;
                        const bx = b.x - pivot.x, by = b.y - pivot.y;
                        const dot = ax * bx + ay * by;
                        const crs = ax * by - ay * bx;
                        return Math.atan2(Math.abs(crs), dot) * (180 / Math.PI);
                    };
                    const aG = _jawAngleAt(G_g, L132, menton);
                    const aD = _jawAngleAt(G_d, L361, menton);
                    angle_gonion_moyen = (aG + aD) / 2;
                }

                // Features 4-5 : largeurs aux fractions 0.5 et 0.75 de H_jaw, en ratio sur W_gonion.
                // y_mid descend du niveau gonion vers le menton (axe Y MediaPipe vers le bas).
                // Pour chaque branche (gauche : G_g → menton via arc ; droite : menton → G_d),
                // on intersecte les segments consécutifs avec la ligne horizontale y = y_target.
                const _jawWidthAtFraction = (frac) => {
                    const baseY  = (G_g.y + G_d.y) / 2;
                    const y_tgt  = baseY + frac * H_jaw;
                    // Indice de menton dans JAW_ARC_ORDER : L152 est au milieu (idx 8 sur 17).
                    const idxMenton = JAW_ARC_ORDER.indexOf(152);
                    const _intersectBranch = (start, end) => {
                        // Cherche le 1er segment où la branche traverse y_tgt.
                        for (let i = start; i < end; i++) {
                            const A = _jawPts[i], B = _jawPts[i + 1];
                            const y0 = A.y, y1 = B.y;
                            if ((y0 - y_tgt) * (y1 - y_tgt) <= 0 && Math.abs(y1 - y0) > 1e-12) {
                                const t = (y_tgt - y0) / (y1 - y0);
                                return A.x + t * (B.x - A.x);
                            }
                        }
                        return null;
                    };
                    const xG = _intersectBranch(0, idxMenton);
                    const xD = _intersectBranch(idxMenton, _jawPts.length - 1);
                    if (xG === null || xD === null) return null;
                    return Math.abs(xD - xG) / W_gonion;
                };
                const largeur_50_ratio = _jawWidthAtFraction(0.5);
                const largeur_75_ratio = _jawWidthAtFraction(0.75);

                // Feature 6 : taux de remplissage du rectangle bounding gonion×H_jaw.
                const taux_remplissage = A / (W_gonion * H_jaw);

                // Stats de référence (non candidates, mais utiles diag).
                const aire_n      = (faceWidthRaw > 1e-9 && faceHeightRaw > 1e-9)
                                    ? A / (faceWidthRaw * faceHeightRaw) : null;
                const perimetre_n = (faceWidthRaw > 1e-9) ? P / faceWidthRaw : null;

                attributes.machoire_silhouette = {
                    compacite,
                    excentricite,
                    angle_gonion_moyen,
                    largeur_50_ratio,
                    largeur_75_ratio,
                    taux_remplissage,
                    aire_n,
                    perimetre_n,
                };
            } else {
                console.warn('[pilote machoire_silhouette] W_gonion ou H_jaw dégénéré, bloc absent');
            }
        } else {
            console.warn('[pilote machoire_silhouette] landmark manquant dans l\'arc, bloc absent');
        }
    } catch (e) {
        console.warn('[pilote machoire_silhouette] erreur:', e && e.message ? e.message : e);
    }

    // ── PILOTE 5.0.x — nez_v2 (étalon inter-canthal) ─────────────────────
    // Diagnostic UNIQUEMENT (jamais écrit en sliders). 6 features normalisées
    // par IC = dist2D(L133, L362) (Endocanthion G/D) ou par d'autres ratios
    // SANS faceW/faceH — ces deux normalisateurs s'annulent (nez court/visage
    // court ≡ nez long/visage long) et zygion est contaminé par les cheveux.
    // Ancres réutilisées (mêmes moyennes multi-landmarks que farkas_features) :
    //   AlareG = mean(129, 209, 220), AlareD = mean(358, 429, 440)
    //   Nasion = mean(168, 6)
    //   Subnasale = mean(2, 94, 19)
    //   Pronasale = mean(4, 1)
    //   Gnathion = mean(152, 175, 199)
    //   Nez_dorsum_G = [195], Nez_dorsum_D = [419]
    // Roll-aligned points. Fail-soft total (warn + bloc absent, pas de throw).
    try {
        const _alignedNz = (typeof computeRollAlignedPoints === 'function')
            ? computeRollAlignedPoints(rawPoints)
            : rawPoints;
        const _nzGet = (idx) => {
            const p = _alignedNz && _alignedNz[String(idx)];
            return (p && Number.isFinite(p.x) && Number.isFinite(p.y)) ? p : null;
        };
        const _nzMean = (ids) => {
            let sx = 0, sy = 0, n = 0;
            for (const i of ids) {
                const p = _nzGet(i);
                if (!p) continue;
                sx += p.x; sy += p.y; n++;
            }
            if (n === 0) return null;
            return { x: sx / n, y: sy / n };
        };

        const Endo_G = _nzGet(133);   // Endocanthion gauche (interne œil G)
        const Endo_D = _nzGet(362);   // Endocanthion droit  (interne œil D)
        const AlareG = _nzMean([129, 209, 220]);
        const AlareD = _nzMean([358, 429, 440]);
        const Nasion    = _nzMean([168, 6]);
        const Subnasale = _nzMean([2, 94, 19]);
        const Pronasale = _nzMean([4, 1]);
        const Gnathion  = _nzMean([152, 175, 199]);
        const Dorsum_G  = _nzGet(195);
        const Dorsum_D  = _nzGet(419);

        if (Endo_G && Endo_D && AlareG && AlareD && Nasion && Subnasale
            && Pronasale && Gnathion && Dorsum_G && Dorsum_D) {

            const IC = Math.hypot(Endo_D.x - Endo_G.x, Endo_D.y - Endo_G.y);

            if (IC > 1e-9) {
                // 1. largeur alaire / IC (remplace indice_alaire dégénéré)
                const alaire   = Math.hypot(AlareD.x - AlareG.x, AlareD.y - AlareG.y);
                const largeur_alaire_ic = alaire / IC;

                // 2. longueur du nez (Nasion → Subnasale, vertical) / IC
                const longueur_nez_brut = Math.abs(Subnasale.y - Nasion.y);
                const longueur_nez_ic   = longueur_nez_brut / IC;

                // 3. position verticale du nez dans le visage
                //    petite = nez haut (Pogba) ; grande = nez bas/tiers moyen
                const denom_face = (Gnathion.y - Nasion.y);
                const position_nez_vert = (denom_face > 1e-9)
                    ? (Subnasale.y - Nasion.y) / denom_face
                    : null;

                // 4. aspect du nez (équivalent indice_nasal, scale-free conservé)
                const aspect_nez = (longueur_nez_brut > 1e-9)
                    ? alaire / longueur_nez_brut
                    : null;

                // 5. largeur d'arête / IC (remplace /faceW)
                const arete_ic = Math.abs(Dorsum_G.x - Dorsum_D.x) / IC;

                // 6. ratio_base_nasale (déjà locale et saine ; conservée)
                const ratio_base_nasale = (alaire > 1e-9)
                    ? Math.abs(Subnasale.y - Pronasale.y) / alaire
                    : null;

                attributes.nez_v2 = {
                    largeur_alaire_ic,
                    longueur_nez_ic,
                    position_nez_vert,
                    aspect_nez,
                    arete_ic,
                    ratio_base_nasale,
                };
            } else {
                console.warn('[pilote nez_v2] IC dégénéré, bloc absent');
            }
        } else {
            console.warn('[pilote nez_v2] ancre manquante (Endocanthion / Alare / Nasion / etc.), bloc absent');
        }
    } catch (e) {
        console.warn('[pilote nez_v2] erreur:', e && e.message ? e.message : e);
    }

    return attributes;
}

// ─── computeZoneGeometry — v1 (legacy) + v2 (Phase 4.1, features typées) ─────
//
// SIGNATURE (rétro-compatible) :
//   computeZoneGeometry(rawPoints, indices, faceW, faceH, cxFace, geomFamily?)
//
// • Sans geomFamily → renvoie les 6 ratios v1 historiques :
//     { largeur_max, hauteur_max, aire_bbox, aspect_ratio, centroide_x, dispersion }
//
// • Avec geomFamily ∈ {bande,contour,arc,pointe,patch} → renvoie les features
//   morphométriques v2 (Phase 4.1), centroide_y commun à toutes les familles.
//   Les valeurs non calculables (n<3, axes dégénérés, etc.) sont à null.
//   IMPORTANT : `centroide_x` est SUPPRIMÉ partout (feature la + bruitée v1).
//
// Sémantique commune :
//   - taille_centroide : sqrt(mean((p-mean)^2)) / faceW   (équivaut à v1 `dispersion`,
//     renommée pour l'API v2 ; reste relative à la largeur du visage).
//   - centroide_y  : (mean_y - cyFace) / faceH (cyFace = milieu vertical L10/L152
//     si dispo, sinon faceH/2 reconstruit à partir des bornes).
function computeZoneGeometry(rawPoints, landmarkIndices, faceW, faceH, cxFace, geomFamily) {
    // ── garde-fous communs ─────────────────────────────────────────────
    const nullV1 = {
        largeur_max: null, hauteur_max: null, aire_bbox: null,
        aspect_ratio: null, centroide_x: null, dispersion: null,
    };
    const _nullV2 = (fam) => {
        // Shape par famille — chaque famille a SA propre liste de clés.
        // ⚠️ Phase 4.1.1 : `taille_centroide` retirée de la famille bande
        // (doublon de largeur_axe, corr 0.94 sur les 41 presets). Conservée
        // pour contour/arc/pointe/patch où elle reste informative.
        if (fam === 'bande') {
            return { epaisseur_perp: null, hauteur_perp: null, largeur_axe: null, centroide_y: null };
        }
        const out = { centroide_y: null, taille_centroide: null };
        if (fam === 'contour')      { out.aire = null; out.perimetre = null; out.compacite = null; out.excentricite = null; }
        else if (fam === 'arc')     { out.corde = null; out.longueur_arc = null; out.sinuosite = null; out.sagitta = null; }
        else if (fam === 'pointe')  { out.largeur_base = null; out.hauteur = null; out.pointu = null; }
        else /* patch */            { out.lambda1 = null; out.lambda2 = null; }
        return out;
    };
    const useV2 = !!geomFamily;
    if (!rawPoints || !Array.isArray(landmarkIndices) || landmarkIndices.length === 0) {
        return useV2 ? _nullV2(geomFamily) : nullV1;
    }
    if (!(faceW > 1e-6) || !(faceH > 1e-6)) return useV2 ? _nullV2(geomFamily) : nullV1;

    const pts = [];
    for (let i = 0; i < landmarkIndices.length; i++) {
        const p = rawPoints[String(landmarkIndices[i])];
        if (!p) return useV2 ? _nullV2(geomFamily) : nullV1;
        pts.push(p);
    }

    // ── stats de base (utilisées par les deux versions) ──────────────
    let minX = +Infinity, maxX = -Infinity;
    let minY = +Infinity, maxY = -Infinity;
    let sumX = 0, sumY = 0;
    for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
        sumX += p.x; sumY += p.y;
    }
    const n = pts.length;
    const meanX = sumX / n, meanY = sumY / n;

    // ── V1 (legacy, conservé tel quel) ───────────────────────────────
    if (!useV2) {
        const dx = maxX - minX, dy = maxY - minY;
        const largeur_max  = dx / faceW;
        const hauteur_max  = dy / faceH;
        const aire_bbox    = largeur_max * hauteur_max;
        const aspect_ratio = (dx > 1e-12) ? (dy / dx) : null;
        const centroide_x  = (meanX - cxFace) / faceW;
        let sumSq = 0;
        for (let i = 0; i < n; i++) {
            const ex = pts[i].x - meanX, ey = pts[i].y - meanY;
            sumSq += ex * ex + ey * ey;
        }
        const dispersion = Math.sqrt(sumSq / n) / faceW;
        return { largeur_max, hauteur_max, aire_bbox, aspect_ratio, centroide_x, dispersion };
    }

    // ── V2 (Phase 4.1) ───────────────────────────────────────────────
    // Centre vertical visage : si non fourni, on dérive du centre yeux→menton (faceH)
    // en passant par le centroïde de la fenêtre — approximation suffisante car
    // centroide_y reste relatif (le matching utilise la moyenne / écart).
    // cxFace passe ici en abscisse du centre visage (déjà calculé côté appelant).
    // cyFace : on tente d'utiliser 0.5 * faceH au-dessous du sommet du visage,
    // mais en pratique on utilise le centre arithmétique de la fenêtre des points
    // (toutes les zones sont quasi centrées si la pose est ok → équivalent).
    const cyFace = (typeof rawPoints['10'] === 'object' && typeof rawPoints['152'] === 'object')
                   ? (rawPoints['10'].y + rawPoints['152'].y) / 2
                   : meanY;
    const centroide_y = (meanY - cyFace) / faceH;

    // taille_centroide (= ex-dispersion)
    let sumSqAll = 0;
    for (let i = 0; i < n; i++) {
        const ex = pts[i].x - meanX, ey = pts[i].y - meanY;
        sumSqAll += ex * ex + ey * ey;
    }
    const taille_centroide = Math.sqrt(sumSqAll / n) / faceW;

    // Covariance 2x2 + axe principal (PCA analytique)
    let cxx = 0, cxy = 0, cyy = 0;
    for (let i = 0; i < n; i++) {
        const ex = pts[i].x - meanX, ey = pts[i].y - meanY;
        cxx += ex * ex; cxy += ex * ey; cyy += ey * ey;
    }
    cxx /= n; cxy /= n; cyy /= n;
    const [lmax, lmin] = eigenvalues2x2([[cxx, cxy], [cxy, cyy]]);
    // Vecteur propre principal (associé à lmax) : on choisit (cxy, lmax-cxx) si
    // cxy non nul, sinon axe canonique. On normalise.
    let vx, vy;
    if (Math.abs(cxy) > 1e-12) {
        vx = cxy;
        vy = lmax - cxx;
    } else {
        if (cxx >= cyy) { vx = 1; vy = 0; } else { vx = 0; vy = 1; }
    }
    const vnorm = Math.hypot(vx, vy) || 1;
    vx /= vnorm; vy /= vnorm;
    // Axe orthogonal
    const wx = -vy, wy = vx;

    if (geomFamily === 'patch') {
        return {
            centroide_y,
            taille_centroide,
            lambda1: lmax / (faceW * faceW),
            lambda2: lmin / (faceW * faceW),
        };
    }

    if (geomFamily === 'contour') {
        // Ordonner par angle autour du centroïde
        const sorted = pts
            .map(p => ({ p, a: Math.atan2(p.y - meanY, p.x - meanX) }))
            .sort((u, v) => u.a - v.a)
            .map(o => o.p);
        const A = polygonArea(sorted);
        const P = perimetre(sorted);
        const aire        = A / (faceW * faceH);
        const perimetre_n = P / faceW;
        const compacite   = (P > 1e-12) ? (4 * Math.PI * A) / (P * P) : null;
        const excentricite = (lmax > 1e-12) ? Math.sqrt(Math.max(0, 1 - lmin / lmax)) : null;
        return { centroide_y, taille_centroide, aire, perimetre: perimetre_n, compacite, excentricite };
    }

    if (geomFamily === 'bande') {
        // Phase 4.1.1 — estimateur PERPENDICULAIRE (purge du shoelace).
        // Sur une bande fine (ratio ~11:1), l'ordre angulaire autour du centroïde
        // entrelace bords sup/inf → polygone auto-intersecté → aire compressée
        // non-linéaire. Mesurée 10 juin : rho(epaisseur_moy ↔ DNA ep_inf_RE) = -0.07.
        // Remplacé par 2 mesures directes sur l'axe v (perpendiculaire à u) :
        //   epaisseur_perp = 2 × moyenne(|d_i|) / faceH   (estimateur intégral)
        //   hauteur_perp   = (max d_i − min d_i)  / faceH (équivalent roll-aligné de
        //                                                  hauteur_max v1 qui faisait |rho|=0.65)
        // Couverture finale : 2 features épaisseur (perp + largeur étendue dans v)
        // vs 1 largeur (u) — le doublon `taille_centroide` (corr 0.94 avec largeur_axe)
        // est SUPPRIMÉ de cette famille.
        let pmin = +Infinity, pmax = -Infinity;      // projections sur u (axe long)
        let qmin = +Infinity, qmax = -Infinity;      // projections sur v (axe perp)
        let sumAbsQ = 0;
        for (let i = 0; i < n; i++) {
            const ex = pts[i].x - meanX, ey = pts[i].y - meanY;
            const proj_u = ex * vx + ey * vy;
            const proj_v = ex * wx + ey * wy;
            if (proj_u < pmin) pmin = proj_u;
            if (proj_u > pmax) pmax = proj_u;
            if (proj_v < qmin) qmin = proj_v;
            if (proj_v > qmax) qmax = proj_v;
            sumAbsQ += Math.abs(proj_v);
        }
        const largeur_axe   = (pmax - pmin) / faceW;
        const epaisseur_perp = (2 * (sumAbsQ / n)) / faceH;
        const hauteur_perp   = (qmax - qmin) / faceH;
        return { centroide_y, epaisseur_perp, hauteur_perp, largeur_axe };
    }

    if (geomFamily === 'arc') {
        // Ordonner par projection sur l'axe principal
        const proj = pts.map(p => ({ p, t: (p.x - meanX) * vx + (p.y - meanY) * vy }));
        proj.sort((u, v) => u.t - v.t);
        const ordered = proj.map(o => o.p);
        // corde : distance entre 1er et dernier point ordonné
        const a = ordered[0], b = ordered[ordered.length - 1];
        const cord = Math.hypot(b.x - a.x, b.y - a.y);
        // longueur de l'arc
        let L = 0;
        for (let i = 1; i < ordered.length; i++) {
            L += Math.hypot(ordered[i].x - ordered[i - 1].x, ordered[i].y - ordered[i - 1].y);
        }
        const sinuosite = (cord > 1e-12) ? (L / cord) : null;
        // sagitta : déviation perpendiculaire max à la corde, signée (axe w)
        let saMax = 0;
        const cmx = (a.x + b.x) / 2, cmy = (a.y + b.y) / 2;
        for (let i = 0; i < ordered.length; i++) {
            const d = (ordered[i].x - cmx) * wx + (ordered[i].y - cmy) * wy;
            if (Math.abs(d) > Math.abs(saMax)) saMax = d;
        }
        const corde   = cord / faceW;
        const longueur_arc = L / faceW;
        const sagitta = saMax / faceH;
        return { centroide_y, taille_centroide, corde, sinuosite, sagitta, longueur_arc };
    }

    if (geomFamily === 'pointe') {
        // largeur_base = étendue PC1 ; hauteur = étendue PC2 ; pointu = 2|sagitta|/largeur_base
        let p1min = +Infinity, p1max = -Infinity;
        let p2min = +Infinity, p2max = -Infinity;
        for (let i = 0; i < n; i++) {
            const pp1 = (pts[i].x - meanX) * vx + (pts[i].y - meanY) * vy;
            const pp2 = (pts[i].x - meanX) * wx + (pts[i].y - meanY) * wy;
            if (pp1 < p1min) p1min = pp1; if (pp1 > p1max) p1max = pp1;
            if (pp2 < p2min) p2min = pp2; if (pp2 > p2max) p2max = pp2;
        }
        const dx1 = p1max - p1min;
        const dy2 = p2max - p2min;
        const largeur_base = dx1 / faceW;
        const hauteur      = dy2 / faceH;
        // sagitta (signée sur axe w, mesurée par rapport au milieu PC1)
        const proj = pts.map(p => ({ p, t: (p.x - meanX) * vx + (p.y - meanY) * vy }));
        proj.sort((u, v) => u.t - v.t);
        const ordered = proj.map(o => o.p);
        const a = ordered[0], b = ordered[ordered.length - 1];
        const cmx = (a.x + b.x) / 2, cmy = (a.y + b.y) / 2;
        let saMax = 0;
        for (let i = 0; i < ordered.length; i++) {
            const d = (ordered[i].x - cmx) * wx + (ordered[i].y - cmy) * wy;
            if (Math.abs(d) > Math.abs(saMax)) saMax = d;
        }
        const pointu = (dx1 > 1e-12) ? (2 * Math.abs(saMax) / dx1) : null;
        return { centroide_y, taille_centroide, largeur_base, hauteur, pointu };
    }

    // famille inconnue → retomber sur null v2 patch
    return _nullV2('patch');
}
if (typeof window !== 'undefined') window.computeZoneGeometry = computeZoneGeometry;

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

// ═══════════════════════════════════════════════════════════════════════════
// Phase 5.0 — CONTOUR GATE (sélection de la tête de réf par forme de tête)
// ═══════════════════════════════════════════════════════════════════════════
// Étage de pré-filtrage : Mahalanobis 9-zones converge vers le preset central
// du pool (116 Ovale) pour tout visage hors-pool, choisissant un OVALE pour
// un visage CARRÉ. On filtre le pool par signature de contour (4 ratios
// dérivés des scanned_stats existants) AVANT computeGlobalDistance.
const CONTOUR_GATE_K = 8;

function computeContourSignature(stats) {
  if (!stats || !stats.base || !stats.machoire || !stats.joues || !stats.front) return null;
  const c1 = stats.base.width / stats.base.height;     // compacité L/H (élevé = large/court)
  const c2 = stats.machoire.width / stats.joues.width; // taper bas du visage (élevé = carré)
  const c3 = stats.machoire.angle;                     // angularité mandibulaire
  const c4 = stats.front.width / stats.base.width;     // largeur frontale relative
  const sig = { c1, c2, c3, c4 };
  for (const k in sig) if (!Number.isFinite(sig[k])) return null;
  return sig;
}

// Médiane + MAD par feature sur un pool. MAD < 1e-9 → null (drop la feature).
function _contourMedianMAD(values) {
  if (!values || values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const n = sorted.length;
  const median = n % 2 ? sorted[(n - 1) / 2] : 0.5 * (sorted[n / 2 - 1] + sorted[n / 2]);
  const abs = values.map(v => Math.abs(v - median)).sort((a, b) => a - b);
  const mad = n % 2 ? abs[(n - 1) / 2] : 0.5 * (abs[n / 2 - 1] + abs[n / 2]);
  if (!Number.isFinite(median) || !Number.isFinite(mad) || mad < 1e-9) return null;
  return { median, mad };
}

// Applique le gate à un pool. Retourne { gated, topK } où gated est le pool
// filtré (top-K) et topK est un tableau [{id, position, forme, dist}] pour
// inspection. Si fail-soft, gated = pool tel quel + warn + topK = [].
function _applyContourGate(pool, userSig, label) {
  if (!userSig || !Array.isArray(pool) || pool.length < 3) {
    console.warn(`[5.0] contour gate bypassé (${label || 'pool'}): pool=${pool && pool.length}, userSig=${!!userSig}`);
    return { gated: pool || [], topK: [] };
  }
  // Collecte les signatures par preset (skip si null).
  const presetSigs = [];
  for (const p of pool) {
    const sig = computeContourSignature(p.scanned_stats);
    if (sig) presetSigs.push({ preset: p, sig });
  }
  if (presetSigs.length < 3) {
    console.warn(`[5.0] contour gate bypassé (${label || 'pool'}): signatures valides=${presetSigs.length}`);
    return { gated: pool, topK: [] };
  }
  const features = ['c1', 'c2', 'c3', 'c4'];
  // Standardisation par feature (médiane/MAD du pool).
  const stats = {};
  const validFeatures = [];
  for (const f of features) {
    const vals = presetSigs.map(x => x.sig[f]);
    const mm = _contourMedianMAD(vals);
    if (mm) {
      stats[f] = mm;
      validFeatures.push(f);
    } else {
      console.warn(`[5.0] contour feature ${f}: MAD < 1e-9, dropped`);
    }
  }
  if (validFeatures.length === 0) {
    console.warn(`[5.0] contour gate bypassé (${label || 'pool'}): aucune feature valide`);
    return { gated: pool, topK: [] };
  }
  const WEIGHTS = { c1: 1.0, c2: 1.0, c3: 0.6, c4: 0.6 };
  const dist = (sig) => {
    let s = 0;
    for (const f of validFeatures) {
      const z = (sig[f] - stats[f].median) / stats[f].mad;
      s += (WEIGHTS[f] || 1.0) * z * z;
    }
    return Math.sqrt(s);
  };
  const ranked = presetSigs
    .map(({ preset, sig }) => ({ preset, dist: dist(sig) }))
    .sort((a, b) => a.dist - b.dist);
  const K = Math.min(CONTOUR_GATE_K, ranked.length);
  const gated = ranked.slice(0, K).map(r => r.preset);
  const topK = ranked.slice(0, K).map(r => ({
    id: r.preset.preset_id,
    position: r.preset.position,
    forme: r.preset.forme_visage,
    dist: r.dist,
  }));
  return { gated, topK };
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
    return { bestPreset: null, ratios: {}, scores: [], contourUser: null, contourTop: [], contourTopOfficial: [] };
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
  const scoringPoolBase = candidates.length > 0 ? candidates : matchable;

  // Phase 5.0 — contour gate : Mahalanobis 9-zones tend vers le preset central.
  // On filtre d'abord par signature de contour pour que la tête de réf ait la
  // bonne forme de tête. Fail-soft : sig user null ou pool < 3 → bypass.
  const contourUser = computeContourSignature(userAttr);
  const { gated: scoringPool, topK: contourTop } = _applyContourGate(scoringPoolBase, contourUser, 'pool41');
  console.log('[5.0 contour] user=', contourUser, '| topK=',
              contourTop.map(t => t.id));

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
  // ── Phase 5.0.1 : bestOfficial DÉRIVÉ de `distances` (gaté contour) ──
  // L'ancien Mahalanobis global sur `officialScoringPool` produisait une 2e
  // vérité (Brahima : bestPreset=299 officiel, mais 2e classement choisissait
  // 116, hors topK contour). Règle unique : on ne re-classe plus, on extrait.
  //
  // Le pool officiel gaté contour reste calculé pour servir de fallback
  // (cas où aucun officiel n'est dans le topK pool-41) et pour computeZoneMix.
  const officialFromPoolBase = scoringPoolBase.filter(p => p.entry_type !== 'celebrity');
  const officialScoringPoolBase = officialFromPoolBase.length > 0 ? officialFromPoolBase : _officialPool();
  const { gated: officialScoringPool, topK: contourTopOfficial } =
    _applyContourGate(officialScoringPoolBase, contourUser, 'pool31');

  // Officiels présents dans `distances` (déjà triés par Mahalanobis sur pool-41
  // gaté contour). C'est la SEULE source de vérité.
  const officialsFromDistances = distances.filter(d =>
    d.preset && d.preset.entry_type !== 'celebrity'
  );

  let bestOfficial = null;
  let bestOfficialVia = null;

  if (bestPreset && bestPreset.entry_type !== 'celebrity') {
    // Cas 1 : bestPreset déjà officiel → identité.
    bestOfficial = bestPreset;
    bestOfficialVia = 'bestPreset officiel';
  } else if (officialsFromDistances.length > 0) {
    // Cas 2 : bestPreset est célébrité → premier officiel dans `distances`.
    bestOfficial = officialsFromDistances[0].preset;
    bestOfficialVia = 'premier officiel gaté';
  } else if (contourTopOfficial && contourTopOfficial.length > 0) {
    // Cas 3 : aucun officiel dans le topK pool-41 → fallback contour pur sur
    // les officiels gatés (PAS de Mahalanobis global qui ramènerait 116).
    const fallbackId = contourTopOfficial[0].id;
    bestOfficial = (officialScoringPool.find(p => p.preset_id === fallbackId)
                 || officialScoringPoolBase.find(p => p.preset_id === fallbackId)
                 || null);
    bestOfficialVia = 'fallback contour';
    console.warn('[5.0.1] aucun officiel dans le topK pool-41 → fallback contour');
  } else {
    bestOfficialVia = 'none';
    console.warn('[5.0.1] aucun officiel trouvable');
  }
  console.log('[5.0.1] official =', bestOfficial ? bestOfficial.preset_id : null,
              '| via:', bestOfficialVia);

  // officialTopPresets : officiels suivants de `distances` (gaté), excluant
  // bestOfficial. Si moins de 4 dispo, on complète via contourTopOfficial.
  const _topIds = new Set();
  const officialTopPresets = [];
  for (const d of officialsFromDistances) {
    if (bestOfficial && d.preset.preset_id === bestOfficial.preset_id) continue;
    if (_topIds.has(d.preset.preset_id)) continue;
    _topIds.add(d.preset.preset_id);
    officialTopPresets.push({
      id: d.preset.preset_id,
      position: d.preset.position,
      forme: d.preset.forme_visage,
      carnation: d.preset.couleur_peau,
      score: d.score,
    });
    if (officialTopPresets.length >= 4) break;
  }
  if (officialTopPresets.length < 4 && Array.isArray(contourTopOfficial)) {
    for (const t of contourTopOfficial) {
      if (bestOfficial && t.id === bestOfficial.preset_id) continue;
      if (_topIds.has(t.id)) continue;
      _topIds.add(t.id);
      const p = officialScoringPoolBase.find(p => p.preset_id === t.id);
      if (!p) continue;
      officialTopPresets.push({
        id: p.preset_id,
        position: p.position,
        forme: p.forme_visage,
        carnation: p.couleur_peau,
        score: null, // fallback : pas de score Mahalanobis ici
      });
      if (officialTopPresets.length >= 4) break;
    }
  }

  // officialScores : aucun consommateur prod (vérifié 5.0.1). Conservé pour
  // rétro-compat avec la même forme {preset_id, position, distance, score, preset}.
  const officialScores = officialsFromDistances.map(d => ({
    preset_id: d.preset_id,
    position: d.position,
    distance: d.distance,
    score: d.score,
    preset: d.preset,
  }));

  // Mix Frankenstein : calculé sur le pool officiel COMPLET (PAS le gate !)
  // Le mix par zone est volontairement indépendant du gate contour — il pioche
  // la meilleure tête par zone parmi tous les officiels admissibles carnation.
  const zoneMix = computeZoneMix(userAttr, officialScoringPoolBase);

  return {
    bestPreset,           // pool 41 (DNA) — peut être célébrité
    ratios: userAttr,
    scores: distances,
    zoneMix,              // calculé sur officiels uniquement
    bestOfficial,         // pool 31 (UI tête de réf)
    officialScores,       // dérivé de `distances` (rétro-compat)
    officialTopPresets,   // top 3-4 officiels pour le bloc Alternatives
    // Phase 5.0 — signature contour user + top-K des deux gates (diag).
    contourUser,
    contourTop,
    contourTopOfficial,
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

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 4.0 — Matching par sous-onglet via ratios morphologiques
// ═══════════════════════════════════════════════════════════════════════════
// Au lieu d'inverser 163 sliders d'un coup (régression v8 = échec), on traite
// chaque sous-onglet indépendamment :
//   1. Layer 1 : best preset (officiel OU célébrité) sur les ratios de la zone.
//   2. Layer 2 : si Layer 1 = célébrité, mapping pré-calculé vers l'officiel
//                EA le plus proche (UI seulement).
//   3. Application du baseline preset Layer 1 + delta % via régression locale
//      slider = a + b*ratio1 + c*ratio2 + d*ratio3 (apprise au build sur 41 presets).
// Les artifacts (zone_definitions, zone_regressions, celebrity_to_official) sont
// chargés en async au démarrage. Si absents → matchZoneByStats retourne null
// → fallback silencieux sur DNA pass2 (comportement pré-Phase 4.0).
// ═══════════════════════════════════════════════════════════════════════════

window._zoneDefinitions = null;
window._zoneRegressions = null;
window._celebrityToOfficialPerZone = null;
window._zoneValidity = null;
window._zoneWeights = null;
window._zoneGroups = null;
window._groupSignatures = null;
window._farkasFeatures = null;
window._zoneArtifactsReady = false;

async function loadZoneArtifacts() {
  const safeFetch = async (url) => {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn(`[Phase 4.0] ${url} indispo (${e.message}) — fallback`);
      return null;
    }
  };
  const [defs, regs, c2o, validity, weights, groups, signatures, farkas] = await Promise.all([
    safeFetch('./zone_definitions.json'),
    safeFetch('./zone_regressions.json'),
    safeFetch('./celebrity_to_official_per_zone.json'),
    safeFetch('./zone_validity.json'),
    safeFetch('./zone_weights.json'),
    safeFetch('./zone_groups.json'),
    safeFetch('./group_signatures.json'),
    safeFetch('./farkas_features.json'),
  ]);
  window._zoneDefinitions = defs;
  window._zoneRegressions = regs;
  window._celebrityToOfficialPerZone = c2o;
  window._zoneValidity = validity;
  window._zoneWeights  = weights;
  window._zoneGroups   = groups;
  window._groupSignatures = signatures;
  window._farkasFeatures = farkas;
  window._zoneArtifactsReady = true;
  const n  = defs    && defs.zones    ? Object.keys(defs.zones).length    : 0;
  const m  = regs    && regs.zones    ? Object.keys(regs.zones).length    : 0;
  const nv = validity && validity.zones ? Object.keys(validity.zones).length : 0;
  const nw = weights  && weights.zones  ? Object.keys(weights.zones).length  : 0;
  const ng = groups   && groups.groups  ? Object.keys(groups.groups).length  : 0;
  const nsig = signatures && signatures.groups ? Object.keys(signatures.groups).filter(k => !signatures.groups[k].signature_disabled).length : 0;
  const nfark = farkas && farkas.groups ? Object.keys(farkas.groups).length : 0;
  const wMeta = weights && weights._meta ? weights._meta : {};
  console.log('[Phase 4.0] Zone artifacts loaded:',
    `definitions=${n}`, `regressions=${m}`,
    `c2o=${c2o ? Object.keys(c2o).filter(k => k !== '_meta').length : 0}`,
    `validity=${nv}`,
    `weights=${nw}${nw ? ` (n_intra=${wMeta.n_pairs_intra||0})` : ''}`,
    `groups=${ng}`,
    `signatures=${nsig}(enabled)`,
    `farkas=${nfark}`);
}
window.loadZoneArtifacts = loadZoneArtifacts;
loadZoneArtifacts();

// matchZoneByStats(userAttrs, zoneKey, allPresets) — retourne :
//   {
//     zone, best_preset_id_morpho, display_official_id, distance,
//     sliders: { flat_key: value 0-100, ... }
//   }
// ou null si conditions non remplies (artifacts pas chargés, ratios manquants,
// pas de preset matchable, etc.). L'appelant traite null comme "pas de match"
// et garde le comportement par défaut sur les sliders concernés.
function matchZoneByStats(userAttrs, zoneKey, allPresets) {
  if (!userAttrs) return null;
  if (!window._zoneDefinitions || !window._zoneRegressions) return null;

  const zoneDef = window._zoneDefinitions.zones && window._zoneDefinitions.zones[zoneKey];
  if (!zoneDef) return null;
  const zoneReg = window._zoneRegressions.zones && window._zoneRegressions.zones[zoneKey];
  if (!zoneReg) return null;

  // v4.1.0 : pour les 20 nouvelles zones squelette, scanned_stats_key n'est
  // pas pose (la cle stats == zoneKey). On retombe sur zoneKey si absent.
  const statsKey = zoneDef.scanned_stats_key || zoneKey;
  const userZoneStats = userAttrs[statsKey];
  if (!userZoneStats) return null;

  const ratios = zoneDef.ratios;
  const means  = zoneReg.ratios_mean;
  const stds   = zoneReg.ratios_std;

  // Vecteur user standardisé (centré-réduit)
  const userVec = [];
  for (let i = 0; i < ratios.length; i++) {
    const v = userZoneStats[ratios[i]];
    if (typeof v !== 'number' || !Number.isFinite(v)) return null;
    const s = stds[i] || 1;
    userVec.push((v - means[i]) / s);
  }

  // Layer 1 — best preset (officiel ou célébrité) sur cette zone
  // Phase 4.1.2 : distance Fisher-pondérée (Var_inter / Var_intra normalisées
  // par zone, sommant à 1). Les features instables chez la même personne
  // (var_intra élevée) sont écrasées ; les features discriminantes inter-presets
  // pèsent jusqu'à 0.85+ (cf. zone_weights.json). Fail-open : sans zone_weights
  // chargé, on retombe sur la distance euclidienne équipondérée historique.
  const _zw = (typeof window !== 'undefined') ? window._zoneWeights : null;
  const W   = (_zw && _zw.zones && _zw.zones[zoneKey] && Array.isArray(_zw.zones[zoneKey].weights))
              ? _zw.zones[zoneKey].weights
              : null;
  const Nr  = ratios.length;
  const wDefault = Nr > 0 ? (1 / Nr) : 0;
  let bestPreset = null, bestDist = Infinity;
  if (!Array.isArray(allPresets)) return null;
  for (let p_i = 0; p_i < allPresets.length; p_i++) {
    const p = allPresets[p_i];
    const pStats = p && p.scanned_stats && p.scanned_stats[statsKey];
    if (!pStats) continue;
    let d = 0, ok = true;
    for (let i = 0; i < ratios.length; i++) {
      const v = pStats[ratios[i]];
      if (typeof v !== 'number' || !Number.isFinite(v)) { ok = false; break; }
      const pn = (v - means[i]) / (stds[i] || 1);
      const diff = userVec[i] - pn;
      const w = (W && Number.isFinite(W[i])) ? W[i] : wDefault;
      d += w * diff * diff;
    }
    if (!ok) continue;
    d = Math.sqrt(d);
    if (d < bestDist) { bestDist = d; bestPreset = p; }
  }
  if (!bestPreset) return null;

  // Layer 2 — si célébrité, mapper sur officiel pour affichage UI
  let displayOfficialId = bestPreset.preset_id;
  const isCelebrity = bestPreset.entry_type === 'celebrity'
                   || (typeof bestPreset.preset_id === 'number' && bestPreset.preset_id >= 10000);
  if (isCelebrity && window._celebrityToOfficialPerZone
      && window._celebrityToOfficialPerZone[zoneKey]) {
    const mapping = window._celebrityToOfficialPerZone[zoneKey][String(bestPreset.preset_id)];
    if (mapping && Number.isFinite(mapping.best_official)) {
      displayOfficialId = mapping.best_official;
    }
  }

  // Application des sliders
  const family = zoneDef.family;
  // v4.1.1 : lecture canonique de la DNA via lookupPresetDNAByFamily.
  // - Squelette officiel : faconner.squelette n'existe pas (DNA dans preset.avance,
  //   table DNA_KEY_MAP). lookupPresetDNAByFamily resoud ca via lookupPresetDNA.
  // - Squelette celebrite, Chair/Graisse officiels (Notion v4) + celebrites :
  //   faconner.<fam>[flatKey] flat. lookupPresetDNAByFamily resoud aussi ca.
  // L'ancien acces direct `bestPreset.faconner[family][sliderKey]` retournait
  // undefined pour le squelette officiel -> zone non couverte.
  const baselineStats   = bestPreset.scanned_stats && bestPreset.scanned_stats[statsKey];
  const targetRatios    = ratios.map(r => userZoneStats[r]);
  const baselineRatios  = baselineStats ? ratios.map(r => baselineStats[r]) : null;
  const noDelta = new Set(zoneDef.sliders_no_delta || []);
  const _lookup = (typeof window !== 'undefined') ? window.lookupPresetDNAByFamily : null;

  // v4.1.0 : les 20 nouvelles zones squelette n'ont pas de sliders associes
  // (Mode A pur strict, usage diagnostique). Defaut [] -> finalSliders reste vide,
  // aucun override de slider, mais l'objet de retour est bien rempli.
  const finalSliders = {};
  for (const sliderKey of (zoneDef.sliders || [])) {
    let base;
    if (typeof _lookup === 'function') {
      base = _lookup(bestPreset, family, sliderKey);
    } else {
      // fallback ultime si lookupPresetDNAByFamily n'est pas dispo
      const bs = (bestPreset.faconner && bestPreset.faconner[family]) || {};
      base = bs[sliderKey];
    }
    if (typeof base !== 'number' || !Number.isFinite(base)) continue;

    // PHASE 4.0 — delta désactivé temporairement (Mode A pur par zone).
    // Les sliders viennent directement du preset matché par zone, sans
    // correction via régression locale. À ré-activer quand on saura
    // pourquoi la régression dégrade ; le bloc original est conservé
    // ci-dessous en commentaire pour ré-activation rapide.
    finalSliders[sliderKey] = base;

    // ── bloc delta (désactivé) ────────────────────────────────────────────
    // if (noDelta.has(sliderKey)) {
    //   finalSliders[sliderKey] = base;
    //   continue;
    // }
    // const reg = zoneReg.regressions && zoneReg.regressions[sliderKey];
    // if (!reg || !Array.isArray(reg.coeffs) || reg.coeffs.length < (1 + ratios.length)
    //     || !baselineRatios) {
    //   finalSliders[sliderKey] = base;
    //   continue;
    // }
    // const predict = (rs) => {
    //   let v = reg.coeffs[0];
    //   for (let i = 0; i < ratios.length; i++) v += reg.coeffs[i + 1] * rs[i];
    //   return v;
    // };
    // const delta = predict(targetRatios) - predict(baselineRatios);
    // finalSliders[sliderKey] = base + delta;
  }

  // v4.1.1 — confidence preparatoire (badges FIABLE / CORRECT / APPROX a caler
  // ensuite avec Alex). Seuils heuristiques posés sur la distance euclidienne
  // z-scoree de la zone (cf. diag_zone_discrimination : dist_mediane ~2.0-3.0
  // toutes zones, paires confondues sous 0.5). Pas encore cable au rendu :
  // _meta.zone_matches[zoneKey].confidence est expose, libre a l'UI de lire.
  let confidence;
  if      (bestDist < 0.8) confidence = 'FIABLE';
  else if (bestDist < 2.0) confidence = 'CORRECT';
  else                     confidence = 'APPROX';

  return {
    zone: zoneKey,
    best_preset_id_morpho: bestPreset.preset_id,
    display_official_id: displayOfficialId,
    distance: bestDist,
    confidence,
    sliders: finalSliders,
  };
}
window.matchZoneByStats = matchZoneByStats;

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 4.1.3 — Matching par GROUPE anatomique
// ═══════════════════════════════════════════════════════════════════════════
// Un niveau intermediaire entre la zone individuelle et le visage entier.
// Pour les regions ou la realite physique etale 1 morpho sur ~10 sous-onglets
// (ex. levre inferieure), le matching par zone seul fragmente la recette
// (pioche dans 7 presets differents pour une seule levre) -> visage brise sur
// un moteur non lineaire (Frostbite). Le niveau groupe choisit UN seul preset
// p* par groupe via la moyenne des d_z (Fisher-ponderees), et impose une
// marge stricte (facteur 2x) pour qu'un sous-onglet quitte le preset choisi.
// ═══════════════════════════════════════════════════════════════════════════

// Helper interne : distance Fisher-ponderee user<->preset sur UNE zone.
// Retourne le scalaire (>=0) ou null si non calculable (zone def absente,
// stats user manquantes, preset n'a pas la zone, feature non finie).
// Reprend strictement la meme logique que matchZoneByStats (memes ratios,
// memes means/stds, memes weights) -> coherence garantie avec le niveau zone.
function _computeZoneDistanceForPreset(userAttrs, zoneKey, preset) {
  if (!userAttrs || !preset) return null;
  if (!window._zoneDefinitions || !window._zoneRegressions) return null;
  const zoneDef = window._zoneDefinitions.zones && window._zoneDefinitions.zones[zoneKey];
  if (!zoneDef) return null;
  const zoneReg = window._zoneRegressions.zones && window._zoneRegressions.zones[zoneKey];
  if (!zoneReg) return null;
  const statsKey = zoneDef.scanned_stats_key || zoneKey;
  const userZoneStats = userAttrs[statsKey];
  if (!userZoneStats) return null;
  const pStats = preset.scanned_stats && preset.scanned_stats[statsKey];
  if (!pStats) return null;
  const ratios = zoneDef.ratios;
  const means  = zoneReg.ratios_mean;
  const stds   = zoneReg.ratios_std;
  if (!Array.isArray(ratios) || !Array.isArray(means) || !Array.isArray(stds)) return null;
  const _zw = window._zoneWeights;
  const W   = (_zw && _zw.zones && _zw.zones[zoneKey] && Array.isArray(_zw.zones[zoneKey].weights))
              ? _zw.zones[zoneKey].weights : null;
  const Nr  = ratios.length;
  const wDefault = Nr > 0 ? (1 / Nr) : 0;
  let d = 0;
  for (let i = 0; i < ratios.length; i++) {
    const uv = userZoneStats[ratios[i]];
    const pv = pStats[ratios[i]];
    if (typeof uv !== 'number' || !Number.isFinite(uv)) return null;
    if (typeof pv !== 'number' || !Number.isFinite(pv)) return null;
    const s = stds[i] || 1;
    const un = (uv - means[i]) / s;
    const pn = (pv - means[i]) / s;
    const diff = un - pn;
    const w = (W && Number.isFinite(W[i])) ? W[i] : wDefault;
    d += w * diff * diff;
  }
  return Math.sqrt(d);
}

// Indique si une zone est marquee aveugle dans zone_validity.
// Une zone aveugle ne porte pas de signal -> exclue du calcul groupe.
function _isBlindZone(zoneKey) {
  const v = window._zoneValidity;
  if (!v || !v.zones) return false;
  const z = v.zones[zoneKey];
  return !!(z && z.status === 'aveugle');
}

// selectPresetForGroup(groupKey, userAttrs, presets) -> {
//   group: groupKey,
//   preset_id: p*,
//   aggregate_distance: D(p*),
//   n_zones_used: nombre de zones non aveugles + features completes pour p*,
//   escaped_subtabs: Set<zoneKey> -- sous-onglets qui ont trouve mieux ailleurs
//                                    avec marge 2x (d_z(p_z) < 0.5 * d_z(p*)),
//   per_zone: { zoneKey -> { group_preset_distance, best_individual_preset_id,
//                            best_individual_distance, escaped: bool } },
// }
// Retourne null si conditions non remplies (artifacts manquants, groupe inconnu,
// aucun preset ne couvre >= 2 zones non aveugles).
function selectPresetForGroup(groupKey, userAttrs, presets) {
  if (!userAttrs || !Array.isArray(presets) || presets.length === 0) return null;
  const groupsRoot = window._zoneGroups && window._zoneGroups.groups;
  if (!groupsRoot) return null;
  const gDef = groupsRoot[groupKey];
  if (!gDef || !Array.isArray(gDef.subtabs) || gDef.subtabs.length === 0) return null;

  // Filtre des sous-onglets aveugles -- ils ne participent pas a l'agregation.
  const liveSubtabs = gDef.subtabs.filter(z => !_isBlindZone(z));
  if (liveSubtabs.length === 0) {
    console.warn(`[Phase 4.1.3] group '${groupKey}' entierement aveugle -> fallback zone-level`);
    return null;
  }

  // 1) Pour chaque preset, accumuler sum(d_z^2) sur les zones live ou la feature
  //    est calculable. Disqualifie si n_zones_utilisees < 2.
  // 2) Pour chaque sous-onglet live, garder le best individual (p_z, d_z(p_z))
  //    pour la regle de marge stricte.
  const bestPerSubtab = {}; // zoneKey -> { preset_id, distance }
  // perPresetPerZone : preset_idx -> zoneKey -> distance
  const distMap = new Map();

  for (let pi = 0; pi < presets.length; pi++) {
    const p = presets[pi];
    if (!p || !p.scanned_stats) continue;
    const zoneDists = {};
    let sumSq = 0;
    let nUsed = 0;
    for (const zKey of liveSubtabs) {
      const d = _computeZoneDistanceForPreset(userAttrs, zKey, p);
      if (d === null) continue;
      zoneDists[zKey] = d;
      sumSq += d * d;
      nUsed++;
      const cur = bestPerSubtab[zKey];
      if (!cur || d < cur.distance) {
        bestPerSubtab[zKey] = { preset_id: p.preset_id, distance: d };
      }
    }
    if (nUsed < 2) continue;
    distMap.set(pi, {
      preset_id: p.preset_id,
      preset: p,
      aggregate: sumSq / nUsed,
      n_used: nUsed,
      zoneDists,
    });
  }

  if (distMap.size === 0) {
    console.warn(`[Phase 4.1.3] group '${groupKey}' : aucun preset avec >= 2 zones live -> fallback zone-level`);
    return null;
  }

  // 3) argmin du D aggregé.
  let best = null;
  for (const entry of distMap.values()) {
    if (!best || entry.aggregate < best.aggregate) best = entry;
  }

  // 4) Marge stricte : un sous-onglet quitte le preset de groupe seulement si
  //    d_z(p_z) < 0.5 * d_z(p*) (i.e. ~2x meilleur ailleurs).
  const MARGIN_FACTOR = 0.5;
  const escaped = new Set();
  const perZone = {};
  for (const zKey of liveSubtabs) {
    const dGroup = best.zoneDists[zKey];
    const bestInd = bestPerSubtab[zKey];
    if (dGroup === undefined) {
      // p* n'avait pas cette zone calculable -> on laisse le matching individuel.
      escaped.add(zKey);
      perZone[zKey] = {
        group_preset_distance: null,
        best_individual_preset_id: bestInd ? bestInd.preset_id : null,
        best_individual_distance: bestInd ? bestInd.distance : null,
        escaped: true,
        reason: 'group_preset_missing_zone',
      };
      continue;
    }
    const escapes = bestInd
      && bestInd.preset_id !== best.preset_id
      && bestInd.distance < MARGIN_FACTOR * dGroup;
    if (escapes) escaped.add(zKey);
    perZone[zKey] = {
      group_preset_distance: dGroup,
      best_individual_preset_id: bestInd ? bestInd.preset_id : null,
      best_individual_distance: bestInd ? bestInd.distance : null,
      escaped: !!escapes,
    };
  }

  return {
    group: groupKey,
    preset_id: best.preset_id,
    preset: best.preset,
    aggregate_distance: best.aggregate,
    n_zones_used: best.n_used,
    escaped_subtabs: escaped,
    per_zone: perZone,
  };
}
window.selectPresetForGroup = selectPresetForGroup;

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 4.2 — Signature globale par partie anatomique
// ═══════════════════════════════════════════════════════════════════════════
// Plutot que d'agreger les distances par sous-onglet (4.1.3), on calcule
// une signature morphometrique sur le CONTOUR ENTIER de la partie (levre inf,
// levre sup, yeux) puis on compare cette signature a celles des 41 presets.
// Le matching de groupe = la forme rendue la plus proche, mesuree sur le MEME
// objet semantique cote user et cote preset.
//
// Pour les groupes ou MediaPipe n'offre pas de contour ferme robuste (narines,
// nez, joues, front, machoire_menton), `signature_disabled: true` -> on retombe
// sur selectPresetForGroup (4.1.3). Fail-soft : si preset.group_signatures
// manque (avant le re-batch), on retombe egalement sur 4.1.3 -> aucune
// regression pendant la fenetre de migration.
// ═══════════════════════════════════════════════════════════════════════════

// Distance point<->segment 2D (pour epaisseur_moy_perp / hauteur_max_perp).
function _pointToSegmentDistance(p, a, b) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const apx = p.x - a.x, apy = p.y - a.y;
  const ab2 = abx * abx + aby * aby;
  if (ab2 < 1e-12) return Math.hypot(apx, apy);
  let t = (apx * abx + apy * aby) / ab2;
  if (t < 0) t = 0; else if (t > 1) t = 1;
  const cx = a.x + t * abx, cy = a.y + t * aby;
  return Math.hypot(p.x - cx, p.y - cy);
}

// Distance min d'un point a un poly-line (ferme ou ouvert). isClosed = true
// boucle de pts[N-1] a pts[0] dans la comparaison.
function _minDistToContour(p, contour, isClosed) {
  const n = contour.length;
  if (n === 0) return null;
  if (n === 1) return Math.hypot(p.x - contour[0].x, p.y - contour[0].y);
  let min = Infinity;
  const N = isClosed ? n : (n - 1);
  for (let i = 0; i < N; i++) {
    const a = contour[i];
    const b = contour[(i + 1) % n];
    const d = _pointToSegmentDistance(p, a, b);
    if (d < min) min = d;
  }
  return min;
}

// Extraction tableau de points 2D depuis rawPoints (cle = string idx).
// Retourne null si un indice est manquant -> signature non calculable.
function _gatherPoints2D(rawPoints, indices) {
  if (!rawPoints || !Array.isArray(indices)) return null;
  const out = [];
  for (const idx of indices) {
    const p = rawPoints[String(idx)];
    if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') return null;
    out.push({ x: p.x, y: p.y });
  }
  return out;
}

// Construit la signature d'un contour ferme outer-only (oeil).
// Retourne { aire, perimetre, compacite, largeur_axe, hauteur_axe,
//            excentricite, asymetrie_gd, centroide_y, _centroid:{x,y} }.
function _signClosedOuter(outer, faceW, faceH, cyFace) {
  const n = outer.length;
  if (n < 3) return null;
  // moments
  let sumX = 0, sumY = 0, minX = +Infinity, maxX = -Infinity;
  for (const p of outer) {
    sumX += p.x; sumY += p.y;
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
  }
  const meanX = sumX / n, meanY = sumY / n;
  // shoelace + perimetre
  const A = polygonArea(outer);
  const P = perimetre(outer);
  // covariance 2x2 -> PCA
  let cxx = 0, cxy = 0, cyy = 0;
  for (const p of outer) {
    const dx = p.x - meanX, dy = p.y - meanY;
    cxx += dx * dx; cxy += dx * dy; cyy += dy * dy;
  }
  cxx /= n; cxy /= n; cyy /= n;
  const [lmax, lmin] = eigenvalues2x2([[cxx, cxy], [cxy, cyy]]);
  // axes propres
  let vx, vy;
  if (Math.abs(cxy) > 1e-12) { vx = cxy; vy = lmax - cxx; }
  else if (cxx >= cyy)       { vx = 1;   vy = 0; }
  else                        { vx = 0;   vy = 1; }
  const vnorm = Math.hypot(vx, vy) || 1;
  vx /= vnorm; vy /= vnorm;
  const wx = -vy, wy = vx;
  let p1min = +Infinity, p1max = -Infinity;
  let p2min = +Infinity, p2max = -Infinity;
  for (const p of outer) {
    const ex = p.x - meanX, ey = p.y - meanY;
    const pp1 = ex * vx + ey * vy;
    const pp2 = ex * wx + ey * wy;
    if (pp1 < p1min) p1min = pp1; if (pp1 > p1max) p1max = pp1;
    if (pp2 < p2min) p2min = pp2; if (pp2 > p2max) p2max = pp2;
  }
  const largeur_axe  = (p1max - p1min) / faceW;
  const hauteur_axe  = (p2max - p2min) / faceH;
  const excentricite = (lmax > 1e-12) ? Math.sqrt(Math.max(0, 1 - lmin / lmax)) : 0;
  const bboxCx       = (minX + maxX) / 2;
  const asymetrie_gd = (meanX - bboxCx) / faceW;
  const centroide_y  = (meanY - cyFace) / faceH;
  return {
    aire:        A / (faceW * faceH),
    perimetre:   P / faceW,
    compacite:   (P > 1e-12) ? (4 * Math.PI * A) / (P * P) : 0,
    largeur_axe,
    hauteur_axe,
    excentricite,
    asymetrie_gd,
    centroide_y,
    _centroid: { x: meanX, y: meanY },
  };
}

// Construit la signature d'un contour ferme outer + inner (levre).
// outer/inner sont des tableaux de points 2D. Le polygone ferme du vermillon
// = outer + reverse(inner). aire/perimetre/compacite sur ce polygone ferme.
// epaisseur_moy_perp + hauteur_max_perp = distances perpendiculaires outer<->inner.
// Retourne { aire, perimetre, compacite, epaisseur_moy_perp, hauteur_max_perp,
//            largeur_axe, asymetrie_gd, centroide_y }.
function _signClosedLip(outer, inner, faceW, faceH, cyFace) {
  if (!outer || !inner || outer.length < 3 || inner.length < 3) return null;
  // polygone ferme du vermillon
  const ring = outer.slice();
  for (let i = inner.length - 1; i >= 0; i--) ring.push(inner[i]);
  // moments sur outer (la mesure de hauteur/asymetrie est pilotee par le bord visible)
  let sumX = 0, sumY = 0, minX = +Infinity, maxX = -Infinity;
  for (const p of outer) {
    sumX += p.x; sumY += p.y;
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
  }
  const meanX = sumX / outer.length, meanY = sumY / outer.length;
  // aire/perimetre sur ring complet
  const A = polygonArea(ring);
  const P = perimetre(ring);
  // PC1 extent sur outer + inner (largeur visible de la levre)
  const all = outer.concat(inner);
  let amx = 0, amy = 0;
  for (const p of all) { amx += p.x; amy += p.y; }
  amx /= all.length; amy /= all.length;
  let cxx = 0, cxy = 0, cyy = 0;
  for (const p of all) {
    const dx = p.x - amx, dy = p.y - amy;
    cxx += dx * dx; cxy += dx * dy; cyy += dy * dy;
  }
  cxx /= all.length; cxy /= all.length; cyy /= all.length;
  const [lmax] = eigenvalues2x2([[cxx, cxy], [cxy, cyy]]);
  let vx, vy;
  if (Math.abs(cxy) > 1e-12) { vx = cxy; vy = lmax - cxx; }
  else if (cxx >= cyy)       { vx = 1;   vy = 0; }
  else                        { vx = 0;   vy = 1; }
  const vnorm = Math.hypot(vx, vy) || 1;
  vx /= vnorm; vy /= vnorm;
  let p1min = +Infinity, p1max = -Infinity;
  for (const p of all) {
    const ex = p.x - amx, ey = p.y - amy;
    const pp1 = ex * vx + ey * vy;
    if (pp1 < p1min) p1min = pp1; if (pp1 > p1max) p1max = pp1;
  }
  const largeur_axe = (p1max - p1min) / faceW;
  // epaisseur perpendiculaire outer <-> inner (inner traite comme poly-line ouverte)
  let sumDist = 0, maxDist = 0;
  for (const p of outer) {
    const d = _minDistToContour(p, inner, false);
    if (d === null || !Number.isFinite(d)) continue;
    sumDist += d;
    if (d > maxDist) maxDist = d;
  }
  const epaisseur_moy_perp = (sumDist / outer.length) / faceH;
  const hauteur_max_perp   = maxDist / faceH;
  const bboxCx       = (minX + maxX) / 2;
  const asymetrie_gd = (meanX - bboxCx) / faceW;
  const centroide_y  = (meanY - cyFace) / faceH;
  return {
    aire:                A / (faceW * faceH),
    perimetre:           P / faceW,
    compacite:           (P > 1e-12) ? (4 * Math.PI * A) / (P * P) : 0,
    epaisseur_moy_perp,
    hauteur_max_perp,
    largeur_axe,
    asymetrie_gd,
    centroide_y,
  };
}

// Combine 2 signatures _signClosedOuter (G+D) en une signature yeux a 9 features.
function _signCombineEyes(sigL, sigR, faceW) {
  if (!sigL || !sigR) return null;
  const avg = (a, b) => (a + b) / 2;
  const aireSum = sigL.aire + sigR.aire;
  const asymetrie_gd_inter = aireSum > 1e-12 ? (sigR.aire - sigL.aire) / aireSum : 0;
  const dx = sigR._centroid.x - sigL._centroid.x;
  const dy = sigR._centroid.y - sigL._centroid.y;
  const espacement = Math.hypot(dx, dy) / faceW;
  return {
    aire:         avg(sigL.aire, sigR.aire),
    perimetre:    avg(sigL.perimetre, sigR.perimetre),
    compacite:    avg(sigL.compacite, sigR.compacite),
    largeur_axe:  avg(sigL.largeur_axe, sigR.largeur_axe),
    hauteur_axe:  avg(sigL.hauteur_axe, sigR.hauteur_axe),
    excentricite: avg(sigL.excentricite, sigR.excentricite),
    centroide_y:  avg(sigL.centroide_y, sigR.centroide_y),
    asymetrie_gd: asymetrie_gd_inter,
    espacement,
  };
}

// Liste des features dans l'ordre, par groupe. Sert au matching (ordre stable)
// et a l'ecriture des poids Fisher (zone_weights.group_signature_weights).
const GROUP_SIGNATURE_FEATURES = {
  levre_inferieure: [
    'aire', 'perimetre', 'compacite',
    'epaisseur_moy_perp', 'hauteur_max_perp',
    'largeur_axe', 'asymetrie_gd', 'centroide_y',
  ],
  levre_superieure: [
    'aire', 'perimetre', 'compacite',
    'epaisseur_moy_perp', 'hauteur_max_perp',
    'largeur_axe', 'asymetrie_gd', 'centroide_y',
  ],
  yeux: [
    'aire', 'perimetre', 'compacite',
    'largeur_axe', 'hauteur_axe', 'excentricite',
    'centroide_y', 'asymetrie_gd', 'espacement',
  ],
};
if (typeof window !== 'undefined') window.GROUP_SIGNATURE_FEATURES = GROUP_SIGNATURE_FEATURES;

// computeGroupSignature(groupKey, rawLandmarks) -> {feature: number} | null
//   - applique computeRollAlignedPoints sur rawLandmarks (cle = string idx)
//   - calcule la signature selon groupKey ("kind" du group_signatures.json)
//   - null si signature_disabled, indices manquants, faceW/faceH degeneres
function computeGroupSignature(groupKey, rawLandmarks) {
  if (!groupKey || !rawLandmarks) return null;
  const root = window._groupSignatures && window._groupSignatures.groups;
  if (!root) return null;
  const def = root[groupKey];
  if (!def || def.signature_disabled === true) return null;

  // rawLandmarks accepte tableau MediaPipe (index numerique) OU objet {idx:point}
  let rawPoints;
  if (Array.isArray(rawLandmarks)) {
    rawPoints = {};
    for (let i = 0; i < rawLandmarks.length; i++) {
      const p = rawLandmarks[i];
      if (p) rawPoints[String(i)] = p;
    }
  } else {
    rawPoints = rawLandmarks;
  }

  // Normalisation : roll-alignment puis faceW/faceH/cyFace
  const aligned = (typeof computeRollAlignedPoints === 'function')
    ? computeRollAlignedPoints(rawPoints)
    : rawPoints;
  const L234 = aligned['234'], L454 = aligned['454'];
  const L10  = aligned['10'],  L152 = aligned['152'];
  if (!L234 || !L454 || !L10 || !L152) return null;
  const faceW = Math.hypot(L454.x - L234.x, L454.y - L234.y);
  const faceH = Math.hypot(L152.x - L10.x,  L152.y - L10.y);
  if (!(faceW > 1e-6) || !(faceH > 1e-6)) return null;
  const cyFace = (L10.y + L152.y) / 2;

  if (def.kind === 'closed_outer_inner') {
    const outer = _gatherPoints2D(aligned, def.landmarks_outer);
    const inner = _gatherPoints2D(aligned, def.landmarks_inner);
    if (!outer || !inner) return null;
    return _signClosedLip(outer, inner, faceW, faceH, cyFace);
  }
  if (def.kind === 'closed_dual_outer') {
    const left  = _gatherPoints2D(aligned, def.landmarks_outer_left);
    const right = _gatherPoints2D(aligned, def.landmarks_outer_right);
    if (!left || !right) return null;
    const sigL = _signClosedOuter(left,  faceW, faceH, cyFace);
    const sigR = _signClosedOuter(right, faceW, faceH, cyFace);
    const combined = _signCombineEyes(sigL, sigR, faceW);
    return combined;
  }
  return null;
}
if (typeof window !== 'undefined') window.computeGroupSignature = computeGroupSignature;

// Calcule la signature pour TOUS les groupes enables, retourne un dict.
function computeAllGroupSignatures(rawLandmarks) {
  const root = window._groupSignatures && window._groupSignatures.groups;
  if (!root) return {};
  const out = {};
  for (const gk in root) {
    if (root[gk].signature_disabled === true) continue;
    const sig = computeGroupSignature(gk, rawLandmarks);
    if (sig) out[gk] = sig;
  }
  return out;
}
if (typeof window !== 'undefined') window.computeAllGroupSignatures = computeAllGroupSignatures;

// Lookup signature precalculee sur un preset. Le batch ecrit preset.group_signatures
// = { groupKey: { feature: number } }. Fail-soft : retourne null si manquant.
function _lookupPresetSignature(preset, groupKey) {
  if (!preset || !preset.group_signatures) return null;
  const sig = preset.group_signatures[groupKey];
  if (!sig || typeof sig !== 'object') return null;
  return sig;
}

// Recupere les poids Fisher pour les features de signature d'un groupe.
// zone_weights.group_signature_weights[groupKey] = { features: [...], weights: [...] }
// Si absent -> uniforme (1/N).
function _signatureWeights(groupKey) {
  const features = GROUP_SIGNATURE_FEATURES[groupKey];
  if (!Array.isArray(features) || features.length === 0) return { features: [], weights: [] };
  const N = features.length;
  const W = window._zoneWeights;
  const root = W && W.group_signature_weights;
  const entry = root && root[groupKey];
  if (entry && Array.isArray(entry.features) && Array.isArray(entry.weights)
      && entry.features.length === N && entry.weights.length === N) {
    // Verifie que l'ordre matche; sinon reordonne.
    const orderOk = features.every((f, i) => entry.features[i] === f);
    if (orderOk) return { features, weights: entry.weights.slice() };
    const reordered = features.map(f => {
      const idx = entry.features.indexOf(f);
      return idx >= 0 ? entry.weights[idx] : (1 / N);
    });
    return { features, weights: reordered };
  }
  const uniform = features.map(() => 1 / N);
  return { features, weights: uniform };
}

// matchGroupBySignature(groupKey, rawLandmarks, presets) -> {
//   group, preset_id, preset, distance, n_used, escaped_subtabs:Set,
//   per_zone: { zoneKey -> { ... } },
//   signature_user, source: 'signature',
// } ou null si conditions non remplies (signature_disabled, ratios manquants,
// aucun preset n'a la signature). L'appelant doit alors retomber sur
// selectPresetForGroup (4.1.3).
function matchGroupBySignature(groupKey, rawLandmarks, presets) {
  const root = window._groupSignatures && window._groupSignatures.groups;
  if (!root) return null;
  const def = root[groupKey];
  if (!def || def.signature_disabled === true) return null;
  const userSig = computeGroupSignature(groupKey, rawLandmarks);
  if (!userSig) return null;
  if (!Array.isArray(presets) || presets.length === 0) return null;

  const { features, weights } = _signatureWeights(groupKey);
  if (features.length === 0) return null;

  // Vecteur user
  const userVec = features.map(f => {
    const v = userSig[f];
    return Number.isFinite(v) ? v : null;
  });
  if (userVec.some(v => v === null)) return null;

  // Statistiques inter-preset pour normaliser (mu, sigma par feature)
  const presetVecs = [];
  for (const p of presets) {
    const sig = _lookupPresetSignature(p, groupKey);
    if (!sig) continue;
    const vec = features.map(f => {
      const v = sig[f];
      return Number.isFinite(v) ? v : null;
    });
    if (vec.some(v => v === null)) continue;
    presetVecs.push({ preset: p, vec });
  }
  if (presetVecs.length < 2) return null;

  const N = features.length;
  const means = new Array(N).fill(0);
  const stds  = new Array(N).fill(0);
  for (const pv of presetVecs) for (let i = 0; i < N; i++) means[i] += pv.vec[i];
  for (let i = 0; i < N; i++) means[i] /= presetVecs.length;
  for (const pv of presetVecs) for (let i = 0; i < N; i++) {
    const d = pv.vec[i] - means[i];
    stds[i] += d * d;
  }
  for (let i = 0; i < N; i++) {
    stds[i] = Math.sqrt(stds[i] / Math.max(1, presetVecs.length - 1));
    if (stds[i] < 1e-9) stds[i] = 1;
  }

  // Distance Fisher-ponderee, espace standardise
  const standardize = vec => vec.map((v, i) => (v - means[i]) / stds[i]);
  const uZ = standardize(userVec);
  let bestPreset = null, bestDist = Infinity, bestVec = null;
  const scored = [];
  for (const pv of presetVecs) {
    const pZ = standardize(pv.vec);
    let d = 0;
    for (let i = 0; i < N; i++) {
      const diff = uZ[i] - pZ[i];
      d += (weights[i] || 0) * diff * diff;
    }
    d = Math.sqrt(d);
    scored.push({ preset: pv.preset, distance: d });
    if (d < bestDist) { bestDist = d; bestPreset = pv.preset; bestVec = pv.vec; }
  }
  if (!bestPreset) return null;

  // Marge stricte signature : un sous-onglet ne quitte le preset de groupe
  // que si son matching individuel est >= 3x meilleur (vs 2x en 4.1.3).
  const MARGIN_FACTOR = 1 / 3;
  const groupsRoot = window._zoneGroups && window._zoneGroups.groups;
  const gDef = groupsRoot && groupsRoot[groupKey];
  const liveSubtabs = (gDef && Array.isArray(gDef.subtabs))
    ? gDef.subtabs.filter(z => !_isBlindZone(z))
    : [];

  // userAttrs requis pour le test des sous-onglets. Si pas dispo, on saute
  // l'escape (= tout le groupe reste pilote par la signature).
  // window.lastUserAttrs est setee par scanToSliders avant le matching pour
  // que le test soit possible sans recalculer.
  const userAttrs = window.lastUserAttrs || null;
  const escaped = new Set();
  const perZone = {};
  if (userAttrs) {
    for (const zKey of liveSubtabs) {
      const dGroup = _computeZoneDistanceForPreset(userAttrs, zKey, bestPreset);
      let bestInd = null, bestIndDist = Infinity;
      for (const p of presets) {
        const d = _computeZoneDistanceForPreset(userAttrs, zKey, p);
        if (d === null) continue;
        if (d < bestIndDist) { bestIndDist = d; bestInd = p; }
      }
      if (dGroup === null) {
        // signature winner n'a pas cette zone -> reste sous matching individuel.
        escaped.add(zKey);
        perZone[zKey] = {
          group_preset_distance: null,
          best_individual_preset_id: bestInd ? bestInd.preset_id : null,
          best_individual_distance: bestInd ? bestIndDist : null,
          escaped: true,
          reason: 'group_preset_missing_zone',
        };
        continue;
      }
      const escapes = bestInd
        && bestInd.preset_id !== bestPreset.preset_id
        && bestIndDist < MARGIN_FACTOR * dGroup;
      if (escapes) escaped.add(zKey);
      perZone[zKey] = {
        group_preset_distance: dGroup,
        best_individual_preset_id: bestInd ? bestInd.preset_id : null,
        best_individual_distance: bestInd ? bestIndDist : null,
        escaped: !!escapes,
      };
    }
  }

  scored.sort((a, b) => a.distance - b.distance);
  return {
    group: groupKey,
    preset_id: bestPreset.preset_id,
    preset: bestPreset,
    distance: bestDist,
    n_used: presetVecs.length,
    escaped_subtabs: escaped,
    per_zone: perZone,
    signature_user: userSig,
    signature_features: features,
    signature_weights: weights,
    source: 'signature',
    top3: scored.slice(0, 3).map(s => ({ id: s.preset.preset_id, d: s.distance })),
  };
}
if (typeof window !== 'undefined') window.matchGroupBySignature = matchGroupBySignature;

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 4.3 — Architecture morphometrique deterministe (Farkas + Mahalanobis)
// ═══════════════════════════════════════════════════════════════════════════
// Remplace l'agregation z-score equipondere des groupes encore en aggregation
// (visage_global, machoire_menton, joues, front, narines, nez) par des
// features morphometriques 2D frontales publiees (Farkas 1994, Diomande 2018,
// Yang 2023, He 2022) avec ICC > 0.70, et distance de Mahalanobis ponderee
// Fisher sur les 41 presets.
//
// Implementation pragmatique :
//   - Les formules dans farkas_features.json sont DOCUMENTAIRES uniquement.
//     evaluateFarkasFormula() utilise un dispatch JS hardcode (plus robuste
//     qu'un parseur de formule string).
//   - _invertMatrix() existant (k=1/2/3 analytique, k>=4 Gauss-Jordan) sert
//     pour l'inversion de la covariance.
//   - Pitch correction simplifiee (multiplication uniforme y par 1/cos(theta)) :
//     n'affecte PAS les features ratio (mathematiquement no-op), mais le angle
//     theta estime est expose en debug pour iteration future avec 3DDFA pose.
//   - Fail-soft total : si farkas_features.json non charge, si une feature
//     est null, ou si le pool de presets a < 10 vecteurs complets, matchGroupByFarkas
//     retourne null -> l'appelant retombe sur 4.2/4.1.3 sans casser.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Helpers landmarks Farkas ───────────────────────────────────────────────

// Recupere le landmark moyenne pour une cle Farkas (peut etre plusieurs idx).
function _farkasLandmark(rawPoints, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return null;
  let sx = 0, sy = 0, sz = 0, n = 0;
  for (const i of ids) {
    const p = rawPoints[String(i)];
    if (!p) continue;
    sx += p.x;
    sy += p.y;
    sz += (typeof p.z === 'number' ? p.z : 0);
    n++;
  }
  if (n === 0) return null;
  return { x: sx / n, y: sy / n, z: sz / n };
}

function _farkasDist(a, b) {
  if (!a || !b) return null;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function _distY(a, b) {
  if (!a || !b) return null;
  return Math.abs(a.y - b.y);
}

// Angle au point pivot entre les segments pivot->a et pivot->b. Radians, [0, PI].
function _angleAt(pivot, a, b) {
  if (!pivot || !a || !b) return null;
  const ax = a.x - pivot.x, ay = a.y - pivot.y;
  const bx = b.x - pivot.x, by = b.y - pivot.y;
  const dot = ax * bx + ay * by;
  const cross = ax * by - ay * bx;
  const ang = Math.atan2(Math.abs(cross), dot);
  return ang;
}

// Fit y = a*x^2 + b*x + c en moindres carres ordinaires (normal equations).
// Retourne le coefficient quadratique 'a'. null si singulier ou n<3.
function _polyfitQuadraticA(pts) {
  if (!Array.isArray(pts) || pts.length < 3) return null;
  // Construit A^T A (3x3) et A^T y (3) sans construire A (n x 3) explicitement.
  let s0 = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0;
  let sy = 0, sxy = 0, sx2y = 0;
  for (const p of pts) {
    const x = p.x, y = p.y;
    const x2 = x * x;
    s0 += 1;
    s1 += x;
    s2 += x2;
    s3 += x2 * x;
    s4 += x2 * x2;
    sy   += y;
    sxy  += x * y;
    sx2y += x2 * y;
  }
  // M = [[s4, s3, s2], [s3, s2, s1], [s2, s1, s0]]
  // r = [sx2y, sxy, sy]
  const M = [[s4, s3, s2], [s3, s2, s1], [s2, s1, s0]];
  const Minv = _invertMatrix(M);
  if (!Minv) return null;
  const a = Minv[0][0] * sx2y + Minv[0][1] * sxy + Minv[0][2] * sy;
  return Number.isFinite(a) ? a : null;
}

// ─── Pitch estimation + correction (simpliste, voir note 4.3) ──────────────
function estimatePitch(rawPoints, farkasDef) {
  if (!rawPoints || !farkasDef) return 0;
  const lm = farkasDef.landmarks_farkas;
  const nasion    = _farkasLandmark(rawPoints, lm.Nasion);
  const subnasale = _farkasLandmark(rawPoints, lm.Subnasale);
  const gnathion  = _farkasLandmark(rawPoints, lm.Gnathion);
  if (!nasion || !subnasale || !gnathion) return 0;
  const upper = Math.abs(nasion.y - subnasale.y);
  const lower = Math.abs(subnasale.y - gnathion.y);
  if (lower < 1e-9) return 0;
  const ratio = upper / lower;
  const NEUTRAL = (farkasDef._meta && Number.isFinite(farkasDef._meta.neutral_pitch_ratio))
                  ? farkasDef._meta.neutral_pitch_ratio : 0.95;
  const deviation = (ratio - NEUTRAL) / NEUTRAL;
  // small angle : 0.5 rad max par convention. Retourne en radians.
  let theta = deviation * 0.5;
  if (theta > 0.4) theta = 0.4;
  if (theta < -0.4) theta = -0.4;
  return theta;
}
if (typeof window !== 'undefined') window.estimatePitch = estimatePitch;

// Correction pitch simpliste : multiplie y par 1/cos(theta). Ne modifie pas
// les ratios verticaux (mathematiquement no-op pour upper/lower) mais
// preserve le pipeline pour features non-ratio futures. Retourne un nouveau
// dict { idx -> point }.
function applyPitchCorrection(rawPoints, pitchAngle) {
  if (!rawPoints) return rawPoints;
  if (Math.abs(pitchAngle) < 1e-9) return rawPoints;
  const c = Math.cos(pitchAngle);
  if (Math.abs(c) < 1e-6) return rawPoints;
  const k = 1 / c;
  const out = {};
  for (const key in rawPoints) {
    const p = rawPoints[key];
    if (!p) continue;
    out[key] = { x: p.x, y: p.y * k, z: p.z };
  }
  return out;
}
if (typeof window !== 'undefined') window.applyPitchCorrection = applyPitchCorrection;

// ─── Dispatch des formules Farkas (hardcode, evite parseur de string) ──────
function evaluateFarkasFormula(featName, rawPoints, farkasDef, faceW, faceH) {
  if (!rawPoints || !farkasDef) return null;
  const lmd = farkasDef.landmarks_farkas;
  const get = (key) => _farkasLandmark(rawPoints, lmd[key]);

  const Nasion    = get('Nasion');
  const Gnathion  = get('Gnathion');
  const Subnasale = get('Subnasale');
  const Pronasale = get('Pronasale');
  const Trichion  = get('Trichion_centre');
  const Glabella  = get('Glabella');
  const ZygionG   = get('Zygion_G');
  const ZygionD   = get('Zygion_D');
  const FrontoG   = get('Frontotemporale_G');
  const FrontoD   = get('Frontotemporale_D');
  const GonionG   = get('Gonion_approx_G');
  const GonionD   = get('Gonion_approx_D');
  const AlareG    = get('Alare_G');
  const AlareD    = get('Alare_D');
  const ExoG      = get('Exocanthion_G');
  const ExoD      = get('Exocanthion_D');
  const StomionInf= get('Stomion_inf_proxy');
  const DorsumG   = get('Nez_dorsum_G');
  const DorsumD   = get('Nez_dorsum_D');

  switch (featName) {
    // ── visage_global ──────────────────────────────────────────────────
    case 'indice_facial_prosopic': {
      const num = _farkasDist(Nasion, Gnathion);
      const den = _farkasDist(ZygionG, ZygionD);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return 100 * num / den;
    }
    case 'ratio_tiers_faciaux': {
      const u = _distY(Nasion, Subnasale);
      const l = _distY(Subnasale, Gnathion);
      if (!Number.isFinite(u) || !Number.isFinite(l) || l < 1e-9) return null;
      return u / l;
    }
    case 'asymetrie_globale': {
      const pairs = farkasDef.symmetric_pairs_for_asymmetry || [];
      if (!pairs.length || !(faceW > 1e-9)) return null;
      let sum = 0, n = 0;
      for (const [gKey, dKey] of pairs) {
        const G = _farkasLandmark(rawPoints, lmd[gKey]);
        const D = _farkasLandmark(rawPoints, lmd[dKey]);
        if (!G || !D) continue;
        sum += Math.abs(G.x - D.x);
        n++;
      }
      if (n === 0) return null;
      return (sum / n) / faceW;
    }

    // ── machoire_menton ────────────────────────────────────────────────
    case 'angle_mandibulaire': {
      // angle au Gnathion entre GonionG et GonionD
      const a = _angleAt(Gnathion, GonionG, GonionD);
      return Number.isFinite(a) ? a : null;
    }
    case 'angle_convergence_inferieur': {
      // angle entre verticale (point virtuel directement sous Zygion) et segment Zygion->Gnathion.
      // Calcul comme angle entre (0,1) et (Gnathion - Zygion). On somme G + D / 2.
      const oneSide = (Z, Gn) => {
        if (!Z || !Gn) return null;
        const vx = Gn.x - Z.x, vy = Gn.y - Z.y;
        const lenV = Math.hypot(vx, vy);
        if (lenV < 1e-9) return null;
        // verticale "vers le bas" = (0, 1) en convention image y croissant vers le bas
        const dot = vy;  // (0,1) . (vx,vy)
        const cross = vx; // sign info
        return Math.atan2(Math.abs(cross), dot); // angle [0, PI]
      };
      const aG = oneSide(ZygionG, Gnathion);
      const aD = oneSide(ZygionD, Gnathion);
      const vals = [aG, aD].filter(v => Number.isFinite(v));
      if (!vals.length) return null;
      return vals.reduce((s, v) => s + v, 0) / vals.length;
    }
    case 'courbure_symphyse_menton': {
      const ids = farkasDef.chin_curvature_landmarks || [];
      const pts = [];
      for (const i of ids) {
        const p = rawPoints[String(i)];
        if (!p) continue;
        pts.push({ x: p.x, y: p.y });
      }
      if (pts.length < 3) return null;
      const a = _polyfitQuadraticA(pts);
      if (!Number.isFinite(a)) return null;
      // Normaliser : la courbure brute depend de l'echelle (x²) -> normaliser
      // par faceW pour rendre invariant a la taille du visage.
      if (!(faceW > 1e-9)) return a;
      return a * (faceW * faceW);
    }
    case 'ratio_hauteur_mentonniere': {
      const num = _distY(Gnathion, StomionInf);
      const den = _distY(Gnathion, Nasion);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return num / den;
    }

    // ── joues ──────────────────────────────────────────────────────────
    case 'angle_zygomatique': {
      // angle au Zygion entre Frontotemporale et Gonion. G et D, moyenne.
      const aG = _angleAt(ZygionG, FrontoG, GonionG);
      const aD = _angleAt(ZygionD, FrontoD, GonionD);
      const vals = [aG, aD].filter(v => Number.isFinite(v));
      if (!vals.length) return null;
      return vals.reduce((s, v) => s + v, 0) / vals.length;
    }
    case 'ratio_jugo_mandibulaire': {
      const num = _farkasDist(GonionG, GonionD);
      const den = _farkasDist(ZygionG, ZygionD);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return num / den;
    }
    case 'indice_fronto_zygomatique': {
      const num = _farkasDist(FrontoG, FrontoD);
      const den = _farkasDist(ZygionG, ZygionD);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return num / den;
    }
    case 'hauteur_pommettes_normalisee': {
      if (!ZygionG || !ZygionD || !ExoG || !ExoD) return null;
      const zygY = (ZygionG.y + ZygionD.y) / 2;
      const exoY = (ExoG.y + ExoD.y) / 2;
      const den = _distY(Nasion, Gnathion);
      if (!Number.isFinite(den) || den < 1e-9) return null;
      // y croissant vers le bas : zygomatique au-dessus ou en-dessous des yeux selon la pose
      return Math.abs(zygY - exoY) / den;
    }

    // ── front ──────────────────────────────────────────────────────────
    case 'largeur_frontale_minimale': {
      const d = _farkasDist(FrontoG, FrontoD);
      if (!Number.isFinite(d) || !(faceW > 1e-9)) return null;
      return d / faceW;
    }
    case 'indice_fronto_facial': {
      const num = _farkasDist(FrontoG, FrontoD);
      const den = _farkasDist(Nasion, Gnathion);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return num / den;
    }
    case 'ratio_hauteur_front': {
      const num = _distY(Trichion, Glabella);
      const den = _distY(Nasion, Gnathion);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return num / den;
    }

    // ── narines ────────────────────────────────────────────────────────
    case 'indice_alaire': {
      const num = _farkasDist(AlareG, AlareD);
      const den = _farkasDist(ZygionG, ZygionD);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return num / den;
    }
    case 'ratio_base_nasale': {
      const num = _distY(Subnasale, Pronasale);
      const den = _farkasDist(AlareG, AlareD);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return num / den;
    }
    case 'visibilite_columellaire': {
      const num = _distY(Subnasale, Pronasale);
      if (!Number.isFinite(num) || !(faceW > 1e-9)) return null;
      return num / faceW;
    }

    // ── nez ────────────────────────────────────────────────────────────
    case 'indice_nasal': {
      const num = _farkasDist(AlareG, AlareD);
      const den = _distY(Nasion, Subnasale);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return 100 * num / den;
    }
    case 'longueur_pont_nasal_normalisee': {
      const num = _distY(Pronasale, Nasion);
      const den = _distY(Nasion, Gnathion);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den < 1e-9) return null;
      return num / den;
    }
    case 'largeur_arete_milieu': {
      if (!DorsumG || !DorsumD) return null;
      const num = Math.abs(DorsumG.x - DorsumD.x);
      if (!(faceW > 1e-9)) return null;
      return num / faceW;
    }
  }
  return null;
}
if (typeof window !== 'undefined') window.evaluateFarkasFormula = evaluateFarkasFormula;

// ─── computeFarkasFeatures(rawLandmarks) -> { groupKey: { featName: value | null } } ──
// Accepte tableau MediaPipe ou dict {idx:point}. Calcule via :
//   1. roll-alignment (computeRollAlignedPoints, Phase 4.1)
//   2. pitch estimation + correction
//   3. dispatch evaluateFarkasFormula par feature
// Retourne null si farkas_features non charge.
function computeFarkasFeatures(rawLandmarks) {
  const def = window._farkasFeatures;
  if (!def) return null;
  if (!rawLandmarks) return null;

  // Normalise en dict {idx:point}
  let rawPoints;
  if (Array.isArray(rawLandmarks)) {
    rawPoints = {};
    for (let i = 0; i < rawLandmarks.length; i++) {
      const p = rawLandmarks[i];
      if (p) rawPoints[String(i)] = p;
    }
  } else {
    rawPoints = rawLandmarks;
  }

  // 1. roll-alignment
  const aligned = (typeof computeRollAlignedPoints === 'function')
    ? computeRollAlignedPoints(rawPoints) : rawPoints;

  // 2. pitch
  const pitch = estimatePitch(aligned, def);
  const corrected = applyPitchCorrection(aligned, pitch);

  // 3. faceW / faceH
  const L234 = corrected['234'], L454 = corrected['454'];
  const L10  = corrected['10'],  L152 = corrected['152'];
  let faceW = 1, faceH = 1;
  if (L234 && L454) faceW = Math.hypot(L454.x - L234.x, L454.y - L234.y) || 1;
  if (L10  && L152) faceH = Math.hypot(L152.x - L10.x,  L152.y - L10.y)  || 1;

  // 4. dispatch
  const out = { _pitch_radians: pitch };
  for (const gKey in def.groups) {
    const gDef = def.groups[gKey];
    if (!gDef || !gDef.features) continue;
    out[gKey] = {};
    for (const fName in gDef.features) {
      try {
        out[gKey][fName] = evaluateFarkasFormula(fName, corrected, def, faceW, faceH);
      } catch (e) {
        out[gKey][fName] = null;
      }
    }
  }

  // ── Phase 4.3.1 — Fallback Zygion si indice_facial_prosopic aberrant ──
  // Si l'indice sort de la plage humaine [70, 100], les landmarks Zygion 234/454
  // (averages [234,127] / [454,356] dans landmarks_farkas) ont probablement
  // derive sur la tempe/oreille. Recalcul avec [116] / [345], plus internes
  // et plus stables. Le bloc adopte le recalcul s'il EST dans [70,100] OU s'il
  // se rapproche strictement du plage par rapport au raw -- evite que la flag
  // reste undefined alors que le fallback a tourne (bug observe sur Brahima
  // raw=57.39 -> 116/345 trop internes -> nouveau >100, ancienne version
  // n'adoptait rien). On expose explicitement `_zygion_fallback_used`
  // (true/false) + `_zygion_fallback_quality` (in_range/closer/no_improvement
  // /landmarks_missing) pour diagnostic. Scope strict : seul l'indice facial
  // est recalcule, aucune cascade sur les autres features Zygion-dependantes.
  const vgOut = out.visage_global;
  if (vgOut) {
    const idxFac = vgOut.indice_facial_prosopic;
    if (typeof idxFac === 'number' && Number.isFinite(idxFac)
        && (idxFac < 70 || idxFac > 100)) {
      vgOut._indice_facial_prosopic_raw = idxFac;
      const zyGalt = _farkasLandmark(corrected, [116]);
      const zyDalt = _farkasLandmark(corrected, [345]);
      const nasionAlt   = _farkasLandmark(corrected, def.landmarks_farkas.Nasion);
      const gnathionAlt = _farkasLandmark(corrected, def.landmarks_farkas.Gnathion);
      if (!zyGalt || !zyDalt || !nasionAlt || !gnathionAlt) {
        vgOut._zygion_fallback_used = false;
        vgOut._zygion_fallback_quality = 'landmarks_missing';
        console.warn(`[Farkas Zygion] indice=${idxFac.toFixed(2)} hors [70,100] mais landmarks 116/345 absents -- raw conserve.`);
      } else {
        const newW = Math.abs(zyGalt.x - zyDalt.x);
        const newH = Math.abs(nasionAlt.y - gnathionAlt.y);
        const newIdx = (newW > 1e-9) ? (100 * newH / newW) : null;
        if (newIdx === null || !Number.isFinite(newIdx)) {
          vgOut._zygion_fallback_used = false;
          vgOut._zygion_fallback_quality = 'recompute_failed';
          console.warn(`[Farkas Zygion] indice=${idxFac.toFixed(2)} -- recompute newW=${newW} newH=${newH} non finite, raw conserve.`);
        } else {
          // Distance signee au plage [70,100] : 0 si dedans, sinon ecart absolu.
          const distToRange = (v) => v < 70 ? (70 - v) : (v > 100 ? v - 100 : 0);
          const inRange = (newIdx >= 70 && newIdx <= 100);
          const improvement = distToRange(idxFac) - distToRange(newIdx);
          const closer = !inRange && improvement > 1e-9;
          const adopt  = inRange || closer;
          if (adopt) {
            vgOut.indice_facial_prosopic = newIdx;
            vgOut._zygion_fallback_used = true;
            vgOut._zygion_fallback_quality = inRange ? 'in_range' : 'closer';
            console.warn(`[Farkas Zygion] indice=${idxFac.toFixed(2)} hors [70,100] -- fallback 116/345 -> ${newIdx.toFixed(2)} (${vgOut._zygion_fallback_quality}, adopte).`);
          } else {
            vgOut._zygion_fallback_used = false;
            vgOut._zygion_fallback_quality = 'no_improvement';
            console.warn(`[Farkas Zygion] indice=${idxFac.toFixed(2)} hors [70,100] -- fallback 116/345 -> ${newIdx.toFixed(2)} ne reduit pas l'ecart, raw conserve.`);
          }
        }
      }
    }
  }

  return out;
}
if (typeof window !== 'undefined') window.computeFarkasFeatures = computeFarkasFeatures;

// ─── Mahalanobis : helpers + matchByMahalanobis ────────────────────────────

function _matrixCovariance(vectors) {
  const N = vectors.length;
  if (N === 0) return null;
  const D = vectors[0].length;
  if (D === 0) return null;
  const mean = new Array(D).fill(0);
  for (const v of vectors) for (let i = 0; i < D; i++) mean[i] += v[i];
  for (let i = 0; i < D; i++) mean[i] /= N;
  const C = Array.from({ length: D }, () => new Array(D).fill(0));
  for (const v of vectors) {
    for (let i = 0; i < D; i++) {
      const di = v[i] - mean[i];
      for (let j = 0; j < D; j++) C[i][j] += di * (v[j] - mean[j]);
    }
  }
  const denom = Math.max(1, N - 1);
  for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) C[i][j] /= denom;
  return C;
}

function _matrixRegularize(M, lambda) {
  if (!M || !M.length) return M;
  const D = M.length;
  let trace = 0;
  for (let i = 0; i < D; i++) trace += M[i][i];
  const ridge = lambda * (trace / D);
  const out = M.map(row => row.slice());
  for (let i = 0; i < D; i++) out[i][i] += ridge;
  return out;
}

function _quadraticForm(vec, Minv) {
  const D = vec.length;
  let s = 0;
  for (let i = 0; i < D; i++) {
    let row = 0;
    for (let j = 0; j < D; j++) row += Minv[i][j] * vec[j];
    s += vec[i] * row;
  }
  return s;
}

// matchByMahalanobis(userVec, presetVecs, fisherWeights) -> [{idx, distance}]
//   - applique W = diag(sqrt(weights)) en pre-multiplication (poids Fisher)
//   - covariance regularisee Ledoit-Wolf (lambda=0.01 * trace/D)
//   - distance d² = diff^T Σinv diff, garde-fou negatif
//   - fail-soft : fallback diagonal si inversion echoue
// Retourne un tableau trie par distance croissante avec l'indice dans presetVecs.
function matchByMahalanobis(userVec, presetVecs, fisherWeights) {
  if (!Array.isArray(userVec) || !Array.isArray(presetVecs) || presetVecs.length === 0) return [];
  const D = userVec.length;
  if (D === 0) return [];
  const sw = (fisherWeights && fisherWeights.length === D)
    ? fisherWeights.map(w => Math.sqrt(Math.max(0, Number.isFinite(w) ? w : 0)))
    : new Array(D).fill(1);
  const uW = userVec.map((v, i) => sw[i] * v);
  const pW = presetVecs.map(pv => pv.map((v, i) => sw[i] * v));
  const Sigma = _matrixCovariance(pW);
  if (!Sigma) return [];
  const Sreg = _matrixRegularize(Sigma, 0.01);
  let Sinv = _invertMatrix(Sreg);
  if (!Sinv) {
    // Fallback diagonal
    Sinv = Array.from({ length: D }, (_, i) =>
      Array.from({ length: D }, (_, j) =>
        i === j ? 1 / Math.max(Sreg[i][i], 1e-9) : 0));
  }
  const out = [];
  for (let k = 0; k < pW.length; k++) {
    const diff = new Array(D);
    for (let i = 0; i < D; i++) diff[i] = uW[i] - pW[k][i];
    let q = _quadraticForm(diff, Sinv);
    if (!Number.isFinite(q) || q < 0) q = 0;
    out.push({ idx: k, distance: Math.sqrt(q) });
  }
  out.sort((a, b) => a.distance - b.distance);
  return out;
}
if (typeof window !== 'undefined') window.matchByMahalanobis = matchByMahalanobis;

// ─── matchGroupByFarkas(groupKey, userFarkas, presets) -> meme shape que matchGroupBySignature ──
// Construit le vecteur user pour le groupe, recupere les vecteurs preset
// (preset.farkas_features[groupKey]), applique poids Fisher (loaded ou hint),
// distance Mahalanobis, retourne le top + escapes via _computeZoneDistanceForPreset
// (marge stricte 1/3 = 3x meilleur ailleurs).
function matchGroupByFarkas(groupKey, userFarkas, presets) {
  const def = window._farkasFeatures;
  if (!def || !def.groups || !def.groups[groupKey]) return null;
  if (!userFarkas || !userFarkas[groupKey]) return null;
  if (!Array.isArray(presets) || presets.length === 0) return null;
  const groupDef = def.groups[groupKey];
  const featNames = Object.keys(groupDef.features || {});
  if (featNames.length === 0) return null;

  // Vecteur user complet (NaN/null -> abandon)
  const userVec = [];
  for (const fn of featNames) {
    const v = userFarkas[groupKey][fn];
    if (!Number.isFinite(v)) return null;
    userVec.push(v);
  }

  // Poids Fisher : par defaut depuis weight_hint, override depuis
  // zone_weights.farkas_feature_weights[groupKey] si dispo.
  const W = window._zoneWeights;
  const fwRoot = W && W.farkas_feature_weights;
  const fwEntry = fwRoot && fwRoot[groupKey];
  const weights = featNames.map((fn, i) => {
    if (fwEntry && Array.isArray(fwEntry.features) && Array.isArray(fwEntry.weights)) {
      const idx = fwEntry.features.indexOf(fn);
      if (idx >= 0 && Number.isFinite(fwEntry.weights[idx])) return fwEntry.weights[idx];
    }
    const hint = groupDef.features[fn] && groupDef.features[fn].weight_hint;
    return Number.isFinite(hint) ? hint : 1.0;
  });

  // Vecteurs preset complets
  const presetVecs = [];
  for (const p of presets) {
    const pf = p && p.farkas_features && p.farkas_features[groupKey];
    if (!pf) continue;
    const vec = [];
    let ok = true;
    for (const fn of featNames) {
      const v = pf[fn];
      if (!Number.isFinite(v)) { ok = false; break; }
      vec.push(v);
    }
    if (!ok) continue;
    presetVecs.push({ preset: p, vec });
  }
  if (presetVecs.length < 10) return null; // fail-soft

  const matches = matchByMahalanobis(userVec, presetVecs.map(p => p.vec), weights);
  if (!matches.length) return null;
  const best = matches[0];
  const bestPreset = presetVecs[best.idx].preset;

  // Escape rule : marge 3x sur les sous-onglets du groupe (si presents dans zone_groups).
  const MARGIN_FACTOR = 1 / 3;
  const groupsRoot = window._zoneGroups && window._zoneGroups.groups;
  const gDef = groupsRoot && groupsRoot[groupKey];
  const liveSubtabs = (gDef && Array.isArray(gDef.subtabs))
    ? gDef.subtabs.filter(z => !_isBlindZone(z)) : [];
  const userAttrs = window.lastUserAttrs || null;
  const escaped = new Set();
  const perZone = {};
  if (userAttrs && liveSubtabs.length) {
    for (const zKey of liveSubtabs) {
      const dGroup = _computeZoneDistanceForPreset(userAttrs, zKey, bestPreset);
      let bestInd = null, bestIndDist = Infinity;
      for (const p of presets) {
        const d = _computeZoneDistanceForPreset(userAttrs, zKey, p);
        if (d === null) continue;
        if (d < bestIndDist) { bestIndDist = d; bestInd = p; }
      }
      if (dGroup === null) {
        escaped.add(zKey);
        perZone[zKey] = {
          group_preset_distance: null,
          best_individual_preset_id: bestInd ? bestInd.preset_id : null,
          best_individual_distance: bestInd ? bestIndDist : null,
          escaped: true,
          reason: 'group_preset_missing_zone',
        };
        continue;
      }
      const escapes = bestInd
        && bestInd.preset_id !== bestPreset.preset_id
        && bestIndDist < MARGIN_FACTOR * dGroup;
      if (escapes) escaped.add(zKey);
      perZone[zKey] = {
        group_preset_distance: dGroup,
        best_individual_preset_id: bestInd ? bestInd.preset_id : null,
        best_individual_distance: bestInd ? bestIndDist : null,
        escaped: !!escapes,
      };
    }
  }

  return {
    group: groupKey,
    preset_id: bestPreset.preset_id,
    preset: bestPreset,
    distance: best.distance,
    n_used: presetVecs.length,
    n_features_used: featNames.length,
    escaped_subtabs: escaped,
    per_zone: perZone,
    feature_names: featNames,
    feature_values_user: userVec,
    weights_applied: weights,
    method: 'mahalanobis',
    source: 'farkas',
    top3: matches.slice(0, 3).map(m => ({ id: presetVecs[m.idx].preset.preset_id, d: m.distance })),
  };
}
if (typeof window !== 'undefined') window.matchGroupByFarkas = matchGroupByFarkas;
