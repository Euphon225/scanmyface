// ============================================================
// FC26 CRANIUM ANALYZER — PRESET MATCHER v1.0
// Intégrer dans script.js (Antigravity)
// ============================================================


// ─── 2. HELPER : DISTANCE ENTRE 2 LANDMARKS ───────────────
function dist(lm, a, b) {
  const dx = lm[a].x - lm[b].x;
  const dy = lm[a].y - lm[b].y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ─── 3. EXTRACTION DES RATIOS MORPHO DEPUIS MEDIAPIPE ─────
// CORRECTIF v4 : landmarks du nez corrigés.
// AVANT : landmarks 98/327 = pont du nez (mid-bridge) → trop étroit
// APRÈS : landmarks 129/358 = ailes du nez (alar base) → vraie largeur
function extractMorphRatios(landmarks) {
  const faceWidth   = dist(landmarks, 234, 454); // largeur bizygomatique
  const faceHeight  = dist(landmarks, 10,  152); // hauteur front-menton
  const jawWidth    = dist(landmarks, 172, 397); // largeur mâchoire
  const cheekWidth  = dist(landmarks, 123, 352); // largeur joues
  const noseWidth   = dist(landmarks, 129, 358); // CORRIGÉ : ailes du nez (alar base)
  const mouthWidth  = dist(landmarks, 61,  291); // largeur bouche
  const lipHeight   = dist(landmarks, 13,  14);  // épaisseur lèvre supérieure
  const interEye    = dist(landmarks, 33,  263); // distance inter-yeux
  const eyeHeight   = dist(landmarks, 159, 145); // hauteur œil gauche
  const chinHeight  = dist(landmarks, 152, 175); // hauteur du menton

  const ratios = {
    widthHeightRatio:  faceWidth / faceHeight,   // > 0.85 carré, < 0.72 long
    jawToFaceRatio:    jawWidth  / faceWidth,
    cheekToFaceRatio:  cheekWidth / faceWidth,
    noseToInterEye:    noseWidth / interEye,
    mouthToFace:       mouthWidth / faceWidth,
    lipToFace:         lipHeight / faceHeight,
    eyeOpenness:       eyeHeight / interEye,
    chinToFace:        chinHeight / faceHeight,
    // Bruts pour les sliders
    faceWidth, faceHeight, interEye, noseWidth, jawWidth, cheekWidth
  };

  // ── NOUVEAUX RATIOS PHASE 1 ──────────────────────────────────
  // Nez
  const noseHeightRatio   = dist(landmarks, 10, 1) / faceHeight;       // position verticale du nez
  const noseTipZ          = landmarks[1] ? landmarks[1].z : 0;         // profondeur pointe nez (MediaPipe Z)
  const noseCurveRatio    = dist(landmarks, 6, 1) / dist(landmarks, 6, 152); // courbure pont/pointe

  // Bouche
  const mouthPosRatio     = dist(landmarks, 1, 13) / dist(landmarks, 1, 152); // position bouche entre nez et menton
  const lipThicknessRatio = dist(landmarks, 13, 14) / faceHeight;      // épaisseur lèvre supérieure

  // Mâchoire
  const jawPosY           = ((landmarks[172] ? landmarks[172].y : 0) + (landmarks[397] ? landmarks[397].y : 0)) / 2;
  const jawHeightRatio    = (jawPosY - (landmarks[10] ? landmarks[10].y : 0)) / (landmarks[152] ? (landmarks[152].y - landmarks[10].y) : 1); // hauteur angle gonial

  // Menton
  const chinWidthRatio    = dist(landmarks, 169, 394) / faceWidth;     // largeur du menton
  // chinToFace déjà calculé = hauteur menton

  // Yeux
  const eyeMidY           = ((landmarks[159] ? landmarks[159].y : 0) + (landmarks[386] ? landmarks[386].y : 0)) / 2;
  const eyeVerticalRatio  = (eyeMidY - (landmarks[10] ? landmarks[10].y : 0)) / (landmarks[152] ? (landmarks[152].y - landmarks[10].y) : 1); // position verticale des yeux

  // Sourcils — distance verticale entre le bord du sourcil (lm105 G / lm334 D) et le haut de l'œil (lm159 G / lm386 D)
  const eyebrowHeightRatio = (
    dist(landmarks, 105, 159) + dist(landmarks, 334, 386)
  ) / 2 / faceHeight;

  // Écart sourcils — distance horizontale entre les deux sourcils normalisée par largeur faciale
  const eyebrowGap = dist(landmarks, 55, 285) / faceWidth;

  // Volume lèvres — distance verticale entre bord sup lèvre sup (lm0) et bord inf lèvre inf (lm17)
  const lipFullness = dist(landmarks, 0, 17) / faceHeight;

  // Évasement nez — rapport entre largeur des narines (lm49/279) et longueur du nez (lm6 pont → lm197 columelle)
  const noseFlare = dist(landmarks, 49, 279) / (dist(landmarks, 6, 197) || 1);

  // Philtrum — distance sous-nasale (lm2) à bord supérieur lèvre sup (lm0) normalisée par hauteur faciale
  const philtrum = dist(landmarks, 2, 0) / faceHeight;

  // Saillie pommettes — rapport joues (lm123/352) vs tempes (lm54/284)
  const cheekProminence = cheekWidth / (dist(landmarks, 54, 284) || 1);

  // Position yeux — distance front (lm10) au centre œil gauche (lm159) normalisée par hauteur faciale
  const eyeHeightPos = dist(landmarks, 10, 159) / faceHeight;

  // Front / Tempes
  const foreheadWidthRatio = dist(landmarks, 54, 284) / faceWidth;     // largeur du front (tempes)

  // Joues (position verticale des pommettes)
  const cheekMidY         = ((landmarks[116] ? landmarks[116].y : 0) + (landmarks[345] ? landmarks[345].y : 0)) / 2;
  const cheekHeightRatio  = (cheekMidY - (landmarks[10] ? landmarks[10].y : 0)) / (landmarks[152] ? (landmarks[152].y - landmarks[10].y) : 1);

  // ── NOUVEAUX RATIOS V39 (validés académiquement) ─────────────
  // 1. Largeur arête base du nez (lm49/279 = bord extérieur des ailes vs largeur faciale)
  const nez_arete_base = faceWidth
    ? dist(landmarks, 49, 279) / faceWidth
    : 0;

  // 2. Rapport vermillon inférieur/supérieur (lm0=bord sup lèvre, 13=stomion, 14=bord inf lèvre sup, 17=bord inf lèvre inf)
  const _lm0y  = landmarks[0]  ? landmarks[0].y  : 0;
  const _lm13y = landmarks[13] ? landmarks[13].y : 0;
  const _lm14y = landmarks[14] ? landmarks[14].y : 0;
  const _lm17y = landmarks[17] ? landmarks[17].y : 0;
  const _lipUpper = Math.abs(_lm0y - _lm13y);
  const levres_ratio = _lipUpper > 0 ? Math.abs(_lm13y - _lm17y) / _lipUpper : 0;

  // 3. Rapport hauteur menton/philtrum (lm2=subnasale, 13=stomion, 152=pointe menton)
  const _lm2y  = landmarks[2]  ? landmarks[2].y  : 0;
  const _lm152y = landmarks[152] ? landmarks[152].y : 0;
  const _philtrum = Math.abs(_lm2y - _lm13y);
  const menton_ratio = _philtrum > 0 ? Math.abs(_lm13y - _lm152y) / _philtrum : 0;

  // 4. Largeur bigoniale (séparation horizontale max dans le tiers inférieur du visage)
  const FACE_OVAL_IDX = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  const _belowNose = FACE_OVAL_IDX.filter(i => landmarks[i] && landmarks[i].y > _lm2y);
  let machoire_bigoniale = 0;
  if (_belowNose.length >= 2 && faceWidth) {
    let _maxDx = 0;
    for (let i = 0; i < _belowNose.length; i++) {
      for (let j = i + 1; j < _belowNose.length; j++) {
        const dx = Math.abs(landmarks[_belowNose[i]].x - landmarks[_belowNose[j]].x);
        if (dx > _maxDx) _maxDx = dx;
      }
    }
    machoire_bigoniale = _maxDx / faceWidth;
  }

  // Merge dans ratios
  Object.assign(ratios, {
    noseHeightRatio, noseTipZ, noseCurveRatio,
    mouthPosRatio, lipThicknessRatio,
    jawHeightRatio, chinWidthRatio,
    eyeVerticalRatio, foreheadWidthRatio, cheekHeightRatio,
    eyebrowHeightRatio, eyebrowGap, lipFullness, noseFlare,
    philtrum, cheekProminence, eyeHeightPos,
    nez_arete_base, levres_ratio, menton_ratio, machoire_bigoniale
  });

  console.log(`📐 Ratios bruts : Nez=${ratios.noseToInterEye.toFixed(3)} | Mâch=${ratios.jawToFaceRatio.toFixed(3)} | Joues=${ratios.cheekToFaceRatio.toFixed(3)} | Bouche=${ratios.mouthToFace.toFixed(3)}`);
  return ratios;
}

// ═══════════════════════════════════════════════════════════════
// MODULE PEAU v4 — ITA (Individual Typology Angle)
// Standard médical dermatologique, robuste aux conditions d'éclairage
// ═══════════════════════════════════════════════════════════════

// ── 1. RGB → CIELAB ──────────────────────────────────────────
function rgbToLab(r, g, b) {
  // Normalise 0-255 → 0-1
  let R = r / 255, G = g / 255, B = b / 255;
  // Gamma correction (sRGB)
  R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
  G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
  B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;

  // RGB → XYZ (D65)
  const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  const Y = (R * 0.2126729 + G * 0.7151522 + B * 0.0721750) / 1.00000;
  const Z = (R * 0.0193339 + G * 0.1191920 + B * 0.9503041) / 1.08883;

  // XYZ → Lab
  const f = v => v > 0.008856 ? Math.pow(v, 1/3) : (7.787 * v) + (16/116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return {
    L: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

// ── 2. Calcul ITA ─────────────────────────────────────────────
function computeITA(L, b) {
  return (Math.atan2(L - 50, b)) * (180 / Math.PI);
}

// ── 3. Classification ITA → catégorie peau ───────────────────
// Retourne { tone, ambiguous, ita, suggested }
function classifySkinByITA(ita) {
  // Approche pragmatique : popup pour presque tout le monde
  // L'éclairage de photo rend toute classification automatique
  // trop risquée dans la plage 0°-68°
  let tone, ambiguous = false;

  if (ita > 68) {
    tone = "Claire";
  } else if (ita > 45) {
    tone = "Claire";
  } else if (ita > 22) {
    tone = "Métis";
  } else if (ita > -5) {
    tone = "Foncée";
  } else {
    tone = "Très foncée";
  }

  // Force l'affichage de la confirmation peau à 100% du temps
  ambiguous = true;

  return { tone, ambiguous, ita: Math.round(ita * 10) / 10 };
}

// ── 4. UI de confirmation peau ────────────────────────────────
// Affiche une bottom sheet avec 5 swatches quand ITA est ambigu
function showSkinConfirmUI(suggestedTone, ita, onConfirm) {
  // Supprime popup existant
  const existing = document.getElementById('skin-confirm-overlay');
  if (existing) existing.remove();

  const swatches = [
    { tone: "Claire",         lab: "#F5DEB3", label: "Claire",         emoji: "🏻" },
    { tone: "Claire",         lab: "#D4A574", label: "Claire-bronzée", emoji: "🏼" },
    { tone: "Métis",          lab: "#C68642", label: "Métis",          emoji: "🏽" },
    { tone: "Foncée",         lab: "#8D5524", label: "Foncée",         emoji: "🏾" },
    { tone: "Très foncée",    lab: "#4A2912", label: "Très foncée",    emoji: "🏿" },
  ];

  const overlay = document.createElement('div');
  overlay.id = 'skin-confirm-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeIn 0.2s ease;
  `;

  const sheet = document.createElement('div');
  sheet.style.cssText = `
    background: #16181c; border-radius: 20px 20px 0 0;
    padding: 24px 20px 36px; width: 100%; max-width: 500px;
    border-top: 1px solid #2a2e33;
    animation: slideUp 0.3s cubic-bezier(0.25,1,0.5,1);
  `;

  sheet.innerHTML = `
    <style>
      @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
      @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
      .swatch-btn {
        display: flex; flex-direction: column; align-items: center;
        gap: 8px; cursor: pointer; padding: 8px;
        border-radius: 12px; border: 2px solid transparent;
        transition: all 0.2s; background: none;
        flex: 1;
      }
      .swatch-btn:hover { border-color: #00f0ff; background: rgba(0,240,255,0.05); }
      .swatch-btn.selected { border-color: #00f0ff; background: rgba(0,240,255,0.1); }
      .swatch-circle {
        width: 48px; height: 48px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.15);
      }
      .swatch-label { font-size: 10px; color: #a0aab2; text-align: center; line-height: 1.3; }
    </style>

    <div style="text-align:center; margin-bottom:20px;">
      <p style="color:#a0aab2; font-size:13px; margin-bottom:4px;">
        L'IA suggère : <strong style="color:#00f0ff;">${suggestedTone}</strong>
        <span style="color:#555; font-size:11px;">(ITA: ${ita}°)</span>
      </p>
      <h3 style="color:#fff; font-size:1.1rem; font-family:'Outfit',sans-serif; text-transform:uppercase; letter-spacing:1px;">
        Confirme ta teinte de peau
      </h3>
    </div>

    <div style="display:flex; gap:4px; justify-content:center; margin-bottom:24px;" id="swatches-row">
      ${swatches.map((s, i) => `
        <button class="swatch-btn" data-tone="${s.tone}" data-index="${i}" onclick="selectSwatch(this)">
          <div class="swatch-circle" style="background:${s.lab};"></div>
          <span class="swatch-label">${s.label}</span>
        </button>
      `).join('')}
    </div>

    <button id="skin-confirm-btn" onclick="confirmSkinChoice()" style="
      width:100%; padding:14px; border:none; border-radius:10px;
      background:#00f0ff; color:#000; font-family:'Outfit',sans-serif;
      font-weight:700; font-size:1rem; text-transform:uppercase;
      cursor:pointer; opacity:0.4; pointer-events:none;
      transition: opacity 0.2s;
    ">Confirmer →</button>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  // Stocke le callback
  window._skinConfirmCallback = onConfirm;
  window._selectedSkinTone = null;

  // Pré-sélectionne la suggestion
  setTimeout(() => {
    const suggIdx = swatches.findIndex(s => s.tone === suggestedTone);
    const btns = document.querySelectorAll('.swatch-btn');
    if (btns[suggIdx]) {
      btns[suggIdx].click();
    }
  }, 100);
}

window.selectSwatch = function(btn) {
  document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  window._selectedSkinTone = btn.dataset.tone;
  const confirmBtn = document.getElementById('skin-confirm-btn');
  if (confirmBtn) {
    confirmBtn.style.opacity = '1';
    confirmBtn.style.pointerEvents = 'auto';
  }
};

window.confirmSkinChoice = function() {
  const overlay = document.getElementById('skin-confirm-overlay');
  if (overlay) overlay.remove();
  if (window._skinConfirmCallback && window._selectedSkinTone) {
    window._skinConfirmCallback(window._selectedSkinTone);
  }
};

// ─── 5. CLASSIFICATION FORME DU VISAGE ────────────────────
function classifyFaceShape(ratios) {
  const { widthHeightRatio, jawToFaceRatio } = ratios;
  if (widthHeightRatio > 0.85) return "Carré";
  if (widthHeightRatio > 0.82 && jawToFaceRatio < 0.75) return "Rond";
  if (widthHeightRatio < 0.72) return "Long";
  return "Ovale";
}

// ─── 6. SCORE DE SIMILARITÉ ENTRE PHOTO ET PRESET ─────────
// Algorithme : Matching par Distance Absolue sur ratios_cibles
//
//   Filtre strict peau (inchangé) : écart > 1 cran → score 0
//   Score base peau               : 60 pts (même cran) ou 15 pts (±1 cran)
//   Score morpho                  : distance absolue sur 6 ratios, max 100 pts
//     → si ratios_cibles non remplis : score de stand-by 20 pts
function computePresetScore(ratios, skinTone, preset) {
  const skinMap = { "Claire": 0, "Métis": 1, "Foncée": 2, "Très foncée": 3 };
  const skinDiff = Math.abs((skinMap[skinTone] ?? 0) - (skinMap[preset.couleur_peau] ?? 0));

  // ▶ FILTRE ÉLIMINATOIRE : écart > 1 cran → hors jeu
  if (skinDiff > 1) return 0;

  let score = 0;

  // Score peau
  if (skinDiff === 0) score += 60;
  else score += 15;

  // ▶ MATCHING PAR RATIOS — stand-by sécurisé si données non remplies
  if (!preset.ratios_cibles || preset.ratios_cibles.nez === null) {
    return score + 20;
  }

  const diffNez      = Math.abs(ratios.noseToInterEye          - preset.ratios_cibles.nez);
  const diffMachoire = Math.abs(ratios.jawToFaceRatio           - preset.ratios_cibles.machoire);
  const diffJoues    = Math.abs(ratios.cheekToFaceRatio         - preset.ratios_cibles.joues);
  const diffBouche   = Math.abs(ratios.mouthToFace              - preset.ratios_cibles.bouche);
  const diffYeux     = Math.abs(ratios.eyeOpenness              - preset.ratios_cibles.yeux);
  const diffSourcils = Math.abs((ratios.eyebrowHeightRatio || 0) - preset.ratios_cibles.sourcils);

  const totalDiff = diffNez + diffMachoire + diffJoues + diffBouche + diffYeux + diffSourcils;

  // Conversion diff → points (ratios sont de petits décimaux → ×100 pour pénalité lisible)
  const penalty = totalDiff * 100;
  score += Math.max(0, 100 - penalty);

  return score;
}

// ─── 7. SÉLECTION DU MEILLEUR PRESET ──────────────────────
function selectBestPreset(landmarks, skinTone) {
  const ratios = extractMorphRatios(landmarks);
  let bestPreset = null;
  let bestScore  = -1;
  const scores   = [];

  for (const preset of PRESETS_DB) {
    const score = computePresetScore(ratios, skinTone, preset);
    scores.push({ preset_id: preset.preset_id, position: preset.position, score });
    if (score > bestScore) {
      bestScore  = score;
      bestPreset = preset;
    }
  }

  // Tri pour debug
  scores.sort((a, b) => b.score - a.score);
  console.log("🏆 Top 3 presets :", scores.slice(0, 3));

  return { bestPreset, ratios, scores };
}

// ─── 8. CALCUL DES AJUSTEMENTS FINS — Z-SCORE SOFT CLAMPING (v4) ──
// CORRECTIF v4 : fini le mapping linéaire brut.
// On utilise une courbe en S (sigmoïde / tanh) pour que :
//   - Les valeurs proches du centre (50) bougent normalement
//   - Les valeurs extrêmes (outliers) sont doucement freinées vers 10-20 / 80-90
//   - AUCUNE valeur ne "crashe" à 0 ou 100 de manière non naturelle
//
// Méthode : Winsorisation douce via tanh.
//   1. On normalise le ratio en [0,1] (linéaire classique)
//   2. On centre sur 0 (x - 0.5)
//   3. On applique tanh(k * x) avec k=5 (steepness) → aplatit les extrêmes
//   4. On re-dénormalise en [0,100]
//   5. Clamp final Math.max(0, Math.min(100, val))
//
// Plages terrain (inchangées) :
//   Nez    : 0.28 → 0.55  range=0.27
//   Mâch.  : 0.60 → 0.85  range=0.25
//   Joues  : 0.70 → 0.95  range=0.25
//   Bouche : 0.22 → 0.39  range=0.17

/**
 * Soft Clamping via tanh (Winsorisation non-linéaire).
 * Transforme un ratio brut en valeur slider [0,100] avec compression douce des extrêmes.
 *
 * @param {number} ratio     - Le ratio mesuré (ex: noseToInterEye = 0.461)
 * @param {number} minVal    - Borne basse de la plage calibrée (ex: 0.28)
 * @param {number} range     - Étendue de la plage (ex: 0.27)
 * @param {number} steepness - Pente de la sigmoïde (défaut: 5). Plus haut = plus linéaire au centre.
 * @returns {number} Valeur slider [0,100] avec soft clamping
 */
function softClampSlider(ratio, minVal, range, steepness = 5) {
  // 1. Normalisation linéaire brute en [0, 1]
  const linearNorm = (ratio - minVal) / range;

  // 2. Centrer sur 0 : [-0.5, +0.5] pour un ratio dans la plage, peut dépasser
  const centered = linearNorm - 0.5;

  // 3. Sigmoïde douce via tanh : compresse les valeurs > |0.5|
  //    tanh(5 * 0) = 0  (centre inchangé)
  //    tanh(5 * 0.5) ≈ 0.986  (bord de plage → ~99%, quasi-linéaire)
  //    tanh(5 * 0.8) ≈ 0.9999 (outlier fort → freiné à ~100%)
  //    tanh(5 * -0.7) ≈ -0.9998 (outlier bas → freiné à ~0%)
  const compressed = Math.tanh(steepness * centered);

  // 4. Re-dénormaliser : tanh ∈ [-1, 1] → [0, 100]
  const sliderVal = (compressed + 1) / 2 * 100;

  // 5. Clamp final de sécurité
  return Math.max(0, Math.min(100, Math.round(sliderVal)));
}

function computeAdjustments(ratios, selectedPreset, zoneMix = null) {
  const f = selectedPreset.faconner;
  const adjustments = {};

  // NEZ — Réduire/Élargir (soft clamped)
  const userNoseVal = softClampSlider(ratios.noseToInterEye, 0.28, 0.27);
  const nozDelta = userNoseVal - f.nez.reduire_elargir;
  if (Math.abs(nozDelta) > 5) {
    adjustments.nez = adjustments.nez || {};
    adjustments.nez.reduire_elargir = Math.max(0, Math.min(100,
      Math.round(f.nez.reduire_elargir + nozDelta * 0.95)
    ));
  }

  // MÂCHOIRE — Réduire/Élargir (soft clamped)
  const userJawVal = softClampSlider(ratios.jawToFaceRatio, 0.60, 0.25);
  const jawDelta = userJawVal - f.machoire.reduire_elargir;
  if (Math.abs(jawDelta) > 5) {
    adjustments.machoire = adjustments.machoire || {};
    adjustments.machoire.reduire_elargir = Math.max(0, Math.min(100,
      Math.round(f.machoire.reduire_elargir + jawDelta * 0.95)
    ));
  }

  // JOUES — Réduire/Élargir (soft clamped)
  const userCheekVal = softClampSlider(ratios.cheekToFaceRatio, 0.70, 0.25);
  const cheekDelta = userCheekVal - f.joues.reduire_elargir;
  if (Math.abs(cheekDelta) > 5) {
    adjustments.joues = adjustments.joues || {};
    adjustments.joues.reduire_elargir = Math.max(0, Math.min(100,
      Math.round(f.joues.reduire_elargir + cheekDelta * 0.95)
    ));
  }

  // BOUCHE — Réduire/Élargir (soft clamped)
  const userMouthVal = softClampSlider(ratios.mouthToFace, 0.22, 0.17);
  const mouthDelta = userMouthVal - f.bouche.reduire_elargir;
  if (Math.abs(mouthDelta) > 5) {
    adjustments.bouche = adjustments.bouche || {};
    adjustments.bouche.reduire_elargir = Math.max(0, Math.min(100,
      Math.round(f.bouche.reduire_elargir + mouthDelta * 0.95)
    ));
  }

  // ── PHASE 1 — AJUSTEMENTS SUPPLÉMENTAIRES ───────────────────

  // NEZ — bas_haut (position verticale)
  // Un nez "haut" sur le visage → slider bas (valeur faible)
  // plage calibrée : [0.33, 0.20] — plus le ratio est petit, plus le nez est haut
  const userNoseHeightVal = softClampSlider(ratios.noseHeightRatio, 0.33, 0.20);
  const noseHeightDelta = userNoseHeightVal - f.nez.bas_haut;
  if (Math.abs(noseHeightDelta) > 5) {
    adjustments.nez = adjustments.nez || {};
    adjustments.nez.bas_haut = Math.max(0, Math.min(100,
      Math.round(f.nez.bas_haut + Math.max(-15, Math.min(15, noseHeightDelta)) * 0.85)
    ));
  }

  // NEZ — arriere_avant (profondeur, via coordonnée Z MediaPipe)
  // Z négatif = nez proéminent (en avant). plage: [-0.09, 0.07]
  const userNoseZVal = softClampSlider(ratios.noseTipZ, -0.09, 0.07);
  const noseZDelta = userNoseZVal - f.nez.arriere_avant;
  if (Math.abs(noseZDelta) > 5) {
    adjustments.nez = adjustments.nez || {};
    adjustments.nez.arriere_avant = Math.max(0, Math.min(100,
      Math.round(f.nez.arriere_avant + Math.max(-15, Math.min(15, noseZDelta)) * 0.80)
    ));
  }

  // BOUCHE — bas_haut (position entre nez et menton)
  // plage : [0.35, 0.30] (ratio dist_nez_bouche / dist_nez_menton)
  const userMouthPosVal = softClampSlider(ratios.mouthPosRatio, 0.35, 0.30);
  const mouthPosDelta = userMouthPosVal - f.bouche.bas_haut;
  if (Math.abs(mouthPosDelta) > 5) {
    adjustments.bouche = adjustments.bouche || {};
    adjustments.bouche.bas_haut = Math.max(0, Math.min(100,
      Math.round(f.bouche.bas_haut + Math.max(-15, Math.min(15, mouthPosDelta)) * 0.85)
    ));
  }

  // BOUCHE — arrondi_angulaire (épaisseur lèvres)
  // plage : [0.010, 0.030]
  const userLipThickVal = softClampSlider(ratios.lipThicknessRatio, 0.010, 0.030);
  const lipThickDelta = userLipThickVal - f.bouche.arrondi_angulaire;
  if (Math.abs(lipThickDelta) > 5) {
    adjustments.bouche = adjustments.bouche || {};
    adjustments.bouche.arrondi_angulaire = Math.max(0, Math.min(100,
      Math.round(f.bouche.arrondi_angulaire + Math.max(-15, Math.min(15, lipThickDelta)) * 0.80)
    ));
  }

  // MÂCHOIRE — bas_haut (hauteur de l'angle gonial)
  // plage : [0.60, 0.25]
  const userJawHeightVal = softClampSlider(ratios.jawHeightRatio, 0.60, 0.25);
  const jawHeightDelta = userJawHeightVal - f.machoire.bas_haut;
  if (Math.abs(jawHeightDelta) > 5) {
    adjustments.machoire = adjustments.machoire || {};
    adjustments.machoire.bas_haut = Math.max(0, Math.min(100,
      Math.round(f.machoire.bas_haut + Math.max(-15, Math.min(15, jawHeightDelta)) * 0.85)
    ));
  }

  // MENTON — reduire_elargir (largeur du menton)
  // plage : [0.15, 0.20]
  const userChinWidthVal = softClampSlider(ratios.chinWidthRatio, 0.15, 0.20);
  const chinWidthDelta = userChinWidthVal - f.menton.reduire_elargir;
  if (Math.abs(chinWidthDelta) > 5) {
    adjustments.menton = adjustments.menton || {};
    adjustments.menton.reduire_elargir = Math.max(0, Math.min(100,
      Math.round(f.menton.reduire_elargir + Math.max(-15, Math.min(15, chinWidthDelta)) * 0.85)
    ));
  }

  // MENTON — bas_haut (hauteur du menton)
  // chinToFace déjà calculé dans extractMorphRatios. plage : [0.04, 0.10]
  const userChinHeightVal = softClampSlider(ratios.chinToFace, 0.04, 0.10);
  const chinHeightDelta = userChinHeightVal - f.menton.bas_haut;
  if (Math.abs(chinHeightDelta) > 5) {
    adjustments.menton = adjustments.menton || {};
    adjustments.menton.bas_haut = Math.max(0, Math.min(100,
      Math.round(f.menton.bas_haut + Math.max(-15, Math.min(15, chinHeightDelta)) * 0.85)
    ));
  }

  // ORBITES — plus_grande_petite (taille des yeux)
  // eyeOpenness déjà calculé. plage : [0.15, 0.20]
  const userEyeSizeVal = softClampSlider(ratios.eyeOpenness, 0.15, 0.20);
  const eyeSizeDelta = userEyeSizeVal - f.orbites.plus_grande_petite;
  if (Math.abs(eyeSizeDelta) > 5) {
    adjustments.orbites = adjustments.orbites || {};
    adjustments.orbites.plus_grande_petite = Math.max(0, Math.min(100,
      Math.round(f.orbites.plus_grande_petite + Math.max(-15, Math.min(15, eyeSizeDelta)) * 0.80)
    ));
  }

  // ORBITES — bas_haut (position verticale des yeux)
  // plage : [0.25, 0.20]
  const userEyeVertVal = softClampSlider(ratios.eyeVerticalRatio, 0.25, 0.20);
  const eyeVertDelta = userEyeVertVal - f.orbites.bas_haut;
  if (Math.abs(eyeVertDelta) > 5) {
    adjustments.orbites = adjustments.orbites || {};
    adjustments.orbites.bas_haut = Math.max(0, Math.min(100,
      Math.round(f.orbites.bas_haut + Math.max(-15, Math.min(15, eyeVertDelta)) * 0.80)
    ));
  }

  // JOUES — bas_haut (hauteur des pommettes)
  // plage : [0.40, 0.20]
  const userCheekHeightVal = softClampSlider(ratios.cheekHeightRatio, 0.40, 0.20);
  const cheekHeightDelta = userCheekHeightVal - f.joues.bas_haut;
  if (Math.abs(cheekHeightDelta) > 5) {
    adjustments.joues = adjustments.joues || {};
    adjustments.joues.bas_haut = Math.max(0, Math.min(100,
      Math.round(f.joues.bas_haut + Math.max(-15, Math.min(15, cheekHeightDelta)) * 0.85)
    ));
  }

  // FRONT — reduire_elargir (largeur tempes)
  // plage : [0.75, 0.30]
  const userForeheadVal = softClampSlider(ratios.foreheadWidthRatio, 0.75, 0.30);
  const foreheadDelta = userForeheadVal - f.front_superieur.reduire_elargir;
  if (Math.abs(foreheadDelta) > 5) {
    adjustments.front_superieur = adjustments.front_superieur || {};
    adjustments.front_superieur.reduire_elargir = Math.max(0, Math.min(100,
      Math.round(f.front_superieur.reduire_elargir + Math.max(-15, Math.min(15, foreheadDelta)) * 0.80)
    ));
  }

  // ── PART 2: FAÇONNAGE AVANCÉ ──────────────────────────────────
  const clampAdv = (zone, slider, ratio, maxV, minV, zoneMixPresetId) => {
    if (!ratio || ratio === 0 || isNaN(ratio)) return;
    const basePreset = zoneMixPresetId
      ? PRESETS_DB.find(p => p.preset_id === zoneMixPresetId)
      : selectedPreset;
    if (basePreset?.avance?.[zone]?.[slider] === undefined) return;

    const userVal = softClampSlider(ratio, maxV, minV);
    const baseVal = basePreset.avance[zone][slider];
    const delta = userVal - baseVal;

    if (Math.abs(delta) > 5) {
      adjustments.avance = adjustments.avance || {};
      adjustments.avance[zone] = adjustments.avance[zone] || {};
      adjustments.avance[zone][slider] = Math.max(0, Math.min(100, Math.round(baseVal + delta * 0.85)));
    }
  };

  // NEZ — largeur arête (base et centrale)
  clampAdv('arete_cotes',    're', ratios.nez_arete_base,      0.22, 0.18, zoneMix?.nez);
  clampAdv('arete_centrale', 're', ratios.nez_arete_base,      0.22, 0.18, zoneMix?.nez);

  // BOUCHE — rapport vermillon inf/sup
  clampAdv('bouche_ext', 'bh', ratios.levres_ratio, 1.6, 1.1, zoneMix?.bouche);
  clampAdv('bouche_adv', 'bh', ratios.levres_ratio, 1.6, 1.1, zoneMix?.bouche);

  // MENTON — rapport hauteur menton/philtrum
  clampAdv('menton_adv', 'bh', ratios.menton_ratio, 2.3, 1.7, zoneMix?.menton);
  clampAdv('menton_sup', 'bh', ratios.menton_ratio, 2.3, 1.7, zoneMix?.menton);

  // MÂCHOIRE — largeur bigoniale
  clampAdv('mandibule',  're', ratios.machoire_bigoniale, 0.80, 0.70, zoneMix?.machoire);
  clampAdv('maxillaire', 're', ratios.machoire_bigoniale, 0.80, 0.70, zoneMix?.machoire);

  return adjustments;
}

// ─── 9. FONCTION PRINCIPALE ───────────────────────────────
// À appeler après onResults de MediaPipe FaceMesh
function analyzeFace(landmarks, skinTone = "Foncée") {
  // 0. Extraire les ratios morpho
  const ratios = extractMorphRatios(landmarks);
  const faceShape = classifyFaceShape(ratios);

  // 1. Skin tone is now determined by ITA + user confirmation (no morphological override)
  const finalSkinTone = skinTone;

  console.log(`🎨 Peau (ITA) : ${finalSkinTone}`);

  // 2. Sélection du meilleur preset
  const { bestPreset, scores } = selectBestPreset(landmarks, finalSkinTone);

  console.log(`✅ Preset sélectionné : ${bestPreset.preset_id} (position ${bestPreset.position})`);
  console.log(`📐 Morphologie : ${faceShape}, Peau finale : ${finalSkinTone}`);
  console.log(`🏆 Top 3 presets :`, scores.slice(0, 3));

  // 3. Calcul des ajustements fins
  const zoneMix = computeZoneMix(ratios, bestPreset, PRESETS_DB);
  const adjustments = computeAdjustments(ratios, bestPreset, zoneMix);

  // 4. Construction du résultat final
  const result = {
    preset: {
      id: bestPreset.preset_id,
      position: bestPreset.position,
      label: `Tête n°${bestPreset.position} dans la grille FC26`,
      couleur_peau: bestPreset.couleur_peau,
      forme_visage: bestPreset.forme_visage,
      avance: bestPreset.avance || null
    },
    skinTone: finalSkinTone,
    faceShape,
    score: scores[0]?.score ?? 0,
    ratios,
    detection: {
      skinTone: finalSkinTone,
      faceShape,
      presetSkinTone: bestPreset.couleur_peau,
      presetFaceShape: bestPreset.forme_visage,
      topScore: scores[0]?.score ?? 0,
      top3: scores.slice(0, 3),
      ratios: {
        noseToInterEye: ratios.noseToInterEye,
        jawToFaceRatio: ratios.jawToFaceRatio,
        cheekToFaceRatio: ratios.cheekToFaceRatio,
        mouthToFace: ratios.mouthToFace
      }
    },
    base_sliders: bestPreset.faconner,
    adjustments,
    final_sliders: {}
  };

  // Merge base + adjustments pour chaque zone
  for (const zone of Object.keys(bestPreset.faconner)) {
    result.final_sliders[zone] = { ...bestPreset.faconner[zone] };
    if (adjustments[zone]) {
      Object.assign(result.final_sliders[zone], adjustments[zone]);
    }
  }

  console.log("🎮 Résultat final :", result);
  return result;
}

// ─── ZONE MIX — Recommandations par zone pour l'onglet Tête ────
// Retourne pour chaque zone du Head tab le preset_id le plus adapté.
// Le filtre peau identique à computePresetScore s'applique sur les candidats.
function computeZoneMix(detectedMorpho, mainPreset, allPresets) {
  const skinMap = { "Claire": 0, "Métis": 1, "Foncée": 2, "Très foncée": 3 };
  const mainSkinLevel = skinMap[mainPreset.couleur_peau] ?? 0;

  // Candidats : filtre peau ±2 crans (±1 était trop restrictif pour Très foncée : seulement 8/31 candidats)
  const candidates = allPresets.filter(p =>
    Math.abs((skinMap[p.couleur_peau] ?? 0) - mainSkinLevel) <= 2
  );

  console.log(`🔬 [ZoneMix] mainPreset #${mainPreset.preset_id} peau="${mainPreset.couleur_peau}" (lvl ${mainSkinLevel}) → ${candidates.length}/${allPresets.length} candidats (filtre peau ±2)`);

  // Sélectionne le meilleur candidat pour une zone donnée.
  // Initialise avec le score du mainPreset → un autre ne gagne que s'il est STRICTEMENT meilleur
  // (stabilité : pas de diff inutile quand les scores sont égaux).
  // dbgName : si fourni, affiche les scores de chaque candidat dans la console.
  function bestForZone(labelKey, scoreFn, dbgName) {
    let best = mainPreset;
    let bestScore = scoreFn(mainPreset[labelKey] ?? null);
    if (dbgName) console.group(`🔬 [ZoneMix ${dbgName}] mainPreset #${mainPreset.preset_id} ${labelKey}="${mainPreset[labelKey]}" score=${bestScore}`);
    for (const p of candidates) {
      if (p.preset_id === mainPreset.preset_id) continue;
      const s = scoreFn(p[labelKey] ?? null);
      if (dbgName) console.log(`  #${p.preset_id} [${p.couleur_peau}] ${labelKey}="${p[labelKey]}" → ${s}${s > bestScore ? ' ★ MEILLEUR' : ''}`);
      if (s > bestScore) { bestScore = s; best = p; }
    }
    if (dbgName) { console.log(`  ✅ WINNER: Preset #${best.preset_id} [${best.couleur_peau}]`); console.groupEnd(); }
    return best.preset_id;
  }

  // FRONT — front_label vs foreheadWidthRatio
  // Échelle 3 niveaux : Étroit(0) · Moyen(1) · Large(2) → score = 2 - |distance|
  const fwRatio = detectedMorpho.foreheadWidthRatio ?? 0;
  const userFrontLevel = fwRatio > 0.88 ? 2 : fwRatio > 0.78 ? 1 : 0;
  const frontOrder = { "Étroit": 0, "Moyen": 1, "Large": 2 };
  const frontPreset = bestForZone('front_label', label =>
    label != null ? 2 - Math.abs((frontOrder[label] ?? 1) - userFrontLevel) : 0
  );

  // MÂCHOIRE — machoire_label vs jawToFaceRatio
  const jawRatio = detectedMorpho.jawToFaceRatio ?? 0;
  const jawOrder = { "Fine": 0, "Moyenne": 1, "Large": 2 };
  const userJawLevel = detectedMorpho.machoire_label ? jawOrder[detectedMorpho.machoire_label] : (jawRatio > 0.76 ? 2 : jawRatio > 0.65 ? 1 : 0);
  const machoirePreset = bestForZone('machoire_label', label =>
    label != null ? 2 - Math.abs((jawOrder[label] ?? 1) - userJawLevel) : 0
  );

  // JOUES — pommettes_label vs cheekToFaceRatio
  // Échelle 3 niveaux : Basses(0) · Moyennes(1) · Hautes(2)
  const cheekRatio = detectedMorpho.cheekToFaceRatio ?? 0;
  const userCheekLevel = cheekRatio > 0.88 ? 2 : cheekRatio > 0.78 ? 1 : 0;
  const cheekOrder = { "Basses": 0, "Moyennes": 1, "Hautes": 2 };
  const jouPreset = bestForZone('pommettes_label', label =>
    label != null ? 2 - Math.abs((cheekOrder[label] ?? 1) - userCheekLevel) : 0
  );

  // NEZ — nez_label vs noseToInterEye
  const nezRatio = detectedMorpho.noseToInterEye ?? 0;
  const nezOrder = { "Fin": 0, "Moyen": 1, "Large": 2 };
  const userNezLevel = detectedMorpho.nez_label ? nezOrder[detectedMorpho.nez_label] : (nezRatio > 0.48 ? 2 : 1);
  const nezPreset = bestForZone('nez_label', label =>
    label != null ? 2 - Math.abs((nezOrder[label] ?? 1) - userNezLevel) : 0,
    `NEZ userLevel=${userNezLevel}`
  );

  // BOUCHE — levres_label vs mouthToFace
  const boucheRatio = detectedMorpho.mouthToFace ?? 0;
  const boucheOrder = { "Fines": 0, "Moyennes": 1, "Pleines": 2 };
  const userBoucheLevel = detectedMorpho.levres_label ? boucheOrder[detectedMorpho.levres_label] : (boucheRatio < 0.38 ? 2 : 0);
  const bouchePreset = bestForZone('levres_label', label =>
    label != null ? 2 - Math.abs((boucheOrder[label] ?? 1) - userBoucheLevel) : 0,
    `BOUCHE userLevel=${userBoucheLevel}`
  );

  // MENTON, OREILLES, COU, YEUX, SOURCILS → mainPreset
  return {
    front:    frontPreset,
    machoire: machoirePreset,
    joues:    jouPreset,
    nez:      nezPreset,
    bouche:   bouchePreset,
    menton:   mainPreset.preset_id,
    oreilles: mainPreset.preset_id,
    cou:      mainPreset.preset_id,
    yeux:     mainPreset.preset_id,
    sourcils: mainPreset.preset_id,
  };
}

// ─── ZONE-BASED SLIDERS — Base DNA correcte par zone ──────────
// Recalcule les sliders façonnage en utilisant le preset retenu par
// computeZoneMix comme base pour chaque zone, puis applique les
// mêmes ajustements ±15 pts IA que computeAdjustments.
// Retourne { final_sliders, base_sliders, adjustments, zonePresets }
// zonePresets : { nomZoneFaconner → presetObj complet }
function buildZoneBasedSliders(ratios, zoneMix, allPresets, mainPreset) {
  const lookup = id => allPresets.find(p => p.preset_id === id) ?? mainPreset;

  // Correspondance clé faconner → clé zoneMix (null = toujours mainPreset)
  const zoneToMix = {
    crane:           null,
    front_superieur: 'front',
    sourcils:        'sourcils',
    orbites:         'yeux',
    oreilles:        'oreilles',
    nez:             'nez',
    joues:           'joues',
    bouche:          'bouche',
    menton:          'menton',
    machoire:        'machoire',
  };

  // Résolution : pour chaque zone faconner, quel preset utiliser ?
  const zonePresets = {};
  for (const [fZone, mixKey] of Object.entries(zoneToMix)) {
    const id = mixKey ? (zoneMix[mixKey] ?? mainPreset.preset_id) : mainPreset.preset_id;
    zonePresets[fZone] = lookup(id);
  }

  // Base sliders (valeurs brutes du bon preset par zone)
  const base_sliders = {};
  const final_sliders = {};
  for (const [fZone, p] of Object.entries(zonePresets)) {
    if (p?.faconner?.[fZone]) {
      base_sliders[fZone]  = { ...p.faconner[fZone] };
      final_sliders[fZone] = { ...p.faconner[fZone] };
    }
  }

  // Ajustements IA — même logique que computeAdjustments, base = bon preset par zone
  const adjustments = {};
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));
  const adj15 = delta => Math.max(-15, Math.min(15, delta));

  // NEZ
  const fnez = zonePresets.nez?.faconner?.nez;
  if (fnez) {
    const d = softClampSlider(ratios.noseToInterEye, 0.28, 0.27) - fnez.reduire_elargir;
    if (Math.abs(d) > 5) { adjustments.nez = adjustments.nez || {}; adjustments.nez.reduire_elargir = clamp(fnez.reduire_elargir + d * 0.95, 0, 100); }
    const dh = softClampSlider(ratios.noseHeightRatio, 0.33, 0.20) - fnez.bas_haut;
    if (Math.abs(dh) > 5) { adjustments.nez = adjustments.nez || {}; adjustments.nez.bas_haut = clamp(fnez.bas_haut + adj15(dh) * 0.85, 0, 100); }
    const dz = softClampSlider(ratios.noseTipZ, -0.09, 0.07) - fnez.arriere_avant;
    if (Math.abs(dz) > 5) { adjustments.nez = adjustments.nez || {}; adjustments.nez.arriere_avant = clamp(fnez.arriere_avant + adj15(dz) * 0.80, 0, 100); }
  }

  // MÂCHOIRE
  const fmach = zonePresets.machoire?.faconner?.machoire;
  if (fmach) {
    const d = softClampSlider(ratios.jawToFaceRatio, 0.60, 0.25) - fmach.reduire_elargir;
    if (Math.abs(d) > 5) { adjustments.machoire = adjustments.machoire || {}; adjustments.machoire.reduire_elargir = clamp(fmach.reduire_elargir + d * 0.95, 0, 100); }
    const dh = softClampSlider(ratios.jawHeightRatio, 0.60, 0.25) - fmach.bas_haut;
    if (Math.abs(dh) > 5) { adjustments.machoire = adjustments.machoire || {}; adjustments.machoire.bas_haut = clamp(fmach.bas_haut + adj15(dh) * 0.85, 0, 100); }
  }

  // JOUES
  const fjoues = zonePresets.joues?.faconner?.joues;
  if (fjoues) {
    const d = softClampSlider(ratios.cheekToFaceRatio, 0.70, 0.25) - fjoues.reduire_elargir;
    if (Math.abs(d) > 5) { adjustments.joues = adjustments.joues || {}; adjustments.joues.reduire_elargir = clamp(fjoues.reduire_elargir + d * 0.95, 0, 100); }
    const dh = softClampSlider(ratios.cheekHeightRatio, 0.40, 0.20) - fjoues.bas_haut;
    if (Math.abs(dh) > 5) { adjustments.joues = adjustments.joues || {}; adjustments.joues.bas_haut = clamp(fjoues.bas_haut + adj15(dh) * 0.85, 0, 100); }
  }

  // BOUCHE
  const fbouche = zonePresets.bouche?.faconner?.bouche;
  if (fbouche) {
    const d = softClampSlider(ratios.mouthToFace, 0.22, 0.17) - fbouche.reduire_elargir;
    if (Math.abs(d) > 5) { adjustments.bouche = adjustments.bouche || {}; adjustments.bouche.reduire_elargir = clamp(fbouche.reduire_elargir + d * 0.95, 0, 100); }
    const dp = softClampSlider(ratios.mouthPosRatio, 0.35, 0.30) - fbouche.bas_haut;
    if (Math.abs(dp) > 5) { adjustments.bouche = adjustments.bouche || {}; adjustments.bouche.bas_haut = clamp(fbouche.bas_haut + adj15(dp) * 0.85, 0, 100); }
    const dt = softClampSlider(ratios.lipThicknessRatio, 0.010, 0.030) - fbouche.arrondi_angulaire;
    if (Math.abs(dt) > 5) { adjustments.bouche = adjustments.bouche || {}; adjustments.bouche.arrondi_angulaire = clamp(fbouche.arrondi_angulaire + adj15(dt) * 0.80, 0, 100); }
  }

  // MENTON
  const fmenton = zonePresets.menton?.faconner?.menton;
  if (fmenton) {
    const d = softClampSlider(ratios.chinWidthRatio, 0.15, 0.20) - fmenton.reduire_elargir;
    if (Math.abs(d) > 5) { adjustments.menton = adjustments.menton || {}; adjustments.menton.reduire_elargir = clamp(fmenton.reduire_elargir + adj15(d) * 0.85, 0, 100); }
    const dh = softClampSlider(ratios.chinToFace, 0.04, 0.10) - fmenton.bas_haut;
    if (Math.abs(dh) > 5) { adjustments.menton = adjustments.menton || {}; adjustments.menton.bas_haut = clamp(fmenton.bas_haut + adj15(dh) * 0.85, 0, 100); }
  }

  // ORBITES (yeux)
  const forb = zonePresets.orbites?.faconner?.orbites;
  if (forb) {
    const d = softClampSlider(ratios.eyeOpenness, 0.15, 0.20) - forb.plus_grande_petite;
    if (Math.abs(d) > 5) { adjustments.orbites = adjustments.orbites || {}; adjustments.orbites.plus_grande_petite = clamp(forb.plus_grande_petite + adj15(d) * 0.80, 0, 100); }
    const dv = softClampSlider(ratios.eyeVerticalRatio, 0.25, 0.20) - forb.bas_haut;
    if (Math.abs(dv) > 5) { adjustments.orbites = adjustments.orbites || {}; adjustments.orbites.bas_haut = clamp(forb.bas_haut + adj15(dv) * 0.80, 0, 100); }
  }

  // FRONT SUPÉRIEUR
  const ffront = zonePresets.front_superieur?.faconner?.front_superieur;
  if (ffront) {
    const d = softClampSlider(ratios.foreheadWidthRatio, 0.75, 0.30) - ffront.reduire_elargir;
    if (Math.abs(d) > 5) { adjustments.front_superieur = adjustments.front_superieur || {}; adjustments.front_superieur.reduire_elargir = clamp(ffront.reduire_elargir + adj15(d) * 0.80, 0, 100); }
  }

  // Merge adjustments → final_sliders
  for (const zone of Object.keys(final_sliders)) {
    if (adjustments[zone]) Object.assign(final_sliders[zone], adjustments[zone]);
  }

  return { final_sliders, base_sliders, adjustments, zonePresets };
}


// --- QA Gate : contrôle qualité de la capture ---
function checkCaptureQuality(landmarks, canvas) {
    // 1. Visage trop petit dans le cadre (< 15% de la largeur canvas)
    const faceW = Math.abs(landmarks[454].x - landmarks[234].x) * canvas.width;
    if (faceW < canvas.width * 0.15) {
        return { ok: false, reason: "📏 Rapproche-toi — ton visage est trop petit dans le cadre." };
    }

    // 2. Rotation horizontale trop forte (yaw) — nez trop décentré
    const noseTip = landmarks[1].x;
    const faceCenter = (landmarks[234].x + landmarks[454].x) / 2;
    const yawOffset = Math.abs(noseTip - faceCenter) / (landmarks[454].x - landmarks[234].x);
    if (yawOffset > 0.18) {
        return { ok: false, reason: "↔️ Tourne ton visage face à la caméra." };
    }

    // 3. Rotation verticale trop forte (pitch) — menton trop haut ou bas
    const faceH = Math.abs(landmarks[152].y - landmarks[10].y) * canvas.height;
    const chinY = landmarks[152].y;
    const foreheadY = landmarks[10].y;
    const pitchRatio = (chinY - foreheadY) / Math.abs(landmarks[152].y - landmarks[10].y);
    if (pitchRatio < 0.5 || pitchRatio > 1.5) {
        return { ok: false, reason: "↕️ Redresse la tête — évite de regarder trop haut ou trop bas." };
    }

    // 4. Surexposition (canvas trop lumineux dans la zone peau)
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const cx = Math.floor(landmarks[1].x * canvas.width);
    const cy = Math.floor(landmarks[1].y * canvas.height);
    try {
        const sample = ctx.getImageData(Math.max(0, cx - 15), Math.max(0, cy - 15), 30, 30).data;
        let overexposed = 0;
        for (let i = 0; i < sample.length; i += 4) {
            if (sample[i] > 245 && sample[i+1] > 245 && sample[i+2] > 245) overexposed++;
        }
        if (overexposed / (sample.length / 4) > 0.4) {
            return { ok: false, reason: "☀️ Photo trop lumineuse — évite la lumière directe derrière toi." };
        }
    } catch(e) {}

    return { ok: true, reason: '' };
}

function showQAWarning(message) {
    // Retire un éventuel avertissement précédent
    const existing = document.getElementById('qa-warning');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'qa-warning';
    banner.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(255, 60, 60, 0.95); color: white;
        padding: 14px 22px; border-radius: 10px; font-size: 0.95rem;
        font-weight: bold; z-index: 999; text-align: center;
        box-shadow: 0 4px 20px rgba(255,0,0,0.4); max-width: 320px;
        animation: fadeInUp 0.3s ease;
    `;
    banner.textContent = message;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 4000);
}

// ── 5. Détection peau principale ─────────────────────────────
function detectSkinToneFromCanvas(imgElement, landmarks, onResult) {
  // Points de peau fiables (joues, front, nez, tempes)
  const SKIN_POINTS = [
    50, 280,   // joues hautes
    116, 345,  // joues basses
    54, 284,   // tempes
    103, 332,  // front latéral
    10,        // front central
    1, 4,      // nez
  ];

  // Canvas temporaire aux dimensions réelles de la source (évite le décalage dû au scaling d'affichage)
  const srcW = imgElement.naturalWidth || imgElement.videoWidth || imgElement.width;
  const srcH = imgElement.naturalHeight || imgElement.videoHeight || imgElement.height;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = srcW;
  tempCanvas.height = srcH;
  const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(imgElement, 0, 0);

  const samples = [];

  for (const idx of SKIN_POINTS) {
    if (!landmarks[idx]) continue;
    const px = Math.floor(landmarks[idx].x * srcW);
    const py = Math.floor(landmarks[idx].y * srcH);
    try {
      const d = ctx.getImageData(Math.max(0, px-4), Math.max(0, py-4), 8, 8).data;
      let r=0, g=0, b=0, count=0;
      for (let i=0; i<d.length; i+=4) {
        const lum = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
        // Filtre pixels trop sombres (ombres) ou trop clairs (reflets)
        if (lum < 20 || lum > 245) continue;
        r += d[i]; g += d[i+1]; b += d[i+2]; count++;
      }
      if (count > 4) samples.push({ r: r/count, g: g/count, b: b/count });
    } catch(e) {}
  }

  if (samples.length === 0) {
    onResult("Métis", { auto: true, ita: 25, ambiguous: false });
    return;
  }

  // 25e percentile — plus robuste que la médiane pour peau sombre
  // Prend les pixels plus sombres, évite les highlights
  const pIdx = Math.floor(samples.length * 0.25);
  const medR = samples.map(s=>s.r).sort((a,b)=>a-b)[pIdx];
  const medG = samples.map(s=>s.g).sort((a,b)=>a-b)[pIdx];
  const medB = samples.map(s=>s.b).sort((a,b)=>a-b)[pIdx];

  const lab = rgbToLab(medR, medG, medB);
  const ita = computeITA(lab.L, lab.b);
  const { tone, ambiguous } = classifySkinByITA(ita);

  // Stocke pour le debug
  detectSkinToneFromCanvas._lastLab = lab;
  detectSkinToneFromCanvas._lastITA = ita;
  detectSkinToneFromCanvas._lastRGB = { r: Math.round(medR), g: Math.round(medG), b: Math.round(medB) };

  if (ambiguous) {
    // Affiche l'UI de confirmation
    showSkinConfirmUI(tone, Math.round(ita * 10) / 10, (confirmedTone) => {
      onResult(confirmedTone, { auto: false, ita, ambiguous: true, confirmed: confirmedTone });
    });
  } else {
    // Résultat automatique direct
    onResult(tone, { auto: true, ita, ambiguous: false });
  }
}

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

console.log('App Initialized');

// --- App State ---
const state = {
    isPremium: false,
    results: null
};

// --- Cropper helper — instancie ou réinstancie Cropper sur un <img> ---
function initCropper(img) {
    if (cropper) { cropper.destroy(); cropper = null; }
    cropper = new Cropper(img, {
        viewMode: 0,
        dragMode: 'move',
        aspectRatio: 9 / 16,
        autoCropArea: 1,
        cropBoxMovable: false,
        cropBoxResizable: false,
        background: false,
        ready: function () {
            const containerData = this.cropper.getContainerData();
            const imageData = this.cropper.getImageData();
            // Calcule le ratio pour que l'image couvre tout le conteneur (object-fit: cover)
            const scaleRatio = Math.max(
                containerData.width  / imageData.naturalWidth,
                containerData.height / imageData.naturalHeight
            );
            this.cropper.zoomTo(scaleRatio);
            // Centre l'image dans le conteneur
            this.cropper.moveTo(
                (containerData.width  - imageData.naturalWidth  * scaleRatio) / 2,
                (containerData.height - imageData.naturalHeight * scaleRatio) / 2
            );
        }
    });
}

// --- DOM Elements ---
const screens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('[data-target]');
const fileUpload = document.getElementById('file-upload');
const btnCamera = document.getElementById('btn-camera');
const btnCapture = document.getElementById('btn-capture');
const btnAnalyzeUpload = document.getElementById('btn-analyze-upload');
const inputVideo = document.getElementById('input-video');
const inputImage = document.getElementById('input-image');
const outputCanvas = document.getElementById('output-canvas');
const canvasCtx = outputCanvas.getContext('2d');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsAccordion = document.getElementById('results-accordion');
const btnShare = document.getElementById('btn-share');
const btnPurchase = document.getElementById('btn-purchase');
const reviewButtons = document.querySelector('.review-buttons');
const btnRetake = document.getElementById('btn-retake');
const btnConfirmAnalyze = document.getElementById('btn-confirm-analyze');

let capturedBase64 = null;
let capturedCanvas = null;
let cropper = null;

// --- Navigation Logic ---
function resetScanUI() {
    // Stoppe le flux natif si actif
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }
    // Détruit le cropper s'il est actif
    if (cropper) { cropper.destroy(); cropper = null; }
    // Efface le canvas
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    // Réinitialise l'image
    inputImage.classList.add('hidden');
    inputImage.src = '';
    capturedBase64 = null;
    capturedCanvas = null;
    // Réinitialise les boutons
    reviewButtons.classList.add('hidden');
    btnCapture.classList.add('hidden');
    btnAnalyzeUpload.classList.add('hidden');
    // Masque la vidéo
    inputVideo.classList.add('hidden');
}

function navigateTo(targetId) {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen && currentScreen.id === 'screen-scan' && targetId !== 'screen-scan') {
        resetScanUI();
    }

    screens.forEach(screen => {
        if (screen.id === targetId) {
            screen.classList.add('active');
        } else {
            screen.classList.remove('active');
        }
    });

    if (targetId === 'screen-results') {
        renderResults();
    }
}

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navigateTo(btn.dataset.target);
    });
});

// --- Share API ---
btnShare.addEventListener('click', async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'FC26 Cranium Results',
                text: 'Check out my face geometry mapped to FC26 Cranium sliders!',
                // You could generate a text string of the sliders here
            });
        } catch (err) {
            console.log('Error sharing', err);
        }
    } else {
        alert('Web Share API not supported on this browser.');
    }
});

// --- Premium Gate ---
btnPurchase.addEventListener('click', () => {
    // Simulate Stripe purchase
    alert('Simulating Stripe Checkout...');
    setTimeout(() => {
        state.isPremium = true;
        document.querySelector('.tier-indicator .badge-free').textContent = 'PRO TIER';
        document.querySelector('.tier-indicator .badge-free').style.background = 'var(--neon-purple)';
        document.querySelector('.btn-upgrade-sm').classList.add('hidden');
        document.querySelector('.premium-gate').classList.add('hidden');
        navigateTo('screen-results'); // Re-render results
    }, 1000);
});

// --- MediaPipe Face Mesh Initialization ---
const faceMesh = new FaceMesh({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true, // Need 468 landmarks
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

let camera = null;

// --- Upload Photo Flow ---
fileUpload.addEventListener('change', (e) => {
    console.log('Button Clicked: fileUpload');
    const file = e.target.files[0];
    if (!file) return;

    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }
    capturedBase64 = null;
    capturedCanvas = null;
    if (cropper) { cropper.destroy(); cropper = null; }

    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target.result;

        inputImage.onload = () => {
            initCropper(inputImage);
            inputVideo.classList.add('hidden');
            btnCapture.classList.add('hidden');
            btnAnalyzeUpload.classList.add('hidden');
            reviewButtons.classList.remove('hidden');
            navigateTo('screen-scan');
        };

        inputImage.classList.remove('hidden');
        inputImage.src = dataUrl;
    };
    reader.readAsDataURL(file);
    fileUpload.value = '';
});

// --- Live Camera Flow ---
btnCamera.addEventListener('click', () => {
    console.log('Button Clicked: btnCamera');
    capturedBase64 = null;
    capturedCanvas = null;
    if (cropper) { cropper.destroy(); cropper = null; }
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    reviewButtons.classList.add('hidden');
    inputImage.classList.add('hidden');
    inputImage.src = '';
    inputVideo.classList.remove('hidden');
    inputVideo.removeAttribute('hidden');
    inputVideo.style.display = 'block';
    btnAnalyzeUpload.classList.add('hidden');
    btnCapture.classList.remove('hidden');

    navigateTo('screen-scan');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then(function(stream) {
            window.localStream = stream;
            inputVideo.srcObject = stream;
            inputVideo.muted = true;
            inputVideo.play().catch(e => console.error("Erreur play:", e));
        })
        .catch(function(error) {
            console.error("Erreur caméra:", error);
            alert("Accès à la caméra impossible. Vérifiez les permissions.");
        });
    } else {
        alert("Votre navigateur ne supporte pas la capture vidéo.");
    }
});

async function checkPhotoQuality(base64Image) {
    try {
        const response = await fetch('https://69f56e82003365eb237a.fra.appwrite.run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });
        const data = await response.json();
        
        if (!data || data.length === 0 || !data[0].faceAttributes) {
            return { ok: false, reason: 'no_face' };
        }
        
        const attrs = data[0].faceAttributes;
        
        if (attrs.blur && attrs.blur.value > 0.5) {
            return { ok: false, reason: 'too_blurry' };
        }
        
        if (attrs.exposure && (attrs.exposure.value < 0.2 || attrs.exposure.value > 0.8)) {
            return { ok: false, reason: 'bad_lighting' };
        }
        
        if (attrs.headPose && (Math.abs(attrs.headPose.yaw) > 30 || Math.abs(attrs.headPose.pitch) > 30)) {
            return { ok: false, reason: 'bad_angle' };
        }
        
        return { ok: true };
    } catch (e) {
        console.error("Quality Gate Error:", e);
        return { ok: true }; 
    }
}

// Capture — Étape 1 : figer la frame, corriger le miroir, injecter dans Cropper
btnCapture.addEventListener('click', () => {
    console.log('Button Clicked: btnCapture');
    capturedCanvas = document.createElement('canvas');
    capturedCanvas.width  = inputVideo.videoWidth;
    capturedCanvas.height = inputVideo.videoHeight;

    // La vidéo CSS est scaleX(-1) — on ré-inverse le canvas pour l'image naturelle
    const ctx = capturedCanvas.getContext('2d');
    ctx.translate(capturedCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(inputVideo, 0, 0, capturedCanvas.width, capturedCanvas.height);

    const dataUrl = capturedCanvas.toDataURL('image/jpeg', 0.95);
    capturedBase64 = dataUrl.split(',')[1];

    inputImage.onload = () => {
        initCropper(inputImage);
        inputImage.onload = null;
    };
    inputImage.src = dataUrl;
    inputImage.classList.remove('hidden');
    inputVideo.classList.add('hidden');
    btnCapture.classList.add('hidden');
    reviewButtons.classList.remove('hidden');
});

// Étape 1b : Reprendre — détruit le cropper, relance live ou retourne à l'accueil
btnRetake.addEventListener('click', () => {
    console.log('Button Clicked: btnRetake');
    capturedBase64 = null;
    capturedCanvas = null;
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    reviewButtons.classList.add('hidden');

    if (cropper) { cropper.destroy(); cropper = null; }
    inputImage.classList.add('hidden');
    inputImage.src = '';

    // Stream live encore actif → mode Live Camera → relance la vidéo
    if (window.localStream) {
        inputVideo.classList.remove('hidden');
        btnCapture.classList.remove('hidden');
        return;
    }

    // Sinon mode Upload → retour à l'accueil
    navigateTo('screen-home');
});

// Confirmer — Étape 2 : extraire le crop, Azure quality check, puis MediaPipe
btnConfirmAnalyze.addEventListener('click', async () => {
    console.log('Button Clicked: btnConfirmAnalyze');
    if (!cropper) return;

    const croppedCanvas = cropper.getCroppedCanvas({ imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
    const imageDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.95);
    capturedBase64 = imageDataUrl.split(',')[1];

    cropper.destroy();
    cropper = null;
    inputImage.classList.add('hidden');

    if (window.localStream) {
        window.localStream.getTracks().forEach(t => t.stop());
        window.localStream = null;
    }

    reviewButtons.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');

    const quality = await checkPhotoQuality(capturedBase64);
    if (!quality.ok) {
        loadingIndicator.classList.add('hidden');
        if (quality.reason === 'no_face') showQAWarning("Aucun visage détecté. Réessaie.");
        else if (quality.reason === 'too_blurry') showQAWarning("Photo trop floue. Prends une photo plus nette.");
        else if (quality.reason === 'bad_lighting') showQAWarning("Éclairage insuffisant. Trouve un endroit plus lumineux.");
        else if (quality.reason === 'bad_angle') showQAWarning("Tiens ta tête droite face à la caméra.");
        reviewButtons.classList.remove('hidden');
        return;
    }

    const img = new Image();
    img.onload = async () => {
        outputCanvas.width  = img.naturalWidth;
        outputCanvas.height = img.naturalHeight;
        await faceMesh.send({ image: img });
    };
    img.src = imageDataUrl;
});

// Analyze (Upload)
btnAnalyzeUpload.addEventListener('click', async () => {
    loadingIndicator.classList.remove('hidden');
    
    const base64Image = inputImage.src.includes(',') ? inputImage.src.split(',')[1] : inputImage.src;
    const quality = await checkPhotoQuality(base64Image);
    if (!quality.ok) {
        loadingIndicator.classList.add('hidden');
        if (quality.reason === 'no_face') showQAWarning("Aucun visage détecté. Réessaie.");
        else if (quality.reason === 'too_blurry') showQAWarning("Photo trop floue. Prends une photo plus nette.");
        else if (quality.reason === 'bad_lighting') showQAWarning("Éclairage insuffisant. Trouve un endroit plus lumineux.");
        else if (quality.reason === 'bad_angle') showQAWarning("Tiens ta tête droite face à la caméra.");
        return;
    }

    await faceMesh.send({image: inputImage});
});

// --- Results Callback ---
function onResults(results) {
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    if (results.image) {
        // Draw the original image/video to canvas to match aspect ratio
        canvasCtx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);
    }

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        // ── QA GATE — Qualité de capture ──────────────────────────
        const qa = checkCaptureQuality(landmarks, outputCanvas);
        if (!qa.ok) {
            loadingIndicator.classList.add('hidden');
            showQAWarning(qa.reason);
            return;
        }
        
        // Draw Mesh
        drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#00f0ff'});

        // Perform Calculations (async — ITA may show confirmation UI)
        detectSkinToneFromCanvas(results.image, landmarks, (skinTone, skinMeta) => {
            const tempRatios = extractMorphRatios(landmarks);
            loadingIndicator.classList.add('hidden');

            showMorphoConfirmation(tempRatios, () => {
                state.results = analyzeFace(landmarks, skinTone);
                state.results.skinMeta = skinMeta;
                // Merge user-confirmed labels so renderResults can display them
                if (state.results.ratios) {
                    state.results.ratios.levres_label  = tempRatios.levres_label;
                    state.results.ratios.nez_label     = tempRatios.nez_label;
                    state.results.ratios.machoire_label = tempRatios.machoire_label;
                }
                navigateTo('screen-results');
            });
        });
    } else {
        loadingIndicator.classList.add('hidden');
        // Only alert if they clicked capture
        if (!inputVideo.classList.contains('hidden') === false) {
             alert("No face detected. Please try another photo.");
        }
    }
    canvasCtx.restore();
}

// ─── ZONE MIX — Rendu de la section "ÉTAPE 2 — Onglet Tête" ────
function renderZoneMix(zoneMix) {
  const mainPresetId = state.results?.preset?.id;

  const zones = [
    { key: 'front',    label: 'FRONT',    sub: 'Frente' },
    { key: 'machoire', label: 'MÂCHOIRE', sub: 'Jaw' },
    { key: 'joues',    label: 'JOUES',    sub: 'Cheeks' },
    { key: 'menton',   label: 'MENTON',   sub: 'Chin' },
    { key: 'oreilles', label: 'OREILLES', sub: 'Ears' },
    { key: 'cou',      label: 'COU',      sub: 'Neck' },
    { key: 'yeux',     label: 'YEUX',     sub: 'Eyes' },
    { key: 'sourcils', label: 'SOURCILS', sub: 'Brows' },
    { key: 'nez',      label: 'NEZ',      sub: 'Nose' },
    { key: 'bouche',   label: 'BOUCHE',   sub: 'Mouth' },
  ];

  const section = document.createElement('div');
  section.id = 'zone-mix-section';
  section.style.cssText = 'margin: 20px 0; border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; overflow: hidden;';

  const rowsHtml = zones.map(z => {
    const id = zoneMix[z.key];
    const differs = id !== mainPresetId;
    return `
      <div class="slider-row" style="display:flex; align-items:center; justify-content:space-between; padding:8px 16px; border-bottom:1px solid rgba(255,255,255,0.05);">
        <div class="slider-info" style="flex:1;">
          <div class="slider-name" style="${differs ? 'color:#00f0ff; font-weight:600;' : ''}">
            ${z.label}
            <span style="font-size:0.78rem; font-weight:400; color:${differs ? '#00f0ff' : '#666'};">(${z.sub})</span>
          </div>
        </div>
        <div class="slider-value" style="min-width:36px; text-align:right; ${differs ? 'color:#00f0ff; font-weight:700;' : ''}">${id}</div>
        <button class="btn-copy" onclick="copyValue(${id}, this)" style="margin-left:8px;">Copy</button>
      </div>
    `;
  }).join('');

  section.innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(0,240,255,0.1),rgba(0,240,255,0.05)); padding:12px 16px; border-bottom:1px solid rgba(0,240,255,0.2); display:flex; align-items:center; gap:10px;">
      <span style="font-size:1.2rem">🎯</span>
      <div>
        <div style="font-family:'Outfit',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#00f0ff; font-size:0.9rem;">ÉTAPE 2 — Onglet Tête</div>
        <div style="font-size:0.75rem; color:#666; margin-top:2px;">Dans FC26, onglet Tête — une tête par zone</div>
      </div>
    </div>
    <div style="padding:8px 0;">${rowsHtml}</div>
  `;

  return section;
}

function showMorphoConfirmation(detectedData, callback) {
    const jawRatio = detectedData.jawToFaceRatio ?? 0;
    const initialMachoire = jawRatio > 0.76 ? "Large" : jawRatio > 0.65 ? "Moyenne" : "Fine";
    
    const nezRatio = detectedData.noseToInterEye ?? 0;
    const initialNez = nezRatio > 0.48 ? "Large" : "Moyen";
    
    const boucheRatio = detectedData.mouthToFace ?? 0;
    const initialLevres = boucheRatio < 0.38 ? "Pleines" : "Fines";
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(10, 10, 12, 0.85); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center; z-index: 10000;
        font-family: 'Outfit', sans-serif;
    `;

    const makeGroup = (title, options, initial) => {
        const html = options.map(opt => `
            <button class="morpho-btn ${opt === initial ? 'selected' : ''}" data-val="${opt}"
                style="
                    flex: 1; padding: 10px; background: ${opt === initial ? '#00f0ff' : 'transparent'};
                    color: ${opt === initial ? '#0a0a0c' : 'white'}; border: 1px solid #00f0ff;
                    border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;
                ">
                ${opt}
            </button>
        `).join('');
        return `
            <div style="margin-bottom: 20px;">
                <div style="color: white; margin-bottom: 8px; font-weight: 600;">${title}</div>
                <div class="morpho-group" style="display: flex; gap: 10px;">${html}</div>
            </div>
        `;
    };

    modal.innerHTML = `
        <div style="
            background: #0a0a0c; border: 1px solid #00f0ff; border-radius: 12px;
            padding: 24px; width: 90%; max-width: 400px; box-shadow: 0 0 20px rgba(0,240,255,0.2);
        ">
            <h3 style="color: #00f0ff; margin-top: 0; margin-bottom: 20px; text-align: center; font-weight: 800; text-transform: uppercase;">
                CONFIRMATION
            </h3>
            
            ${makeGroup("1. Tes lèvres sont :", ["Fines", "Moyennes", "Pleines"], initialLevres)}
            ${makeGroup("2. Ton nez est :", ["Fin", "Moyen", "Large"], initialNez)}
            ${makeGroup("3. Ta mâchoire est :", ["Fine", "Moyenne", "Large"], initialMachoire)}

            <button id="btn-morpho-confirm" style="
                width: 100%; padding: 14px; background: #00f0ff; color: #0a0a0c;
                border: none; border-radius: 8px; font-weight: 800; font-size: 1.1rem;
                cursor: pointer; margin-top: 10px; text-transform: uppercase;
            ">CONFIRMER</button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('.morpho-group').forEach(group => {
        const btns = group.querySelectorAll('.morpho-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => {
                    b.classList.remove('selected');
                    b.style.background = 'transparent';
                    b.style.color = 'white';
                });
                btn.classList.add('selected');
                btn.style.background = '#00f0ff';
                btn.style.color = '#0a0a0c';
            });
        });
    });

    document.getElementById('btn-morpho-confirm').addEventListener('click', () => {
        const groups = modal.querySelectorAll('.morpho-group');
        detectedData.levres_label = groups[0].querySelector('.selected').dataset.val;
        detectedData.nez_label = groups[1].querySelector('.selected').dataset.val;
        detectedData.machoire_label = groups[2].querySelector('.selected').dataset.val;
        
        modal.remove();
        callback();
    });
}

// --- Render UI ---
function renderResults() {
    if (!state.results) return;
    const result = state.results;
    
    const resultsContainer = document.querySelector('.results-container');
    const existingHeader = document.querySelector('.preset-header');
    if (existingHeader) existingHeader.remove();
    const existingAdvTitle = document.getElementById('adv-title');
    if (existingAdvTitle) existingAdvTitle.remove();
    const existingAdvAccordion = document.getElementById('adv-accordion');
    if (existingAdvAccordion) existingAdvAccordion.remove();
    const existingDebug = document.querySelector('.debug-banner');
    if (existingDebug) existingDebug.remove();
    const existingZoneMix = document.getElementById('zone-mix-section');
    if (existingZoneMix) existingZoneMix.remove();

    // Bandeau de détection IA (v6 : ITA)
    const meta = result.skinMeta || {};
    const lab = detectSkinToneFromCanvas._lastLab || {};
    const ita = detectSkinToneFromCanvas._lastITA;
    const rgb = detectSkinToneFromCanvas._lastRGB || {};

    let debugHtml = `
      <div class="debug-banner" style="background:rgba(0,200,255,0.08); border:1px solid rgba(0,200,255,0.3); border-radius:8px; padding:12px 16px; margin-bottom:14px; font-size:0.82rem; color:var(--text-secondary,#aaa);">
        <p style="font-weight:bold; color:#00c8ff; margin:0 0 6px;">🔍 <strong>Ce que l'IA a détecté sur ta photo</strong></p>
        <span>🎨 Peau (ITA: ${ita !== undefined ? Math.round(ita*10)/10 : '?'}°) : <strong>${result.skinTone}</strong>
        ${meta.auto ? '🤖 Auto' : '✅ Confirmé'}</span><br>
        <span>📐 Forme : <strong>${result.faceShape}</strong></span>
        <span>🎯 Preset : <strong>${result.preset.couleur_peau || result.detection?.presetSkinTone} / ${result.preset.forme_visage || result.detection?.presetFaceShape}</strong></span>
        <span>📊 Confiance : ✅ Haute (${result.score} pts)</span>
        <span>🔬 RGB : R${rgb.r} G${rgb.g} B${rgb.b} | Lab: L=${Math.round(lab.L||0)} a=${Math.round(lab.a||0)} b=${Math.round(lab.b||0)}</span>
        <span>📐 Ratios bruts : Nez=${result.ratios?.noseToInterEye?.toFixed(3)} | Mâch=${result.ratios?.jawToFaceRatio?.toFixed(3)} | Joues=${result.ratios?.cheekToFaceRatio?.toFixed(3)} | Bouche=${result.ratios?.mouthToFace?.toFixed(3)} | Yeux=${result.ratios?.eyeOpenness?.toFixed(3)} | Sourcils=${result.ratios?.eyebrowHeightRatio?.toFixed(3)} | EcartSourcils=${result.ratios?.eyebrowGap?.toFixed(3)} | VolLevres=${result.ratios?.lipFullness?.toFixed(3)} | EvasNez=${result.ratios?.noseFlare?.toFixed(3)} | Philtrum=${result.ratios?.philtrum?.toFixed(3)} | Pommettes=${result.ratios?.cheekProminence?.toFixed(3)} | PosYeux=${result.ratios?.eyeHeightPos?.toFixed(3)}</span>
      </div>
    `;

    let headerHtml = `
        ${debugHtml}
        <div class="preset-header" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1)); border: 1px solid gold; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: gold; text-align: center;">
            <h2 style="margin-top:0; font-size:1.2rem;">🎯 Résultat pour ton visage</h2>
            <div class="preset-card">
                <p style="margin:5px 0;">ÉTAPE 1 — Choisis cette tête dans FC26 :</p>
                <h3 style="margin:5px 0; font-size:1.5rem;">➡️ ${result.preset.label}</h3>
                <p style="margin:0; font-size:0.9rem; opacity:0.8;">Preset ID : ${result.preset.id}</p>
                <img src="./assets/presets/${result.preset.id}.png" class="preset-preview-img" alt="Visage recommandé" onerror="this.style.display='none'">
            </div>
        </div>
    `;

    resultsContainer.insertAdjacentHTML('beforeend', headerHtml);

    // Zone Mix — ÉTAPE 2 : onglet Tête
    const mainPresetObj = PRESETS_DB.find(p => p.preset_id === result.preset.id);
    let zoneMix = null;
    if (mainPresetObj) {
      zoneMix = computeZoneMix(result.ratios, mainPresetObj, PRESETS_DB);
      resultsContainer.appendChild(renderZoneMix(zoneMix));
    }

  // ── FAÇONNAGE AVANCÉ ─────────────────────────────────────
  if (result.preset && result.preset.avance) {
    const mainPid = result.preset.id;

    // Resolve per-zone preset for avance data using zoneMix
    const getZonePreset = mixKey => {
      if (!zoneMix || mixKey == null) return mainPresetObj;
      const pid = zoneMix[mixKey];
      return (pid != null ? PRESETS_DB.find(p => p.preset_id === pid) : null) ?? mainPresetObj;
    };

    const craneP    = getZonePreset(null);
    const frontP    = getZonePreset('front');
    const sourcilsP = getZonePreset('sourcils');
    const yeuxP     = getZonePreset('yeux');
    const nezP      = getZonePreset('nez');
    const jouesP    = getZonePreset('joues');
    const boucheP   = getZonePreset('bouche');
    const mentonP   = getZonePreset('menton');
    const machoireP = getZonePreset('machoire');

    // Labels lisibles pour chaque clé
    const keyLabels = {
      re: 'Réduire/Élargir', bh: 'Bas/Haut', na: 'Neutre/Avant',
      aa: 'Arrière/Avant', ang: 'Arrondi/Angulaire', gd: 'Gauche/Droite',
      nr: 'Neutre/Arrondi', nh: 'Neutre/Haut', gp: 'Plus grande/Petite'
    };

    // Structure des zones avancées — base DNA par zone via zoneMix
    const advZones = [
      {
        label: 'Tête', icon: '👤', basePresetId: craneP?.preset_id,
        subs: [
          { label: 'Crane principal', avanceKey: 'crane', noAdjust: true,
            data: craneP?.avance?.crane ? {
              re: craneP.avance.crane.re,
              bh: craneP.avance.crane.bh,
              na: craneP.avance.crane.na,
              aa: craneP.avance.crane.aa,
              gd: craneP.avance.crane.gd
            } : undefined
          },
          { label: 'Couronne', avanceKey: 'couronne', noAdjust: true,
            data: craneP?.avance?.couronne ? {
              re: craneP.avance.couronne.re,
              bh: craneP.avance.couronne.bh,
              aa: craneP.avance.couronne.aa,
              nr: craneP.avance.couronne.nr,
              gd: craneP.avance.couronne.gd
            } : undefined
          },
          { label: 'Arrière du crâne', avanceKey: 'arriere_crane', noAdjust: true,
            data: craneP?.avance?.arriere_crane ? {
              re: craneP.avance.arriere_crane.re,
              bh: craneP.avance.arriere_crane.bh,
              aa: craneP.avance.arriere_crane.aa,
              ang: craneP.avance.arriere_crane.ang,
              gd: craneP.avance.arriere_crane.gd
            } : undefined
          },
          { label: 'Tempes', avanceKey: 'tempes', noAdjust: true,
            data: craneP?.avance?.tempes ? {
              re: craneP.avance.tempes.re,
              bh: craneP.avance.tempes.bh,
              aa: craneP.avance.tempes.aa,
              ang: craneP.avance.tempes.ang
            } : undefined
          }
        ]
      },
      {
        label: 'Front', icon: '🗣️', basePresetId: frontP?.preset_id,
        subs: [
          { label: 'Partie supérieure', avanceKey: 'front_sup', data: frontP?.avance?.front_sup },
          { label: 'Partie inférieure', avanceKey: 'front_inf', data: frontP?.avance?.front_inf },
        ]
      },
      {
        label: 'Sourcils', icon: '👁️', basePresetId: sourcilsP?.preset_id,
        subs: [
          { label: 'Sourcils',           avanceKey: 'sourcils',     data: sourcilsP?.avance?.sourcils },
          { label: 'Partie centrale',    avanceKey: 'sourcils_ctr', data: sourcilsP?.avance?.sourcils_ctr },
          { label: 'Partie extérieure',  avanceKey: 'sourcils_ext', data: sourcilsP?.avance?.sourcils_ext },
        ]
      },
      {
        label: 'Yeux', icon: '👁️', basePresetId: yeuxP?.preset_id,
        subs: [
          { label: 'Yeux',    avanceKey: 'yeux',    data: yeuxP?.avance?.yeux },
          { label: 'Orbites', avanceKey: 'orbites', data: yeuxP?.avance?.orbites },
        ]
      },
      {
        label: 'Nez', icon: '👃', basePresetId: nezP?.preset_id,
        subs: [
          { label: 'Nez principal',    avanceKey: 'nez_adv',        data: nezP?.avance?.nez_adv },
          { label: 'Arête côtés',      avanceKey: 'arete_cotes',    data: nezP?.avance?.arete_cotes },
          { label: 'Arête centrale',   avanceKey: 'arete_centrale', data: nezP?.avance?.arete_centrale },
          { label: 'Arête supérieure', avanceKey: 'arete_sup',      data: nezP?.avance?.arete_sup },
        ]
      },
      {
        label: 'Joues', icon: '😊', basePresetId: jouesP?.preset_id,
        subs: [
          { label: 'Joues', avanceKey: 'joues_adv', data: jouesP?.avance?.joues_adv },
        ]
      },
      {
        label: 'Bouche', icon: '👄', basePresetId: boucheP?.preset_id,
        subs: [
          { label: 'Bouche',         avanceKey: 'bouche_adv', data: boucheP?.avance?.bouche_adv },
          { label: 'Extérieur sup.', avanceKey: 'bouche_ext', data: boucheP?.avance?.bouche_ext },
        ]
      },
      {
        label: 'Menton', icon: '🫦', basePresetId: mentonP?.preset_id,
        subs: [
          { label: 'Menton',            avanceKey: 'menton_adv', data: mentonP?.avance?.menton_adv },
          { label: 'Partie supérieure', avanceKey: 'menton_sup', data: mentonP?.avance?.menton_sup },
        ]
      },
      {
        label: 'Mâchoire', icon: '💪', basePresetId: machoireP?.preset_id,
        subs: [
          { label: 'Mâchoire',   avanceKey: 'machoire_adv', data: machoireP?.avance?.machoire_adv },
          { label: 'Maxillaire', avanceKey: 'maxillaire',   data: machoireP?.avance?.maxillaire },
          { label: 'Mandibule',  avanceKey: 'mandibule',    data: machoireP?.avance?.mandibule },
        ]
      },
    ];

    // Titre séparateur
    const advTitle = document.createElement('div');
    advTitle.id = 'adv-title';
    advTitle.style.cssText = `
      margin: 24px 0 12px; padding: 12px 16px;
      background: linear-gradient(135deg, rgba(176,38,255,0.1), rgba(0,240,255,0.05));
      border: 1px solid rgba(176,38,255,0.3); border-radius: 8px;
      display: flex; align-items: center; gap: 10px;
    `;
    advTitle.innerHTML = `
      <span style="font-size:1.2rem">🔬</span>
      <div>
        <div style="font-family:'Outfit',sans-serif; font-weight:700;
          text-transform:uppercase; letter-spacing:2px; color:#b026ff; font-size:0.9rem;">
          Façonnage Avancé
        </div>
        <div style="font-size:0.75rem; color:#666; margin-top:2px;">
          Active "Façonnage Avancé" dans FC26 puis applique ces valeurs
        </div>
      </div>
    `;
    resultsContainer.appendChild(advTitle);

    // Accordéon avancé
    const advAccordion = document.createElement('div');
    advAccordion.id = 'adv-accordion';
    advAccordion.className = 'accordion';

    advZones.forEach(zone => {
      const item = document.createElement('div');
      item.className = 'accordion-item';

      const baseLabel = zone.basePresetId && zone.basePresetId !== mainPid
        ? `<span style="font-size:0.72rem; color:#b026ff; font-weight:400; margin-left:8px; opacity:0.85;">— base Preset ${zone.basePresetId}</span>`
        : '';

      // Build sub-sections, tracking modification status bottom-up
      let subsHtml = '';
      let zoneIsModified = false;

      zone.subs.forEach(sub => {
        if (!sub.data) return;

        const sliderEntries = Object.entries(sub.data).map(([key, val]) => {
          const adjVal = sub.noAdjust ? undefined : result.adjustments?.avance?.[sub.avanceKey]?.[key];
          const isModified = adjVal !== undefined && Math.abs(adjVal - val) > 1;
          console.log(`[ModBadge] ${sub.avanceKey}.${key} → base=${val}, adj=${adjVal}, display=${isModified ? adjVal : val}, modified=${isModified}`);
          return { key, displayVal: isModified ? adjVal : val, isModified };
        });

        const subIsModified = sliderEntries.some(e => e.isModified);
        if (subIsModified) zoneIsModified = true;

        const subModBadge = subIsModified
          ? `<span style="color:#00f0ff; font-size:0.72rem; font-weight:bold; margin-left:6px;">(Modifié)</span>`
          : '';

        subsHtml += `
          <div style="margin-bottom:12px;">
            <div style="font-size:0.78rem; color:#b026ff; font-weight:600;
              text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;
              padding-bottom:4px; border-bottom:1px solid rgba(176,38,255,0.2);">
              └ ${sub.label}${subModBadge}
            </div>
            ${sliderEntries.map(({ key, displayVal, isModified }) => `
              <div class="slider-row" style="padding:6px 0; margin-bottom:0; border-bottom:1px solid rgba(255,255,255,0.05);">
                <div class="slider-info">
                  <div class="slider-name" style="font-size:0.82rem; color:var(--text-secondary);">
                    ${keyLabels[key] || key}
                  </div>
                </div>
                <div class="slider-value" style="font-size:1rem; min-width:32px; text-align:right; color:${isModified ? '#00f0ff' : '#ffffff'};">${displayVal}</div>
                <button class="btn-copy" onclick="copyValue(${displayVal}, this)" style="margin-left:8px;">Copy</button>
              </div>
            `).join('')}
          </div>
        `;
      });

      const zoneModBadge = zoneIsModified
        ? `<span style="color:#00f0ff; font-size:0.72rem; font-weight:bold; margin-left:6px;">(Modifié)</span>`
        : '';

      item.innerHTML = `
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <span>${zone.icon} ${zone.label}${zoneModBadge}${baseLabel}</span>
          <span>▼</span>
        </div>
        <div class="accordion-content">
          ${subsHtml}
        </div>
      `;
      advAccordion.appendChild(item);
    });

    resultsContainer.appendChild(advAccordion);
  }
}

// Global functions for inline HTML handlers
window.toggleAccordion = function(element) {
    const item = element.parentElement;
    if (item.classList.contains('locked')) return;
    
    // Close others
    document.querySelectorAll('.accordion-item').forEach(el => {
        if (el !== item) el.classList.remove('expanded');
    });
    
    item.classList.toggle('expanded');
};

window.copyValue = function(value, btn) {
    navigator.clipboard.writeText(value.toString()).then(() => {
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        btn.style.color = 'var(--success)';
        btn.style.borderColor = 'var(--success)';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 1500);
    });
};
