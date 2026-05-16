// ============================================================
// FC26 CRANIUM ANALYZER — PRESET MATCHER v1.0
// ============================================================

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION BLOCK — Frontend Endpoints
// ═══════════════════════════════════════════════════════════════════════
const CONFIG = {
  AZURE_FUNCTION_ENDPOINT: 'https://scanmyface-site-hdbheranbyd8htc5.germanywestcentral-01.azurewebsites.net/api/matchFace',
  APPWRITE_ENDPOINT: 'https://69f56e82003365eb237a.fra.appwrite.run',
  STRIPE_PAYMENT_LINK: 'https://buy.stripe.com/test_9B600bbtE9ag44ocJAg7e00'
};

// --- 1. SURVIVAL & i18n BLOCK ---
let capturedBase64 = null;
let capturedCanvas = null;
let cropper = null;
let currentLang = 'fr';

const state = {
    results: null,
    zoneMix: null,
    pendingAnalysis: null,
    isPremium: localStorage.getItem('premium_unlocked') === 'true',
    scanMode: 'auto',
    autoLiveActive: false,
    autoProcessing: false,
    pendingUploadDataUrl: null,
    expertImageDataUrl: null,
    manualMeshPoints: {},
    expertMeshPending: false,
    expertMeshImage: null,
    expertMeshAttributes: null,
    initialMeshPoints: {},
    movedExpertPoints: new Set(),
    expertFullLandmarks: null
};

// --- 1. i18n EXTERNAL LOADING SYSTEM ---
let translations = {};

function unlockPremiumAccess() {
    localStorage.setItem('premium_unlocked', 'true');
    state.isPremium = true;
    applyPremiumUnlockUI();
}

function applyPremiumUnlockUI() {
    const unlocked = localStorage.getItem('premium_unlocked') === 'true';
    state.isPremium = unlocked;
    document.body?.classList.toggle('premium-unlocked', unlocked);

    if (!unlocked) return;

    document.querySelectorAll('.tier-indicator .badge-free').forEach(badge => {
        badge.textContent = 'PRO TIER';
        badge.style.background = 'var(--neon-purple)';
    });
    document.querySelectorAll('.btn-upgrade-sm, .premium-gate').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.accordion-item.locked, .premium-locked').forEach(el => el.classList.remove('locked', 'premium-locked'));

    document.querySelectorAll('#results-accordion, #result-card, #new-result-container, #zone-mix-view, #advanced-shaping-view').forEach(el => {
        el.classList.remove('blur', 'blur-sm', 'blur-md', 'blur-lg', 'opacity-50', 'pointer-events-none');
        el.style.filter = '';
        el.style.pointerEvents = '';
        el.style.opacity = '';
    });
}

function handleStripeSuccessRedirect() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') !== 'success') return;

    localStorage.setItem('premium_unlocked', 'true');
    state.isPremium = true;
    const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
    window.history.replaceState({}, document.title, cleanUrl);
}

window.setLanguage = async function(lang) {
    try {
        // Sauvegarde de la préférence
        localStorage.setItem('preferredLang', lang);
        
        // Tentative de chargement depuis plusieurs chemins possibles (app/ ou racine)
        // Prefer local project file first
        const paths = [`./${lang}.json`, `./app/${lang}.json`, `../${lang}.json`, `/${lang}.json` ];
        let data = null;
        
        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    data = await response.json();
                    console.log(`📡 Langue chargée depuis : ${path}`);
                    break;
                }
            } catch (e) {}
        }
        
        if (!data) {
            console.warn(`⚠️ Impossible de charger ${lang}.json. Fallback sur les clés.`);
            const defaultTranslations = {
                'mode.auto.kicker': 'Standard',
                'mode.auto.title': 'Scan Rapide',
                'mode.auto.desc': 'Détection automatique par l\'IA. Idéal pour un aperçu instantané.',
                'btn.auto.start': 'LANCER L\'IA',
                'mode.expert.kicker': 'Premium',
                'mode.expert.title': 'Précision Pro',
                'mode.expert.desc': 'Placez manuellement vos repères.',
                'btn.expert.start': 'DÉMARRER LE MAILLAGE',
                'btn.upload.text': 'Ou charger une photo depuis l\'appareil',
                'screen.scan.title': 'Scanning',
                'loading.landmarks': 'Detecting 468 facial landmarks...',
                'btn.mesh.validate': 'Valider Positions'
            };
            translations = defaultTranslations;
        } else {
            translations = data;
        }
        
        currentLang = lang;
        
        // Mise à jour des boutons de langue
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn) {
                const btnLang = btn.dataset.lang;
                btn.classList.toggle('active', btnLang === lang);
            }
        });
        
        // Mise à jour de l'indicateur premium
        const indicator = document.querySelector('.lang-indicator');
        const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
        if (indicator && activeBtn) {
            indicator.style.width = activeBtn.offsetWidth + 'px';
            indicator.style.left = activeBtn.offsetLeft + 'px';
        }
        
        // Traduction des éléments statiques [data-i18n]
        document.querySelectorAll('[data-i18n]').forEach(el => {
            if (el) {
                const key = el.dataset.i18n;
                if (translations[key]) el.innerHTML = translations[key];
            }
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.dataset.i18nAriaLabel;
            if (translations[key]) el.setAttribute('aria-label', translations[key]);
        });
        
        // Rafraîchissement des vues dynamiques si actives
        if (document.querySelector('#screen-preset-choice.active') && (state.pendingTop3 || state.pendingAnalysis)) {
          const top3 = state.pendingTop3 || state.pendingAnalysis.scores.slice(0, 3)
            .map(s => ({ preset: PRESETS_DB.find(p => p.preset_id === s.preset_id), score: s.score }))
            .filter(item => item.preset);
          showPresetChoiceScreen(top3);
        }
        if (state.zoneMix && typeof renderZoneMix === 'function') renderZoneMix(state.zoneMix);
        if (document.querySelector('.preset-header')) {
            if (typeof renderResults === 'function') renderResults();
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erreur i18n :', error);
        return false;
    }
};

window.t = function(key) {
    return translations[key] || key;
};

// Global handles for Survival
let btnCamera, btnExpertStart, btnUploadLink, fileUpload, uploadModeModal, btnUploadAuto, btnUploadExpert, btnUploadModeClose, screens, navButtons, btnCapture, btnAnalyzeUpload, inputVideo, inputImage, outputCanvas, canvasCtx, loadingIndicator, resultsAccordion, btnShare, btnPurchase, reviewButtons, btnRetake, btnConfirmAnalyze;

window.addEventListener('DOMContentLoaded', () => {
    handleStripeSuccessRedirect();
    // Basic elements
    screens = document.querySelectorAll('.screen');
    navButtons = document.querySelectorAll('[data-target]');
    fileUpload = document.getElementById('file-upload');
    btnCamera = document.getElementById('btn-camera');
    btnExpertStart = document.getElementById('btn-expert-start');
    btnUploadLink = document.getElementById('btn-upload-link');
    uploadModeModal = document.getElementById('upload-mode-modal');
    btnUploadAuto = document.getElementById('btn-upload-auto');
    btnUploadExpert = document.getElementById('btn-upload-expert');
    btnUploadModeClose = document.getElementById('btn-upload-mode-close');
    btnCapture = document.getElementById('btn-capture');
    btnAnalyzeUpload = document.getElementById('btn-analyze-upload');
    inputVideo = document.getElementById('input-video');
    inputImage = document.getElementById('input-image');
    outputCanvas = document.getElementById('output-canvas');
    if (outputCanvas) canvasCtx = outputCanvas.getContext('2d');
    loadingIndicator = document.getElementById('loading-indicator');
    resultsAccordion = document.getElementById('results-accordion');
    btnShare = document.getElementById('btn-share');
    btnPurchase = document.getElementById('btn-purchase');
    reviewButtons = document.querySelector('.review-buttons');
    btnRetake = document.getElementById('btn-retake');
    btnConfirmAnalyze = document.getElementById('btn-confirm-analyze');

    // Survival Listeners
    if (btnCamera) btnCamera.addEventListener('click', () => {
        console.log('Démarrage du maillage lancé');
        // Use user-controlled live scan (no automatic continuous detection)
        if (typeof startLiveScan === 'function') startLiveScan();
        else if (typeof startAutoLiveScan === 'function') startAutoLiveScan();
    });
    if (btnExpertStart) btnExpertStart.addEventListener('click', () => {
        console.log('Démarrage du maillage lancé');
        if (typeof startExpertScan === 'function') startExpertScan();
        else if (typeof startMesh === 'function') startMesh();
    });
    if (btnUploadLink) btnUploadLink.addEventListener('click', () => fileUpload?.click());
    if (fileUpload) fileUpload.addEventListener('change', (e) => {
        console.log('fileUpload change event');
        if (typeof handleFileUpload === 'function') handleFileUpload(e);
    });
    if (btnUploadAuto) btnUploadAuto.addEventListener('click', () => { if (typeof chooseUploadedMode === 'function') chooseUploadedMode('auto'); });
    if (btnUploadExpert) btnUploadExpert.addEventListener('click', () => { if (typeof chooseUploadedMode === 'function') chooseUploadedMode('expert'); });
    if (btnUploadModeClose) btnUploadModeClose.addEventListener('click', () => { if (typeof closeUploadModeModal === 'function') closeUploadModeModal(); });
    if (btnCapture) btnCapture.addEventListener('click', () => { if (typeof capturePhoto === 'function') capturePhoto(); });
    if (btnRetake) btnRetake.addEventListener('click', () => { if (typeof retakePhoto === 'function') retakePhoto(); });
    if (btnConfirmAnalyze) btnConfirmAnalyze.addEventListener('click', () => { if (typeof confirmAndAnalyze === 'function') confirmAndAnalyze(); });
    if (btnAnalyzeUpload) btnAnalyzeUpload.addEventListener('click', () => { if (typeof analyzeUpload === 'function') analyzeUpload(); });
    if (btnShare) btnShare.addEventListener('click', () => { if (typeof shareResults === 'function') shareResults(); });
    if (btnPurchase) btnPurchase.addEventListener('click', () => { if (typeof purchasePremium === 'function') purchasePremium(); });

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof navigateTo === 'function') navigateTo(btn.dataset.target);
        });
    });

    // Intercept physical 'back' buttons when cropper is active: return to camera instead of home
    document.querySelectorAll('.btn-back').forEach(backBtn => {
        backBtn.addEventListener('click', (e) => {
            try {
                const active = document.querySelector('.screen.active');
                if (active && active.id === 'screen-scan' && cropper) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Restore camera view instead of navigating home
                    retakePhoto();
                }
            } catch (err) { /* ignore */ }
        }, { capture: true });
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            setLanguage(btn.dataset.lang);
        });
    });
    setLanguage(localStorage.getItem('preferredLang') || 'fr');
    applyPremiumUnlockUI();
});



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
    const FACE_OVAL_IDX = [10, 338, 297, 332, 284, 251, 389, 251, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 21, 162, 21, 54, 103, 67, 109];
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
  let toneKey, ambiguous = false;

  if (ita > 68) {
    toneKey = "skin.tone.very.light";
  } else if (ita > 45) {
    toneKey = "skin.tone.light";
  } else if (ita > 22) {
    toneKey = "skin.tone.medium";
  } else if (ita > -5) {
    toneKey = "skin.tone.dark";
  } else {
    toneKey = "skin.tone.very.dark";
  }

  // Force l'affichage de la confirmation peau à 100% du temps
  ambiguous = true;

  return { toneKey, ambiguous, ita: Math.round(ita * 10) / 10 };
}

// ── 4. UI de confirmation peau ────────────────────────────────
// Affiche une bottom sheet avec 5 swatches quand ITA est ambigu
function showSkinConfirmUI(suggestedToneKey, ita, onConfirm) {
  // Supprime popup existant
  const existing = document.getElementById('skin-confirm-overlay');
  if (existing) existing.remove();

  // Mapping des clés de traduction aux données des swatches
  const toneMapping = {
    'skin.tone.very.light': { lab: "#F5DEB3", emoji: "🏻" },
    'skin.tone.light': { lab: "#F5DEB3", emoji: "🏻" },  // Re-utilisé pour "Very Light"
    'skin.tone.light.tanned': { lab: "#D4A574", emoji: "🏼" },
    'skin.tone.medium': { lab: "#C68642", emoji: "🏽" },
    'skin.tone.dark': { lab: "#8D5524", emoji: "🏾" },
    'skin.tone.very.dark': { lab: "#4A2912", emoji: "🏿" },
  };

  const swatches = [
    { key: 'skin.tone.very.light', ...toneMapping['skin.tone.very.light'] },
    { key: 'skin.tone.light.tanned', ...toneMapping['skin.tone.light.tanned'] },
    { key: 'skin.tone.medium', ...toneMapping['skin.tone.medium'] },
    { key: 'skin.tone.dark', ...toneMapping['skin.tone.dark'] },
    { key: 'skin.tone.very.dark', ...toneMapping['skin.tone.very.dark'] },
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
        ${t('skin.ai.suggests')} <strong style="color:#00f0ff;">${t(suggestedToneKey)}</strong>
        <span style="color:#555; font-size:11px;">(ITA: ${ita}°)</span>
      </p>
      <h3 style="color:#fff; font-size:1.1rem; font-family:'Outfit',sans-serif; text-transform:uppercase; letter-spacing:1px;">
        ${t('skin.confirm')}
      </h3>
    </div>

    <div style="display:flex; gap:4px; justify-content:center; margin-bottom:24px;" id="swatches-row">
      ${swatches.map((s, i) => `
        <button class="swatch-btn" data-tone-key="${s.key}" data-index="${i}" onclick="selectSwatch(this)">
          <div class="swatch-circle" style="background:${s.lab};"></div>
          <span class="swatch-label">${t(s.key)}</span>
        </button>
      `).join('')}
    </div>

    <button id="skin-confirm-btn" onclick="confirmSkinChoice()" style="
      width:100%; padding:14px; border:none; border-radius:10px;
      background:#00f0ff; color:#000; font-family:'Outfit',sans-serif;
      font-weight:700; font-size:1rem; text-transform:uppercase;
      cursor:pointer; opacity:0.4; pointer-events:none;
      transition: opacity 0.2s;
    ">${t('morph.confirm.btn')}</button>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  // Stocke le callback
  window._skinConfirmCallback = onConfirm;
  window._selectedSkinToneKey = null;

  // Pré-sélectionne la suggestion
  setTimeout(() => {
    const suggIdx = swatches.findIndex(s => s.key === suggestedToneKey);
    const btns = document.querySelectorAll('.swatch-btn');
    if (btns[suggIdx]) {
      btns[suggIdx].click();
    }
  }, 100);
}

window.selectSwatch = function(btn) {
  document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  window._selectedSkinToneKey = btn.dataset.toneKey;
  const confirmBtn = document.getElementById('skin-confirm-btn');
  if (confirmBtn) {
    confirmBtn.style.opacity = '1';
    confirmBtn.style.pointerEvents = 'auto';
  }
};

window.confirmSkinChoice = function() {
  const overlay = document.getElementById('skin-confirm-overlay');
  if (overlay) overlay.remove();
  if (window._skinConfirmCallback && window._selectedSkinToneKey) {
    window._skinConfirmCallback(window._selectedSkinToneKey);
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
    "Claire":        ["Claire", "Claire-bronzée"],
    "Claire-bronzée":["Claire", "Claire-bronzée"],
    "Métis":         ["Claire", "Claire-bronzée", "Métis", "Foncée", "Très foncée"],
    "Foncée":        ["Foncée", "Très foncée"],
    "Très foncée":   ["Foncée", "Très foncée"],
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
      const score = Math.max(0, 100 - distance * 100);
      distances.push({
        preset_id: preset.preset_id,
        position: preset.position,
        distance: distance,
        score: score,
        preset: preset
      });
    }
  }

  // Trie par score décroissant (meilleur score en premier = distance la plus basse)
  distances.sort((a, b) => b.score - a.score);

  const bestPreset = distances.length > 0 ? distances[0].preset : null;

  // Affiche les 3 meilleurs pour debug
  console.log("🏆 Top 3 presets :", distances.slice(0, 3).map(d => ({
    preset_id: d.preset_id,
    position: d.position,
    score: d.score.toFixed(1)
  })));

  return { bestPreset, ratios: userAttr, scores: distances };
}

async function fetchBestPresetFromAzure(ratios, skinTone) {
  const response = await fetch(CONFIG.AZURE_FUNCTION_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ratios, skinTone })
  });

  let data;
  try {
    data = await response.json();
    console.log(data);
  } catch (error) {
    throw new Error('Invalid response from matching service.');
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || 'Matching service unavailable.');
  }

  return data;
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
  const adjustments = {};

  // ── Min/Max dynamiques depuis PRESETS_DB (1 seul passage) ──────
  const rcFields = ['nez','machoire','joues','bouche','yeux','sourcils',
                    'eyebrowGap','lipFullness','noseFlare','philtrum',
                    'cheekProminence','eyeHeightPos'];
  const dbMin = {}, dbMax = {};
  for (const key of rcFields) {
    const vals = PRESETS_DB.map(p => p.ratios_cibles?.[key]).filter(v => v != null && isFinite(v));
    dbMin[key] = Math.min(...vals);
    dbMax[key] = Math.max(...vals);
  }

  function dynSlider(userRatio, key) {
    const mn = dbMin[key], mx = dbMax[key];
    if (!isFinite(mn) || !isFinite(mx) || mx === mn) return 50;
    return Math.max(0, Math.min(100, Math.round(((userRatio - mn) / (mx - mn)) * 100)));
  }

  // NEZ — Réduire/Élargir
  adjustments.nez = {};
  adjustments.nez.reduire_elargir = dynSlider(ratios.noseToInterEye || 0, 'nez');

  // NEZ — Arrondi/Angulaire (évasement narines)
  adjustments.nez.arrondi_angulaire = dynSlider(ratios.noseFlare || 0, 'noseFlare');

  // NEZ — Bas/Haut (position verticale, softClampSlider car hors ratios_cibles)
  adjustments.nez.bas_haut = softClampSlider(ratios.noseHeightRatio, 0.33, 0.20);

  // NEZ — Arrière/Avant (coordonnée Z)
  adjustments.nez.arriere_avant = softClampSlider(ratios.noseTipZ, -0.09, 0.07);

  // MÂCHOIRE — Réduire/Élargir
  adjustments.machoire = {};
  adjustments.machoire.reduire_elargir = dynSlider(ratios.jawToFaceRatio || 0, 'machoire');

  // MÂCHOIRE — Bas/Haut (angle gonial)
  adjustments.machoire.bas_haut = softClampSlider(ratios.jawHeightRatio, 0.60, 0.25);

  // JOUES — Réduire/Élargir
  adjustments.joues = {};
  adjustments.joues.reduire_elargir = dynSlider(ratios.cheekToFaceRatio || 0, 'joues');

  // JOUES — Arrière/Avant (saillie pommettes)
  adjustments.joues.arriere_avant = dynSlider(ratios.cheekProminence || 0, 'cheekProminence');

  // JOUES — Bas/Haut (hauteur pommettes)
  adjustments.joues.bas_haut = softClampSlider(ratios.cheekHeightRatio, 0.40, 0.20);

  // BOUCHE — Réduire/Élargir
  adjustments.bouche = {};
  adjustments.bouche.reduire_elargir = dynSlider(ratios.mouthToFace || 0, 'bouche');

  // BOUCHE — Arrondi/Angulaire (volume lèvres)
  adjustments.bouche.arrondi_angulaire = dynSlider(ratios.lipFullness || 0, 'lipFullness');

  // BOUCHE — Bas/Haut (philtrum → position verticale)
  adjustments.bouche.bas_haut = dynSlider(ratios.philtrum || 0, 'philtrum');

  // SOURCILS — Réduire/Élargir (écart inter-sourcils)
  adjustments.sourcils = {};
  adjustments.sourcils.reduire_elargir = dynSlider(ratios.eyebrowGap || 0, 'eyebrowGap');

  // SOURCILS — Bas/Haut (hauteur sourcil/œil)
  adjustments.sourcils.bas_haut = dynSlider(ratios.eyebrowHeightRatio || 0, 'sourcils');

  // ORBITES — Plus grande/petite (ouverture œil)
  adjustments.orbites = {};
  adjustments.orbites.plus_grande_petite = dynSlider(ratios.eyeOpenness || 0, 'yeux');

  // ORBITES — Bas/Haut (position verticale des yeux)
  adjustments.orbites.bas_haut = dynSlider(ratios.eyeHeightPos || 0, 'eyeHeightPos');

  // MENTON — Réduire/Élargir
  adjustments.menton = {};
  adjustments.menton.reduire_elargir = softClampSlider(ratios.chinWidthRatio, 0.15, 0.20);

  // MENTON — Bas/Haut
  adjustments.menton.bas_haut = softClampSlider(ratios.chinToFace, 0.04, 0.10);

  // FRONT — Réduire/Élargir
  adjustments.front_superieur = {};
  adjustments.front_superieur.reduire_elargir = softClampSlider(ratios.foreheadWidthRatio, 0.75, 0.30);

  // ── FAÇONNAGE AVANCÉ (softClampSlider direct, sans delta ±15) ──
  const clampAdv = (zone, slider, ratio, maxV, minV, zoneMixPresetId) => {
    if (!ratio || ratio === 0 || isNaN(ratio)) return;
    const basePreset = zoneMixPresetId
      ? PRESETS_DB.find(p => p.preset_id === zoneMixPresetId)
      : selectedPreset;
    if (basePreset?.avance?.[zone]?.[slider] === undefined) return;
    adjustments.avance = adjustments.avance || {};
    adjustments.avance[zone] = adjustments.avance[zone] || {};
    adjustments.avance[zone][slider] = softClampSlider(ratio, maxV, minV);
  };

  clampAdv('arete_cotes',    're', ratios.nez_arete_base,     0.22, 0.18, zoneMix?.nez);
  clampAdv('arete_centrale', 're', ratios.nez_arete_base,     0.22, 0.18, zoneMix?.nez);
  clampAdv('bouche_ext',     'bh', ratios.levres_ratio,       1.6,  1.1,  zoneMix?.bouche);
  clampAdv('bouche_adv',     'bh', ratios.levres_ratio,       1.6,  1.1,  zoneMix?.bouche);
  clampAdv('menton_adv',     'bh', ratios.menton_ratio,       2.3,  1.7,  zoneMix?.menton);
  clampAdv('menton_sup',     'bh', ratios.menton_ratio,       2.3,  1.7,  zoneMix?.menton);
  clampAdv('mandibule',      're', ratios.machoire_bigoniale, 0.80, 0.70, zoneMix?.machoire);
  clampAdv('maxillaire',     're', ratios.machoire_bigoniale, 0.80, 0.70, zoneMix?.machoire);
  
  // CRANE - Arrondi/Angulaire
  clampAdv('crane', 'ang', ratios.foreheadWidthRatio, 0.75, 0.30, zoneMix?.crane);

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
  const { bestPreset, ratios: userAttr, scores } = selectBestPreset(landmarks, finalSkinTone);

  console.log(`✅ Preset sélectionné : ${bestPreset.preset_id} (position ${bestPreset.position})`);
  console.log(`📐 Morphologie : ${faceShape}, Peau finale : ${finalSkinTone}`);
  console.log(`🏆 Top 3 presets :`, scores.slice(0, 3));

  // 3. Calcul des ajustements fins avec l'algorithme Frankenstein (zone-by-zone optimization)
  const zoneMix = computeZoneMix(userAttr, bestPreset, PRESETS_DB);
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
    ratios: userAttr,  // scanned_stats format pour compatibility avec Frankenstein
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
// ─── FRANKENSTEIN ALGORITHM: Zone-by-Zone Independent Optimization ──────────
/**
 * Implémente l'algorithme Frankenstein : pour chaque zone faciale, trouve le preset
 * ayant la meilleure correspondance indépendamment, sans filtrage par couleur de peau.
 * @param {Object} userAttr - Attributs de l'utilisateur (retour de calculateMixAttributes)
 * @param {Object} mainPreset - Preset principal de référence
 * @param {Array} allPresets - Liste complète des presets
 * @returns {Object} zoneMix avec preset_id gagnant pour chaque zone
 */
function computeZoneMix(userAttr, mainPreset, allPresets) {
  if (!userAttr || !mainPreset || !allPresets || allPresets.length === 0) {
    console.warn('⚠️ computeZoneMix: données incomplètes');
    return {};
  }

  const zones = ['front', 'sourcils', 'yeux', 'nez', 'joues', 'bouche', 'menton', 'machoire'];
  const zoneMix = {};

  console.group(`🧟 [Frankenstein Mix] Starting zone-by-zone optimization (${allPresets.length} presets)`);

  for (const zone of zones) {
    let bestPresetId = mainPreset.preset_id;
    let bestDistance = Infinity;

    // Cherche le meilleur preset pour cette zone spécifique
    for (const preset of allPresets) {
      if (!preset.scanned_stats || !preset.scanned_stats[zone]) continue;

      // Calcule la distance UNIQUEMENT pour cette zone
      const userZone = userAttr[zone];
      const presetZone = preset.scanned_stats[zone];
      const zoneDistance = calculateCategoryDistance(userZone, presetZone, zone);

      if (zoneDistance < bestDistance) {
        bestDistance = zoneDistance;
        bestPresetId = preset.preset_id;
      }
    }

    zoneMix[zone] = bestPresetId;
    console.log(`  ${zone.padEnd(10)} → preset #${bestPresetId} (distance: ${bestDistance.toFixed(3)})`);
  }

  console.groupEnd();
  return zoneMix;
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

  // CRANE
  const fcrane = zonePresets.crane?.faconner?.crane;
  if (fcrane) {
    const dang = softClampSlider(ratios.widthHeightRatio, 0.85, 0.70) - (fcrane.arrondi_angulaire || 50);
    if (Math.abs(dang) > 5) {
      adjustments.avance = adjustments.avance || {};
      adjustments.avance.crane = adjustments.avance.crane || {};
      adjustments.avance.crane.ang = clamp((fcrane.arrondi_angulaire || 50) + adj15(dang) * 0.90, 0, 100);
    }
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
  const { toneKey, ambiguous } = classifySkinByITA(ita);

  // Stocke pour le debug
  detectSkinToneFromCanvas._lastLab = lab;
  detectSkinToneFromCanvas._lastITA = ita;
  detectSkinToneFromCanvas._lastRGB = { r: Math.round(medR), g: Math.round(medG), b: Math.round(medB) };

  if (ambiguous) {
    // Affiche l'UI de confirmation
    showSkinConfirmUI(toneKey, Math.round(ita * 10) / 10, (confirmedToneKey) => {
      onResult(confirmedToneKey, { auto: false, ita, ambiguous: true, confirmed: confirmedToneKey });
    });
  } else {
    // Résultat automatique direct
    onResult(toneKey, { auto: true, ita, ambiguous: false });
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

console.log('App Initialized (Logic)');

// Redundant state removed, already defined at top.

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
    // When cropper is ready, show confirm button and wire it to confirmAndAnalyze
    const confirmBtn = document.getElementById('btn-confirm-analyze');
    if (confirmBtn) {
        confirmBtn.classList.remove('hidden');
        confirmBtn.style.display = 'inline-block';
        confirmBtn.innerText = translations['btn.confirm.analyze'] || 'Valider et Lancer le Scan';
        confirmBtn.onclick = async () => {
            console.log('Démarrage du maillage lancé');
            if (typeof confirmAndAnalyze === 'function') await confirmAndAnalyze();
            else if (typeof startMesh === 'function') startMesh();
        };
    }
}

// DOM Elements and State moved to top for survival.

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

    if (targetId === 'screen-preset-choice' && state.pendingAnalysis) {
        const grid = document.getElementById('preset-grid');
        if (grid && grid.children.length === 0) {
            const { scores } = state.pendingAnalysis;
            const top3 = scores.slice(0, 3)
                .map(s => ({ preset: PRESETS_DB.find(p => p.preset_id === s.preset_id), score: s.score }))
                .filter(item => item.preset);
            showPresetChoiceScreen(top3);
        }
    }
}

// Navigation initialized in DOMContentLoaded.

async function shareResults() {
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
        alert(t('alert.share.not.supported'));
    }
}

function purchasePremium() {
    window.location.href = CONFIG.STRIPE_PAYMENT_LINK;
}

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

function handleFileUpload(e) {
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
            inputImage.onload = null;
            initCropper(inputImage);
            // Debug: démarrage du maillage
            console.log('Démarrage du maillage lancé');
            if (typeof startMesh === 'function') startMesh();
            inputVideo.classList.add('hidden');
            btnCapture.classList.add('hidden');
            btnAnalyzeUpload.classList.add('hidden');
            reviewButtons.classList.remove('hidden');
            navigateTo('screen-scan');
        };

        inputImage.classList.remove('hidden');
        inputImage.removeAttribute('hidden');
        inputImage.src = dataUrl;
    };
    reader.readAsDataURL(file);
    fileUpload.value = '';
}

function startLiveScan() {
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
        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } });
                window.localStream = stream;
                inputVideo.srcObject = stream;
                inputVideo.muted = true;
                try { await inputVideo.play(); } catch (e) { console.error("Erreur play:", e); }
            } catch (error) {
                console.error("Erreur caméra:", error);
                if (error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
                    alert('Caméra bloquée, veuillez utiliser l\'importation de photo');
                } else {
                    alert('Impossible d\'accéder à la caméra. Vous pouvez charger une photo depuis l\'appareil.');
                }
            }
        })();
    } else {
        alert('Votre navigateur ne supporte pas la capture vidéo. Vous pouvez charger une photo depuis l\'appareil.');
    }
}

async function checkPhotoQuality(base64Image) {
    try {
        const response = await fetch(CONFIG.APPWRITE_ENDPOINT, {
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
function capturePhoto() {
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
        // Debug: démarrage du maillage
        console.log('Démarrage du maillage lancé');
        if (typeof startMesh === 'function') startMesh();
    };
    inputImage.src = dataUrl;
    inputImage.classList.remove('hidden');
    inputImage.removeAttribute('hidden');
    inputVideo.classList.add('hidden');
    btnCapture.classList.add('hidden');
    reviewButtons.classList.remove('hidden');
}

// Étape 1b : Reprendre — détruit le cropper, relance live ou retourne à l'accueil
function retakePhoto() {
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
}

async function confirmAndAnalyze() {
    console.log('Button Clicked: btnConfirmAnalyze');
    // Prefer using the original image source to avoid forced resizing/cropping artifacts.
    let imageDataUrl = null;
    if (inputImage && inputImage.src) {
        imageDataUrl = inputImage.src;
    } else if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas({ imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
        imageDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.95);
    }

    if (!imageDataUrl) return;

    capturedBase64 = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;

    if (cropper) { cropper.destroy(); cropper = null; }
    inputImage.classList.add('hidden');

    if (window.localStream) {
        window.localStream.getTracks().forEach(t => t.stop());
        window.localStream = null;
    }

    reviewButtons.classList.add('hidden');
    await runImageAnalysis(imageDataUrl, {
        onQualityFail: () => reviewButtons.classList.remove('hidden')
    });
}

async function analyzeUpload(source = inputImage.src) {
    console.log('Starting uploaded photo analysis');
    await runImageAnalysis(source);
}

async function runImageAnalysis(imageSource, options = {}) {
    if (!imageSource) return;

    loadingIndicator.classList.remove('hidden');

    const base64Image = imageSource.includes(',') ? imageSource.split(',')[1] : imageSource;
    const quality = await checkPhotoQuality(base64Image);
    if (!quality.ok) {
        loadingIndicator.classList.add('hidden');
        if (quality.reason === 'no_face') showQAWarning(t('qa.noface'));
        else if (quality.reason === 'too_blurry') showQAWarning(t('qa.blur'));
        else if (quality.reason === 'bad_lighting') showQAWarning(t('qa.light'));
        else if (quality.reason === 'bad_angle') showQAWarning(t('qa.angle'));
        if (typeof options.onQualityFail === 'function') options.onQualityFail(quality);
        return;
    }

    await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
            try {
                outputCanvas.width = img.naturalWidth;
                outputCanvas.height = img.naturalHeight;
                await faceMesh.send({ image: img });
                loadingIndicator.classList.add('hidden');
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = () => reject(new Error('Unable to load image for analysis.'));
        img.src = imageSource;
    }).catch((error) => {
        loadingIndicator.classList.add('hidden');
        console.error('Image analysis failed:', error);
        showQAWarning(t('alert.matching.failed'));
    });
}

// --- Results Callback ---
function onResults(results) {
    if (state.expertMeshPending) {
        handleExpertMeshResults(results);
        return;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    if (results.image) {
        canvasCtx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);
    }

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        if (state.scanMode === 'auto') {
            state.autoProcessing = true;
            state.autoLiveActive = false;
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
                window.localStream = null;
            }
        }

        const qa = checkCaptureQuality(landmarks, outputCanvas);
        if (!qa.ok) {
            loadingIndicator.classList.add('hidden');
            showQAWarning(qa.reason);
            
            if (typeof newScanProgress !== 'undefined') newScanProgress.classList.add('hidden');
            if (typeof laserLineNew !== 'undefined') laserLineNew.classList.add('hidden');
            if (typeof btnConfirmAnalyzeNew !== 'undefined') btnConfirmAnalyzeNew.disabled = false;
            if (typeof newScanActions !== 'undefined') newScanActions.classList.remove('hidden');
            canvasCtx.restore();
            return;
        }

        drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#00f0ff'});

        detectSkinToneFromCanvas(results.image, landmarks, async (skinTone, skinMeta) => {
          loadingIndicator.classList.add('hidden');
          const ratios = extractMorphRatios(landmarks);

          try {
            const azureData = await fetchBestPresetFromAzure(ratios, skinTone);
            console.log('Azure response received:', azureData);

            if (!azureData.success) {
                alert('Erreur Azure: ' + (azureData.error || 'Réponse invalide'));
                console.error('Azure error:', azureData.error);
                loadingIndicator.classList.add('hidden');
                return;
            }

            let top3Candidates = null;
            if (Array.isArray(azureData.top3)) {
                top3Candidates = azureData.top3;
            } else if (Array.isArray(azureData.players)) {
                top3Candidates = azureData.players;
            } else if (Array.isArray(azureData.presets)) {
                top3Candidates = azureData.presets;
            }

            if (!top3Candidates || top3Candidates.length === 0) {
                alert(t('alert.matching.failed') + ' - Aucun résultat trouvé');
                loadingIndicator.classList.add('hidden');
                return;
            }

            const normalizedTop3 = top3Candidates.slice(0, 3).map((entry) => {
                const player = entry?.player ?? entry?.preset ?? entry;
                const presetId = player?.preset_id ?? player?.presetId ?? player?.id ?? null;
                const preset = PRESETS_DB.find((item) => item.preset_id === presetId) || player;
                const score = entry?.score ?? player?.score ?? 0;
                return { preset, score };
            }).filter((entry) => entry.preset && entry.preset.preset_id);

            if (normalizedTop3.length === 0) {
                alert(t('alert.matching.failed') + ' - Données invalides');
                loadingIndicator.classList.add('hidden');
                return;
            }

            state.pendingAnalysis = { landmarks, skinTone, skinMeta, scores: normalizedTop3.map((entry) => ({ preset_id: entry.preset.preset_id, score: entry.score })) };
            showPresetChoiceScreen(normalizedTop3);
          } catch (error) {
            console.error('Azure matching error:', error);
            showQAWarning(t('alert.matching.failed'));
          }
        });
    } else {
        loadingIndicator.classList.add('hidden');
        if (state.scanMode === 'auto' && state.autoLiveActive) {
            canvasCtx.restore();
            return;
        }
        const msg = t('qa.noface') || 'Aucun visage détecté. Réessaie.';
        if (typeof showQAWarning === 'function') {
            showQAWarning(msg);
        } else {
            alert(msg);
        }
        
        if (typeof newScanProgress !== 'undefined') newScanProgress.classList.add('hidden');
        if (typeof laserLineNew !== 'undefined') laserLineNew.classList.add('hidden');
        if (typeof btnConfirmAnalyzeNew !== 'undefined') btnConfirmAnalyzeNew.disabled = false;
        if (typeof newScanActions !== 'undefined') newScanActions.classList.remove('hidden');
    }
    canvasCtx.restore();
}

// ─── PRESET CHOICE SCREEN ──────────────────────────────────────
function getPresetImageSrc(player) {
    const presetId = player?.preset_id ?? player?.presetId ?? player?.id ?? null;
    if (presetId != null && presetId !== '') {
        return `assets/presets/${presetId}.png`;
    }

    const fallbackName = (player?.name ?? player?.label ?? player?.preset_name ?? '').toString().trim();
    if (fallbackName) {
        const safeName = fallbackName.replace(/[^a-z0-9_-]+/gi, '_');
        return `assets/presets/${safeName}.png`;
    }

    return 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22 viewBox=%220 0 400 500%22%3E%3Crect width=%22400%22 height=%22500%22 fill=%22%23161a1f%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23a0aab2%22 font-family=%22Arial%2Csans-serif%22 font-size=%2220%22%3EImage indisponible%3C/text%3E%3C/svg%3E';
}

function showPresetChoiceScreen(top3) {
    const grid = document.getElementById('preset-grid');
    state.pendingTop3 = top3;
    grid.innerHTML = '';

    top3.forEach((entry) => {
        const player = entry?.player ?? entry?.preset ?? entry;
        const presetId = player?.preset_id ?? player?.presetId ?? player?.id ?? null;
        const playerName = player?.name ?? player?.label ?? player?.preset_name ?? `Preset ${presetId ?? ''}`;
        const scoreValue = Number(entry?.score ?? player?.score ?? 0);
        const scorePercent = Number.isFinite(scoreValue) ? Math.max(0, Math.min(100, Math.round(scoreValue))) : 0;
        const imageSrc = getPresetImageSrc(player);
        const card = document.createElement('div');
        card.className = 'preset-choice-card';
        card.innerHTML = `
            <img src="${imageSrc}"
                 alt="${playerName}"
                 loading="lazy"
                 decoding="async"
                 onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22 viewBox=%220 0 400 500%22%3E%3Crect width=%22400%22 height=%22500%22 fill=%22%23161a1f%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23a0aab2%22 font-family=%22Arial%2Csans-serif%22 font-size=%2220%22%3EImage indisponible%3C/text%3E%3C/svg%3E';this.style.opacity='0.3'"
                 class="preset-choice-img">
        <div class="preset-choice-id">${playerName}</div>
            <div class="preset-choice-score">${scorePercent}%</div>
            <button class="preset-choice-btn" data-id="${presetId ?? ''}">${t('btn.choose')}</button>
        `;
        card.querySelector('.preset-choice-btn').addEventListener('click', () => {
            if (presetId != null) {
                selectPreset(presetId);
            }
        });
        grid.appendChild(card);
    });

    navigateTo('screen-preset-choice');
}

function selectPreset(presetId) {
    if (!state.pendingAnalysis) return;
    const { landmarks, skinTone, skinMeta, scores } = state.pendingAnalysis;
    const chosenPreset = PRESETS_DB.find(p => p.preset_id === presetId);
    if (!chosenPreset) return;

    state.results = analyzeWithPreset(landmarks, skinTone, chosenPreset, scores);
    state.results.skinMeta = skinMeta;
    navigateTo('screen-results');
};

// Analyze using a specific chosen preset (bypasses auto-selection)
function analyzeWithPreset(landmarks, skinTone, chosenPreset, allScores) {
    const ratios = extractMorphRatios(landmarks);
    const faceShape = classifyFaceShape(ratios);
    const chosenScore = allScores.find(s => s.preset_id === chosenPreset.preset_id)?.score ?? 0;

    // Prépare userAttr pour le Frankenstein mix
    let userAttr = calculateMixAttributes(landmarks);
    userAttr = augmentAttributesWithCustomMetrics(landmarks, userAttr);

    const zoneMix = computeZoneMix(userAttr, chosenPreset, PRESETS_DB);
    const adjustments = computeAdjustments(ratios, chosenPreset, zoneMix);

    const result = {
        preset: {
            id: chosenPreset.preset_id,
            position: chosenPreset.position,
            label: `Tête n°${chosenPreset.position} dans la grille FC26`,
            couleur_peau: chosenPreset.couleur_peau,
            forme_visage: chosenPreset.forme_visage,
            avance: chosenPreset.avance || null
        },
        skinTone,
        faceShape,
        score: chosenScore,
        ratios: userAttr,  // scanned_stats format pour compatibility avec Frankenstein
        detection: {
            skinTone,
            faceShape,
            presetSkinTone: chosenPreset.couleur_peau,
            presetFaceShape: chosenPreset.forme_visage,
            topScore: allScores[0]?.score ?? 0,
            top3: allScores.slice(0, 3),
            ratios: {
                noseToInterEye: ratios.noseToInterEye,
                jawToFaceRatio: ratios.jawToFaceRatio,
                cheekToFaceRatio: ratios.cheekToFaceRatio,
                mouthToFace: ratios.mouthToFace
            }
        },
        base_sliders: chosenPreset.faconner,
        adjustments,
        final_sliders: {}
    };

    for (const zone of Object.keys(chosenPreset.faconner)) {
        result.final_sliders[zone] = { ...chosenPreset.faconner[zone] };
        if (adjustments[zone]) {
            Object.assign(result.final_sliders[zone], adjustments[zone]);
        }
    }

    console.log("🎮 Résultat final (preset choisi) :", result);
    return result;
}

// ─── ZONE MIX — Rendu de la section "ÉTAPE 2 — Onglet Tête" ────
function renderZoneMix(zoneMix) {
  const mainPresetId = state.results?.preset?.id;

  const zones = [
    { key: 'front',    label: t('zone.front'),    sub: 'Frente' },
    { key: 'machoire', label: t('zone.machoire'), sub: 'Jaw' },
    { key: 'joues',    label: t('zone.joues'),    sub: 'Cheeks' },
    { key: 'menton',   label: t('zone.menton'),   sub: 'Chin' },
    { key: 'oreilles', label: t('zone.oreilles'), sub: 'Ears' },
    { key: 'cou',      label: t('zone.cou'),      sub: 'Neck' },
    { key: 'yeux',     label: t('zone.yeux'),     sub: 'Eyes' },
    { key: 'sourcils', label: t('zone.sourcils'), sub: 'Brows' },
    { key: 'nez',      label: t('zone.nez'),      sub: 'Nose' },
    { key: 'bouche',   label: t('zone.bouche'),   sub: 'Mouth' },
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
        <div style="font-family:'Outfit',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#00f0ff; font-size:0.9rem;">${t('step2.title')}</div>
        <div style="font-size:0.75rem; color:#666; margin-top:2px;">${t('step2.desc')}</div>
      </div>
    </div>
    <div style="padding:8px 0;">${rowsHtml}</div>
  `;

  return section;
}

function showMorphoConfirmation(detectedData, callback) {
    const jawRatio = detectedData.jawToFaceRatio ?? 0;
    const initialMachoire = jawRatio > 0.76 ? t('morph.jaw.large') : jawRatio > 0.65 ? t('morph.jaw.medium') : t('morph.jaw.fine');
    
    const nezRatio = detectedData.noseToInterEye ?? 0;
    const initialNez = nezRatio > 0.48 ? t('morph.nose.large') : t('morph.nose.medium');
    
    const boucheRatio = detectedData.mouthToFace ?? 0;
    const initialLevres = boucheRatio < 0.38 ? t('morph.lips.full') : t('morph.lips.fine');
    
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

    const lipsOptions = [t('morph.lips.fine'), t('morph.lips.medium'), t('morph.lips.full')];
    const noseOptions = [t('morph.nose.fine'), t('morph.nose.medium'), t('morph.nose.large')];
    const jawOptions = [t('morph.jaw.fine'), t('morph.jaw.medium'), t('morph.jaw.large')];

    modal.innerHTML = `
        <div style="
            background: #0a0a0c; border: 1px solid #00f0ff; border-radius: 12px;
            padding: 24px; width: 90%; max-width: 400px; box-shadow: 0 0 20px rgba(0,240,255,0.2);
        ">
            <h3 style="color: #00f0ff; margin-top: 0; margin-bottom: 20px; text-align: center; font-weight: 800; text-transform: uppercase;">
                ${t('morph.confirm.title')}
            </h3>
            
            ${makeGroup(t('morph.lips.question'), lipsOptions, initialLevres)}
            ${makeGroup(t('morph.nose.question'), noseOptions, initialNez)}
            ${makeGroup(t('morph.jaw.question'), jawOptions, initialMachoire)}

            <button id="btn-morpho-confirm" style="
                width: 100%; padding: 14px; background: #00f0ff; color: #0a0a0c;
                border: none; border-radius: 8px; font-weight: 800; font-size: 1.1rem;
                cursor: pointer; margin-top: 10px; text-transform: uppercase;
            ">${t('morph.confirm.btn')}</button>
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

    let headerHtml = `
        <div class="preset-header" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1)); border: 1px solid gold; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: gold; text-align: center;">
            <h2 style="margin-top:0; font-size:1.2rem;">${t('results.title')}</h2>
            <div class="preset-card">
                <p style="margin:5px 0;">${t('step1.title')}</p>
                <h3 style="margin:5px 0; font-size:1.5rem;">➡️ ${result.preset.label}</h3>
                <p style="margin:0; font-size:0.9rem; opacity:0.8;">Preset ID : ${result.preset.id}</p>
                <img src="app/assets/presets/${result.preset.id}.png" class="preset-preview-img" alt="Visage recommandé" onerror="this.style.display='none'">
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

    // Labels lisibles pour chaque clé — utiliser les traductions
    const keyLabels = {
      re: t('slider.re'), 
      bh: t('slider.bh'), 
      na: t('slider.na'),
      aa: t('slider.aa'), 
      ang: t('slider.ang'), 
      gd: t('slider.gd'),
      nr: t('slider.nr'), 
      nh: t('slider.nh'), 
      gp: t('slider.gp')
    };

    // Structure des zones avancées — base DNA par zone via zoneMix
    const advZones = [
      {
        label: t('adv.zone.head'), icon: '', basePresetId: craneP?.preset_id,
        subs: [
          { label: t('adv.crane.principal'), avanceKey: 'crane', noAdjust: true,
            data: craneP?.avance?.crane ? {
              re: craneP.avance.crane.re,
              bh: craneP.avance.crane.bh,
              na: craneP.avance.crane.na,
              aa: craneP.avance.crane.aa,
              gd: craneP.avance.crane.gd
            } : undefined
          },
          { label: t('adv.crane.couronne'), avanceKey: 'couronne', noAdjust: true,
            data: craneP?.avance?.couronne ? {
              re: craneP.avance.couronne.re,
              bh: craneP.avance.couronne.bh,
              aa: craneP.avance.couronne.aa,
              nr: craneP.avance.couronne.nr,
              gd: craneP.avance.couronne.gd
            } : undefined
          },
          { label: t('adv.crane.arriere'), avanceKey: 'arriere_crane', noAdjust: true,
            data: craneP?.avance?.arriere_crane ? {
              re: craneP.avance.arriere_crane.re,
              bh: craneP.avance.arriere_crane.bh,
              aa: craneP.avance.arriere_crane.aa,
              ang: craneP.avance.arriere_crane.ang,
              gd: craneP.avance.arriere_crane.gd
            } : undefined
          },
          { label: t('adv.crane.tempes'), avanceKey: 'tempes', noAdjust: true,
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
        label: t('adv.zone.front'), icon: '', basePresetId: frontP?.preset_id,
        subs: [
          { label: t('adv.front.sup'), avanceKey: 'front_sup', data: frontP?.avance?.front_sup },
          { label: t('adv.front.inf'), avanceKey: 'front_inf', data: frontP?.avance?.front_inf },
        ]
      },
      {
        label: t('adv.zone.brows'), icon: '', basePresetId: sourcilsP?.preset_id,
        subs: [
          { label: t('adv.sourcils.principal'),           avanceKey: 'sourcils',     data: sourcilsP?.avance?.sourcils },
          { label: t('adv.sourcils.centre'),    avanceKey: 'sourcils_ctr', data: sourcilsP?.avance?.sourcils_ctr },
          { label: t('adv.sourcils.ext'),  avanceKey: 'sourcils_ext', data: sourcilsP?.avance?.sourcils_ext },
        ]
      },
      {
        label: t('adv.zone.eyes'), icon: '', basePresetId: yeuxP?.preset_id,
        subs: [
          { label: t('adv.yeux.principal'),    avanceKey: 'yeux',    data: yeuxP?.avance?.yeux },
          { label: t('adv.yeux.orbites'), avanceKey: 'orbites', data: yeuxP?.avance?.orbites },
        ]
      },
      {
        label: t('adv.zone.nose'), icon: '', basePresetId: nezP?.preset_id,
        subs: [
          { label: t('adv.nez.principal'),    avanceKey: 'nez_adv',        data: nezP?.avance?.nez_adv },
          { label: t('adv.nez.arete.cotes'),      avanceKey: 'arete_cotes',    data: nezP?.avance?.arete_cotes },
          { label: t('adv.nez.arete.centre'),   avanceKey: 'arete_centrale', data: nezP?.avance?.arete_centrale },
          { label: t('adv.nez.arete.sup'), avanceKey: 'arete_sup',      data: nezP?.avance?.arete_sup },
        ]
      },
      {
        label: t('adv.zone.cheeks'), icon: '', basePresetId: jouesP?.preset_id,
        subs: [
          { label: t('adv.joues.principal'), avanceKey: 'joues_adv', data: jouesP?.avance?.joues_adv },
        ]
      },
      {
        label: t('adv.zone.mouth'), icon: '', basePresetId: boucheP?.preset_id,
        subs: [
          { label: t('adv.bouche.principal'),         avanceKey: 'bouche_adv', data: boucheP?.avance?.bouche_adv },
          { label: t('adv.bouche.ext'), avanceKey: 'bouche_ext', data: boucheP?.avance?.bouche_ext },
        ]
      },
      {
        label: t('adv.zone.chin'), icon: '', basePresetId: mentonP?.preset_id,
        subs: [
          { label: t('adv.menton.principal'),            avanceKey: 'menton_adv', data: mentonP?.avance?.menton_adv },
          { label: t('adv.menton.sup'), avanceKey: 'menton_sup', data: mentonP?.avance?.menton_sup },
        ]
      },
      {
        label: t('adv.zone.jaw'), icon: '', basePresetId: machoireP?.preset_id,
        subs: [
          { label: t('adv.machoire.principal'),   avanceKey: 'machoire_adv', data: machoireP?.avance?.machoire_adv },
          { label: t('adv.machoire.maxillaire'), avanceKey: 'maxillaire',   data: machoireP?.avance?.maxillaire },
          { label: t('adv.machoire.mandibule'),  avanceKey: 'mandibule',    data: machoireP?.avance?.mandibule },
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
          ${t('adv.title')}
        </div>
        <div style="font-size:0.75rem; color:#666; margin-top:2px;">
          ${t('adv.desc')}
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
          <span>${zone.label}${zoneModBadge}${baseLabel}</span>
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
  applyPremiumUnlockUI();
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
        btn.innerText = t('copied');
        btn.style.color = 'var(--success)';
        btn.style.borderColor = 'var(--success)';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 1500);
    });
};
// ==========================================
// NEW MODAL UI FLOW
// ==========================================
let newScanModal, inputVideoNew, inputImageNew, expertMeshCanvas, expertMeshMagnifier, btnConfirmAnalyzeNew, newScanProgress, progressPercentNew, progressBarFillNew, newScanActions, newResultContainer, laserLineNew, btnBackModal, btnCloseModal, btnMeshHelp, helpMeshModal, btnCloseHelpModal;

document.addEventListener('DOMContentLoaded', () => {
    // --- NEW MODAL DOM ASSIGNMENTS ---
    newScanModal = document.getElementById('new-scan-modal');
    inputVideoNew = document.getElementById('input-video-new');
    inputImageNew = document.getElementById('input-image-new');
    expertMeshCanvas = document.getElementById('expert-mesh-canvas');
    expertMeshMagnifier = document.getElementById('expert-mesh-magnifier');
    btnConfirmAnalyzeNew = document.getElementById('btn-confirm-analyze-new');
    newScanProgress = document.getElementById('new-scan-progress');
    progressPercentNew = document.getElementById('progress-percent-new');
    progressBarFillNew = document.getElementById('progress-bar-fill-new');
    newScanActions = document.getElementById('new-scan-actions');
    newResultContainer = document.getElementById('new-result-container');
    laserLineNew = document.getElementById('laser-line-new');
    btnBackModal = document.getElementById('btn-back-modal');
    btnCloseModal = document.getElementById('btn-close-modal');
    btnMeshHelp = document.getElementById('btn-mesh-help');
    helpMeshModal = document.getElementById('help-mesh-modal');
    btnCloseHelpModal = document.getElementById('btn-close-help-modal');

    if (btnBackModal) btnBackModal.addEventListener('click', window.handleBackAction);
    if (btnCloseModal) btnCloseModal.addEventListener('click', window.globalReset);
    if (btnMeshHelp) btnMeshHelp.addEventListener('click', openHelpMeshModal);
    if (btnCloseHelpModal) btnCloseHelpModal.addEventListener('click', closeHelpMeshModal);
    if (helpMeshModal) helpMeshModal.addEventListener('click', (e) => {
        if (e.target === helpMeshModal) closeHelpMeshModal();
    });
});

window.handleBackAction = function() {
    // Safety: if camera is currently active while backing out, stop it immediately
    if (window.localStream && inputVideoNew && !inputVideoNew.classList.contains('hidden')) {
        stopActiveCameraStream();
    }

    // 0. If the expert mesh has already been validated, go back to editing instead of exiting.
    const hasValidatedExpertMesh =
        state.scanMode === 'expert' &&
        state.manualMeshPoints &&
        Object.keys(state.manualMeshPoints).length > 0 &&
        newResultContainer &&
        newResultContainer.querySelector('#expert-recipe-card');

    if (hasValidatedExpertMesh) {
        restoreExpertMeshEditorView();
        return;
    }

    // 1. Check if we are in the Advanced Accordion view
    const advView = document.getElementById('advanced-shaping-view');
    if (advView && !advView.classList.contains('hidden')) {
        // Go back to Zone Mix view
        advView.classList.add('hidden');
        advView.style.display = 'none';
        document.getElementById('zone-mix-view').classList.remove('hidden');
        const headerTitle = document.querySelector('#new-scan-modal h2');
        if (headerTitle) headerTitle.innerText = "FAÇONNAGE AVANCÉ";
        return;
    }
    
    // 2. Check if we are in the Zone Mix view
    const zoneMixView = document.getElementById('zone-mix-view');
    if (zoneMixView && !zoneMixView.classList.contains('hidden')) {
        // Go back to Top 3 Matches
        if (inputImageNew) {
            if (typeof capturedBase64 !== 'undefined' && capturedBase64) {
                inputImageNew.src = 'data:image/jpeg;base64,' + capturedBase64;
            }
            inputImageNew.classList.add('mix-blend-luminosity', 'opacity-70');
        }
        const scanLabel = document.querySelector('#new-scan-modal .font-label-caps.text-primary-container');
        if (scanLabel) {
            scanLabel.innerText = 'SCANNING';
            scanLabel.style.color = '#00f0ff';
        }
        
        var faceGuide = document.getElementById('face-guide-overlay');
        if (faceGuide) { faceGuide.classList.remove('hidden'); faceGuide.style.display = ''; }
        document.querySelectorAll('.scan-corners').forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });
        
        if (typeof state !== 'undefined' && state.pendingTop3) {
            window.showPresetChoiceScreen(state.pendingTop3);
        }
        return;
    }
    
    // 3. Check if a photo is displayed but not yet analyzed (auto upload mode)
    if (inputImageNew && !inputImageNew.classList.contains('hidden') && inputImageNew.src && state.scanMode === 'auto' && !newResultContainer?.innerHTML?.includes('zone-mix-view')) {
        // Photo loaded but not analyzed yet - go back to upload mode choice
        closeUploadModeModal();
        openUploadModeModal();
        state.pendingUploadDataUrl = inputImageNew.src;
        return;
    }
    
    // 4. Check if upload mode modal is open
    if (uploadModeModal && !uploadModeModal.classList.contains('hidden')) {
        // Close upload modal and return to home screen
        resetCaptureUI();
        stopActiveCameraStream();
        closeUploadModeModal();
        navigateTo('screen-home');
        window.globalReset();
        return;
    }
    
    // Default: Close modal completely
    resetCaptureUI();
    stopActiveCameraStream();
    window.globalReset();
};

function restoreExpertMeshEditorView() {
    if (newResultContainer) newResultContainer.innerHTML = '';
    if (newScanActions) newScanActions.classList.remove('hidden');
    if (newScanProgress) newScanProgress.classList.add('hidden');
    if (laserLineNew) laserLineNew.classList.add('hidden');
    if (btnConfirmAnalyzeNew) {
        btnConfirmAnalyzeNew.disabled = false;
        btnConfirmAnalyzeNew.innerHTML = `<span class="material-symbols-outlined text-[16px]">check</span> ${t('btn.mesh.validate')}`;
        btnConfirmAnalyzeNew.onclick = validateManualMeshAndAnalyze;
    }

    if (expertMeshCanvas) {
        expertMeshCanvas.style.pointerEvents = '';
        expertMeshCanvas.classList.remove('hidden');
        syncExpertMeshCanvasAndRedraw();
    }

    if (expertMeshMagnifier) expertMeshMagnifier.classList.add('hidden');
    state.draggingExpertPoint = null;
    state.expertMeshAttributes = null;
    setModalScanChrome('screen.scan.title');
}

window.globalReset = function() {
    if (newScanModal) newScanModal.classList.add('hidden');
    closeUploadModeModal();
    clearManualMesh();
    state.autoLiveActive = false;
    state.autoProcessing = false;
    state.scanMode = 'auto';
    state.pendingUploadDataUrl = null;
    state.expertImageDataUrl = null;
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }
    if (cropper) { cropper.destroy(); cropper = null; }
    if(canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    if (newResultContainer) newResultContainer.innerHTML = '';
    if (newScanProgress) newScanProgress.classList.add('hidden');
    var faceGuide = document.getElementById('face-guide-overlay');
    if (faceGuide) { faceGuide.classList.remove('hidden'); faceGuide.style.display = ''; }
    document.querySelectorAll('.scan-corners').forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });

    // Restore hint text for standard mode
    const hintEl = document.querySelector('.face-guide-hint');
    if (hintEl) {
        hintEl.innerText = 'Place ton visage dans l\'ovale';
    }
    if (inputImageNew) {
        inputImageNew.classList.add('mix-blend-luminosity', 'opacity-70');
    }
    if (laserLineNew) laserLineNew.classList.add('hidden');
    if (newProgressInterval) clearInterval(newProgressInterval);
    if (progressPercentNew) progressPercentNew.innerText = '0%';
    if (progressBarFillNew) progressBarFillNew.style.width = '0%';
    if (btnConfirmAnalyzeNew) btnConfirmAnalyzeNew.disabled = false;
    if (newScanActions) newScanActions.classList.remove('hidden');
    
    // Hide advanced container if it exists
    const adv = document.getElementById('new-advanced-container');
    if (adv) adv.classList.add('hidden');
};

function setModalScanChrome(labelKey = 'screen.scan.title') {
    const scanLabel = document.querySelector('#new-scan-modal .font-label-caps.text-primary-container');
    if (scanLabel) {
        scanLabel.innerText = t(labelKey);
        scanLabel.style.color = '#00f0ff';
    }
}

function stopActiveCameraStream() {
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }
}

function resetCaptureUI() {
    // Capture CTA (CAPTURER / VALIDER ET ANALYSER)
    if (btnConfirmAnalyzeNew) {
        btnConfirmAnalyzeNew.classList.add('hidden');
        btnConfirmAnalyzeNew.style.display = 'none';
        btnConfirmAnalyzeNew.disabled = false;
        btnConfirmAnalyzeNew.innerHTML = `<span class="material-symbols-outlined text-[16px]">camera</span> ${t('btn.capture.still') || 'PRENDRE LA PHOTO'}`;
    }

    // Camera controls container + progress UI
    if (newScanActions) newScanActions.classList.add('hidden');
    if (newScanProgress) newScanProgress.classList.add('hidden');
    if (laserLineNew) laserLineNew.classList.add('hidden');

    // CONFIRMER / REPRENDRE buttons in auto review flow
    const autoReviewContainer = document.getElementById('auto-review-buttons');
    if (autoReviewContainer) autoReviewContainer.style.display = 'none';
    const btnAutoConfirm = document.getElementById('btn-auto-confirm');
    const btnAutoRetake = document.getElementById('btn-auto-retake');
    if (btnAutoConfirm) {
        btnAutoConfirm.classList.add('hidden');
        btnAutoConfirm.style.display = 'none';
    }
    if (btnAutoRetake) {
        btnAutoRetake.classList.add('hidden');
        btnAutoRetake.style.display = 'none';
    }

    // Legacy camera review buttons (if present)
    const btnRetakeLegacy = document.getElementById('btn-retake');
    const btnConfirmLegacy = document.getElementById('btn-confirm-analyze');
    const btnCaptureLegacy = document.getElementById('btn-capture');
    if (btnRetakeLegacy) btnRetakeLegacy.classList.add('hidden');
    if (btnConfirmLegacy) btnConfirmLegacy.classList.add('hidden');
    if (btnCaptureLegacy) btnCaptureLegacy.classList.add('hidden');

    // Instruction text
    document.querySelectorAll('.face-guide-hint').forEach(h => {
        h.classList.add('hidden');
        h.style.display = 'none';
    });
}

function prepareNewScanModal() {
    newScanModal.classList.remove('hidden');
    newScanActions.classList.remove('hidden');
    newScanProgress.classList.add('hidden');
    laserLineNew.classList.add('hidden');
    newResultContainer.innerHTML = '';
    clearManualMesh();
    if (newProgressInterval) clearInterval(newProgressInterval);
    if (progressPercentNew) progressPercentNew.innerText = '0%';
    if (progressBarFillNew) progressBarFillNew.style.width = '0%';
    if (btnConfirmAnalyzeNew) btnConfirmAnalyzeNew.disabled = false;
    setModalScanChrome();
}

async function startCameraStream() {
    if (!navigator.mediaDevices?.getUserMedia) {
        alert(t("alert.camera.not.supported"));
        return null;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    inputVideoNew.srcObject = stream;
    window.localStream = stream;
    await inputVideoNew.play().catch(() => {});
    return stream;
}

async function autoLiveDetectionLoop() {
    // Passive loop: just keep video stream active, no MediaPipe analysis yet
    // Analysis will be triggered manually when user clicks PRENDRE LA PHOTO
    if (!state.autoLiveActive || !inputVideoNew || inputVideoNew.readyState < 2) {
        return;
    }
    // Video continues to play; analysis deferred to manual capture + confirmAndAnalyzeNew
    if (state.autoLiveActive) {
        requestAnimationFrame(autoLiveDetectionLoop);
    }
}

window.startAutoLiveScan = async function() {
    resetCaptureUI();
    prepareNewScanModal();
    state.scanMode = 'auto';
    state.autoLiveActive = true;
    state.autoProcessing = false;
    capturedBase64 = null;
    capturedCanvas = null;
    if (cropper) { cropper.destroy(); cropper = null; }
    if(canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    inputImageNew.classList.add('hidden');
    inputVideoNew.classList.remove('hidden');
    inputVideoNew.style.display = 'block';
    
    // Passive capture: hide progress/laser initially, show capture button instead
    newScanActions.classList.remove('hidden');
    newScanProgress.classList.add('hidden');
    laserLineNew.classList.add('hidden');
    
    // Configure capture button for auto mode
    btnConfirmAnalyzeNew.innerHTML = `<span class="material-symbols-outlined text-[16px]">camera</span> ${t('btn.capture.still') || 'PRENDRE LA PHOTO'}`;
    btnConfirmAnalyzeNew.onclick = capturePhotoAuto;
    btnConfirmAnalyzeNew.disabled = false;
    btnConfirmAnalyzeNew.classList.remove('hidden');
    btnConfirmAnalyzeNew.style.display = '';

    // Show overlay for standard mode (face guide + corners)
    var faceGuide = document.getElementById('face-guide-overlay');
    if (faceGuide) { faceGuide.classList.remove('hidden'); faceGuide.style.display = ''; }
    document.querySelectorAll('.scan-corners').forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });
    document.querySelectorAll('.face-guide-hint').forEach(h => { h.classList.remove('hidden'); h.style.display = ''; });

    try {
        await startCameraStream();
        requestAnimationFrame(autoLiveDetectionLoop);
    } catch (error) {
        console.error("Camera error:", error);
        state.autoLiveActive = false;
        alert(t('alert.camera.permission'));
    }
};

// Auto mode: capture still frame (no mesh points), review, then analyze
function capturePhotoAuto() {
    if (!window.localStream) return;
    
    // Simulate CSS object-fit: cover so the captured pixels match the visible frame
    const videoRect = inputVideoNew.getBoundingClientRect();
    const containerRatio = videoRect.width / videoRect.height;
    const videoRatio = inputVideoNew.videoWidth / inputVideoNew.videoHeight;

    let cropWidth = inputVideoNew.videoWidth;
    let cropHeight = inputVideoNew.videoHeight;
    let startX = 0;
    let startY = 0;

    if (videoRatio > containerRatio) {
        // Video is wider than the frame: crop left/right
        cropWidth = inputVideoNew.videoHeight * containerRatio;
        startX = (inputVideoNew.videoWidth - cropWidth) / 2;
    } else {
        // Video is taller than the frame: crop top/bottom
        cropHeight = inputVideoNew.videoWidth / containerRatio;
        startY = (inputVideoNew.videoHeight - cropHeight) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');
    // Mirror flip for front camera, while drawing only the visible portion
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(inputVideoNew, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    // Stop video stream
    window.localStream.getTracks().forEach(track => track.stop());
    window.localStream = null;
    inputVideoNew.classList.add('hidden');
    
    // Display frozen frame for review
    inputImageNew.onload = () => {
        inputImageNew.onload = null;
        showAutoReviewButtons(dataUrl);
    };
    inputImageNew.src = dataUrl;
    inputImageNew.classList.remove('hidden');
    inputImageNew.style.objectFit = 'cover';
    inputImageNew.style.display = 'block';
    // Remove any visual filters - display true colors
    inputImageNew.classList.remove('mix-blend-luminosity', 'opacity-70', 'grayscale');
    
    state.autoLiveActive = false;
}

function showAutoReviewButtons(dataUrl) {
    // Hide capture button and progress
    btnConfirmAnalyzeNew.classList.add('hidden');
    btnConfirmAnalyzeNew.style.display = 'none';
    newScanActions.classList.add('hidden');
    
    // Hide face guide overlay and hint, but keep scan corners visible for framing
    var faceGuide = document.getElementById('face-guide-overlay');
    if (faceGuide) { faceGuide.classList.add('hidden'); faceGuide.style.display = 'none'; }
    document.querySelectorAll('.face-guide-hint').forEach(h => { h.classList.add('hidden'); h.style.display = 'none'; });
    document.querySelectorAll('.scan-corners').forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });
    
    // Create or update review button container if needed
    let reviewContainer = document.getElementById('auto-review-buttons');
    if (!reviewContainer) {
        reviewContainer = document.createElement('div');
        reviewContainer.id = 'auto-review-buttons';
        reviewContainer.style.cssText = 'display:flex; gap:12px; justify-content:center; margin-top:16px;';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.id = 'btn-auto-confirm';
        confirmBtn.style.cssText = 'flex:1; padding:14px 20px; background:#00f0ff; color:#0a0a0c; border:none; border-radius:8px; font-weight:700; font-size:0.95rem; text-transform:uppercase; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:background 0.2s;';
        confirmBtn.innerHTML = `<span class="material-symbols-outlined">check</span> CONFIRMER`;
        confirmBtn.onclick = () => window.confirmAndAnalyzeNew(dataUrl);
        
        const retakeBtn = document.createElement('button');
        retakeBtn.id = 'btn-auto-retake';
        retakeBtn.style.cssText = 'flex:1; padding:14px 20px; background:transparent; color:#00f0ff; border:1px solid #00f0ff; border-radius:8px; font-weight:700; font-size:0.95rem; text-transform:uppercase; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s;';
        retakeBtn.innerHTML = `<span class="material-symbols-outlined">refresh</span> REPRENDRE`;
        retakeBtn.onclick = retakeAutoPhoto;
        
        reviewContainer.appendChild(confirmBtn);
        reviewContainer.appendChild(retakeBtn);
        
        // Append after the modal content or before the actions area
        const modalContent = document.querySelector('#new-scan-modal .flex.flex-col');
        if (modalContent) {
            modalContent.appendChild(reviewContainer);
        }
    } else {
        // Update onclick handlers with new dataUrl
        const confirmBtn = document.getElementById('btn-auto-confirm');
        if (confirmBtn) confirmBtn.onclick = () => window.confirmAndAnalyzeNew(dataUrl);
        reviewContainer.style.display = 'flex';
    }
}

function retakeAutoPhoto() {
    // Clear review buttons
    const reviewContainer = document.getElementById('auto-review-buttons');
    if (reviewContainer) reviewContainer.style.display = 'none';
    
    // Hide frozen image
    inputImageNew.classList.add('hidden');
    inputImageNew.src = '';
    
    // Clear progress
    if (newScanProgress) newScanProgress.classList.add('hidden');
    if (laserLineNew) laserLineNew.classList.add('hidden');
    if (progressPercentNew) progressPercentNew.innerText = '0%';
    if (progressBarFillNew) progressBarFillNew.style.width = '0%';
    
    // Restart video and capture button
    state.autoLiveActive = true;
    state.autoProcessing = false;
    inputVideoNew.classList.remove('hidden');
    inputVideoNew.style.display = 'block';
    
    // Show capture button again
    btnConfirmAnalyzeNew.innerHTML = `<span class="material-symbols-outlined text-[16px]">camera</span> ${t('btn.capture.still') || 'PRENDRE LA PHOTO'}`;
    btnConfirmAnalyzeNew.onclick = capturePhotoAuto;
    btnConfirmAnalyzeNew.disabled = false;
    btnConfirmAnalyzeNew.classList.remove('hidden');
    btnConfirmAnalyzeNew.style.display = '';
    newScanActions.classList.remove('hidden');
    
    // Show face guide again
    var faceGuide = document.getElementById('face-guide-overlay');
    if (faceGuide) { faceGuide.classList.remove('hidden'); faceGuide.style.display = ''; }
    document.querySelectorAll('.scan-corners').forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });
    document.querySelectorAll('.face-guide-hint').forEach(h => { h.classList.remove('hidden'); h.style.display = ''; });
    
    // Restart camera
    (async () => {
        try {
            await startCameraStream();
            requestAnimationFrame(autoLiveDetectionLoop);
        } catch (error) {
            console.error("Camera error on retake:", error);
            state.autoLiveActive = false;
            alert(t('alert.camera.permission'));
        }
    })();
}

// Expert flow: capture a still frame, place 12 points, then validate analysis.
window.startExpertScan = async function() {
    resetCaptureUI();
    prepareNewScanModal();
    state.scanMode = 'expert';
    state.autoLiveActive = false;
    state.autoProcessing = false;
    newScanModal.classList.remove('hidden');
    newScanActions.classList.remove('hidden');
    newScanProgress.classList.add('hidden');
    laserLineNew.classList.add('hidden');
    newResultContainer.innerHTML = '';
    
    inputVideoNew.classList.remove('hidden');
    inputVideoNew.style.display = 'block';
    inputImageNew.classList.add('hidden');

    capturedBase64 = null;
    capturedCanvas = null;
    if (cropper) { cropper.destroy(); cropper = null; }
    if(canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Show face guide and hint at expert camera start; keep corners visible
    var faceGuide = document.getElementById('face-guide-overlay');
    if (faceGuide) { faceGuide.classList.remove('hidden'); faceGuide.style.display = ''; }
    document.querySelectorAll('.face-guide-hint').forEach(h => { h.classList.remove('hidden'); h.style.display = ''; });
    document.querySelectorAll('.scan-corners').forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });

    // Update instruction hint for expert mode
    const hintEl = document.querySelector('.face-guide-hint');
    if (hintEl) {
        hintEl.innerText = t('mode.expert.capture.hint');
    }

    try {
        await startCameraStream();
        if (btnConfirmAnalyzeNew) {
            btnConfirmAnalyzeNew.classList.remove('hidden');
            btnConfirmAnalyzeNew.style.display = '';
            btnConfirmAnalyzeNew.disabled = false;
        }
        btnConfirmAnalyzeNew.innerHTML = `<span class="material-symbols-outlined text-[16px]">camera</span> ${t('btn.capture.still')}`;
        btnConfirmAnalyzeNew.onclick = capturePhotoNew;
    } catch (error) {
        console.error("Camera error:", error);
        alert(t('alert.camera.permission'));
    }
};

window.startLiveScan = window.startAutoLiveScan;

function capturePhotoNew() {
    if (!window.localStream) return;
    
    // Simulate CSS object-fit: cover so the captured pixels match the visible frame
    const videoRect = inputVideoNew.getBoundingClientRect();
    const containerRatio = videoRect.width / videoRect.height;
    const videoRatio = inputVideoNew.videoWidth / inputVideoNew.videoHeight;

    let cropWidth = inputVideoNew.videoWidth;
    let cropHeight = inputVideoNew.videoHeight;
    let startX = 0;
    let startY = 0;

    if (videoRatio > containerRatio) {
        // Video is wider than the frame: crop left/right
        cropWidth = inputVideoNew.videoHeight * containerRatio;
        startX = (inputVideoNew.videoWidth - cropWidth) / 2;
    } else {
        // Video is taller than the frame: crop top/bottom
        cropHeight = inputVideoNew.videoWidth / containerRatio;
        startY = (inputVideoNew.videoHeight - cropHeight) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(inputVideoNew, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    window.localStream.getTracks().forEach(track => track.stop());
    window.localStream = null;
    inputVideoNew.classList.add('hidden');
    
    inputImageNew.onload = () => {
        inputImageNew.onload = null;
        startExpertMeshInitialization(dataUrl);
    };
    inputImageNew.src = dataUrl;
    inputImageNew.classList.remove('hidden');
    
    state.expertImageDataUrl = dataUrl;
    btnConfirmAnalyzeNew.innerHTML = `<span class="material-symbols-outlined text-[16px]">check</span> ${t('btn.mesh.validate')}`;
    btnConfirmAnalyzeNew.onclick = validateManualMeshAndAnalyze;
}

// Override handleFileUpload
window.handleFileUpload = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    capturedBase64 = null;
    capturedCanvas = null;
    if (cropper) { cropper.destroy(); cropper = null; }
    if(canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    const reader = new FileReader();
    reader.onload = (event) => {
        state.pendingUploadDataUrl = event.target.result;
        openUploadModeModal();
    };
    reader.readAsDataURL(file);
    fileUpload.value = '';
};

function openUploadModeModal() {
    if (uploadModeModal) uploadModeModal.classList.remove('hidden');
}

function closeUploadModeModal() {
    if (uploadModeModal) uploadModeModal.classList.add('hidden');
}

window.chooseUploadedMode = function(mode) {
    if (!state.pendingUploadDataUrl) return;
    closeUploadModeModal();
    prepareUploadedImage(mode, state.pendingUploadDataUrl);
};

function prepareUploadedImage(mode, dataUrl) {
    resetCaptureUI();
    prepareNewScanModal();
    state.scanMode = mode === 'expert' ? 'expert' : 'auto';
    state.autoLiveActive = false;
    state.autoProcessing = false;
    state.expertImageDataUrl = dataUrl;
    stopActiveCameraStream();
    inputVideoNew.classList.add('hidden');
    inputVideoNew.style.display = 'none';

    // Upload flow must not show camera-specific review controls
    const autoReviewContainer = document.getElementById('auto-review-buttons');
    if (autoReviewContainer) autoReviewContainer.style.display = 'none';
    const btnAutoConfirm = document.getElementById('btn-auto-confirm');
    const btnAutoRetake = document.getElementById('btn-auto-retake');
    if (btnAutoConfirm) { btnAutoConfirm.classList.add('hidden'); btnAutoConfirm.style.display = 'none'; }
    if (btnAutoRetake) { btnAutoRetake.classList.add('hidden'); btnAutoRetake.style.display = 'none'; }
    
    inputImageNew.onload = () => {
        inputImageNew.onload = null;
        // Hide central face guide overlay and instruction hint when an uploaded image is shown
        var _fg = document.getElementById('face-guide-overlay');
        if (_fg) { _fg.classList.add('hidden'); _fg.style.display = 'none'; }
        document.querySelectorAll('.face-guide-hint').forEach(h => { h.classList.add('hidden'); h.style.display = 'none'; });
        // Ensure scan corners remain visible
        document.querySelectorAll('.scan-corners').forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });
        if (state.scanMode === 'expert') {
            startExpertMeshInitialization(dataUrl);
            btnConfirmAnalyzeNew.innerHTML = `<span class="material-symbols-outlined text-[16px]">check</span> ${t('btn.mesh.validate')}`;
            btnConfirmAnalyzeNew.onclick = validateManualMeshAndAnalyze;
        } else {
            // Mode automatique : ne pas instancier Cropper, conserver l'image telle quelle
            if (cropper) { cropper.destroy(); cropper = null; }
            inputImageNew.style.objectFit = 'cover';
            inputImageNew.style.display = 'block';
            // Remove any CSS filters/blends - display image in real colors
            inputImageNew.classList.remove('mix-blend-luminosity', 'opacity-70', 'grayscale');
            btnConfirmAnalyzeNew.innerHTML = `<span class="material-symbols-outlined text-[16px]">bolt</span> ${t('upload.mode.auto')}`;
            btnConfirmAnalyzeNew.disabled = false;
            btnConfirmAnalyzeNew.classList.remove('hidden');
            btnConfirmAnalyzeNew.style.display = '';
            btnConfirmAnalyzeNew.onclick = function() {
                // Envoi direct de l'image source à l'analyse sans recadrage ni redimensionnement
                window.confirmAndAnalyzeNew(dataUrl);
            };
        }
    };
    inputImageNew.src = dataUrl;
    inputImageNew.classList.remove('hidden');
    inputImageNew.removeAttribute('hidden');
}

function clearManualMesh() {
    const overlay = document.getElementById('manual-mesh-overlay');
    if (overlay) overlay.remove();
    state.manualMeshPoints = {};
    state.initialMeshPoints = {};
    state.movedExpertPoints = new Set();
    state.expertMeshPending = false;
    state.expertMeshImage = null;
    state.expertFullLandmarks = null;
    closeHelpMeshModal();
    updateHelpButtonVisibility();
    if (expertMeshCanvas) {
        const ctx = expertMeshCanvas.getContext('2d');
        ctx?.clearRect(0, 0, expertMeshCanvas.width, expertMeshCanvas.height);
        expertMeshCanvas.style.pointerEvents = '';
        expertMeshCanvas.classList.add('hidden');
    }
    if (expertMeshMagnifier) {
        const ctx = expertMeshMagnifier.getContext('2d');
        ctx?.clearRect(0, 0, expertMeshMagnifier.width, expertMeshMagnifier.height);
        expertMeshMagnifier.classList.add('hidden');
    }
}

// Zones anatomiques avec indices MediaPipe + règles de connexion
// Masque anatomique — ovale 10 pts, yeux 4 pts + pupille réticule, narines indépendantes
const EXPERT_ANATOMY = [
    {
        key: 'face_oval',
        // Ovale fermé : temple G → joue G → mâchoire G → menton → mâchoire D → joue D → temple D → ligne cheveux
        indices: [21, 234, 172, 149, 152, 378, 397, 454, 251, 10],
        closed: true,
    },
    {
        key: 'left_brow',
        // Sourcil G — boucle fermée (bord inf ext→int + bord sup int→ext)
        indices: [46, 53, 52, 65, 55, 107, 66, 105, 63, 70],
        closed: true,
    },
    {
        key: 'right_brow',
        // Sourcil D — boucle fermée
        indices: [276, 283, 282, 295, 285, 336, 296, 334, 293, 300],
        closed: true,
    },
    {
        key: 'left_eye',
        // Oeil G — amande 4 pts : coin ext → paupière sup → coin int → paupière inf
        indices: [33, 159, 133, 145],
        closed: true,
    },
    {
        key: 'left_pupil',
        // Pupille G — point isolé (iris MediaPipe refineLandmarks)
        indices: [468],
        isolated: true,
    },
    {
        key: 'right_eye',
        // Oeil D — amande 4 pts
        indices: [263, 386, 362, 374],
        closed: true,
    },
    {
        key: 'right_pupil',
        // Pupille D — point isolé
        indices: [473],
        isolated: true,
    },
    {
        key: 'nose_structure',
        // Mapping MediaPipe demandé pour le nez
        // [6=sommet, 236=auvent G, 294=aile G, 238=narine interne G, 75=narine externe G, 237=narine sommet G, 457=narine sommet D, 458=narine interne D, 305=narine externe D, 64=aile D, 456=auvent D]
        indices: [6, 456, 294, 305, 309, 457, 458, 238, 237, 75, 64, 236, 79],
        isNoseComponent: true,
        closed: false,
    },
    {
        key: 'mouth',
        // Contour complet : coin G → lèvre sup → coin D → lèvre inf
        indices: [61, 40, 37, 0, 267, 270, 291, 321, 314, 17, 84, 91],
        closed: true,
    },
];

// Table de correspondance nom sémantique → index MediaPipe (pour calculateMixAttributes)
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

const CALIBRATION_POINT_NAMES = {
    // Face / contour
    '10':  'front_haut',
    '21':  'front_gauche',
    '251': 'front_droite',
    '172': 'mâchoire_gauche',
    '397': 'mâchoire_droite',
    '152': 'menton',
    '234': 'pommete_gauche',
    '454': 'pomette_droite',
    '254': 'pomette_droite',

    // Brows
    '105': 'sourcil_gauche_sommet',
    '334': 'sourcil_droit_sommet',

    // Eyes
    '33':  'oeil_gauche_exterieur',
    '159': 'oeil_gauche_haut',
    '133': 'oeil_gauche_interieur',
    '145': 'oeil_gauche_bas',
    '263': 'oeil_droit_exterieur',
    '386': 'oeil_droit_haut',
    '362': 'oeil_droit_interieur',
    '374': 'oeil_droit_bas',

    // Nose
    '6':   'nez_sommet_haut',
    '236': 'nez_auvent_gauche',
    '456': 'nez_auvent_droit',
    '294': 'nez_aile_gauche',
    '64':  'nez_aile_droite',
    '238': 'narine_interne_gauche',
    '458': 'narine_interne_droite',
    '75':  'narine_externe_gauche',
    '305': 'narine_externe_droite',
    '237': 'narine_sommet_gauche',
    '457': 'narine_sommet_droit',
    '79':  'narine_sommet_gauche_2',
    '309': 'narine_sommet_droite_2',

    // Mouth
    '103': 'pommette_interne_gauche / inner_zygomatic_left',
    '332': 'pommette_externe_droite / outer_zygomatic_right',
    '112': 'joue_sup_externe_gauche / upper_outer_cheek_left',
    '435': 'joue_sup_externe_droite / upper_outer_cheek_right',
    '61':  'bouche_gauche',
    '40':  'bouche_haut_gauche',
    '37':  'bouche_haut',
    '0':   'bouche_centre_haut',
    '267': 'bouche_centre_droit',
    '270': 'bouche_haut_droit',
    '291': 'bouche_droite',
    '321': 'bouche_bas_droit',
    '314': 'bouche_bas_centre_droit',
    '17':  'bouche_bas',
    '84':  'bouche_bas_gauche',
    '91':  'bouche_bas_centre_gauche',
};

function getCalibrationPointName(key) {
    return CALIBRATION_POINT_NAMES[String(key)] || `point_${key}`;
}


function startExpertMeshInitialization(dataUrl) {
    if (cropper) { cropper.destroy(); cropper = null; }
    state.scanMode = 'expert';
    state.expertImageDataUrl = dataUrl;
    state.expertMeshPending = true;
    state.manualMeshPoints = {};
    inputImageNew.classList.remove('mix-blend-luminosity', 'opacity-70');
    inputImageNew.style.objectFit = 'cover';
    inputImageNew.style.display = 'block';
    // Hide central face guide overlay and instruction hint, but keep scan corners visible
    var _fg = document.getElementById('face-guide-overlay');
    if (_fg) { _fg.classList.add('hidden'); _fg.style.display = 'none'; }
    document.querySelectorAll('.face-guide-hint').forEach(h => { h.classList.add('hidden'); h.style.display = 'none'; });
    document.querySelectorAll('.scan-corners').forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });
    if (newScanProgress) newScanProgress.classList.remove('hidden');
    if (progressPercentNew) progressPercentNew.innerText = '0%';
    if (progressBarFillNew) progressBarFillNew.style.width = '20%';
    btnConfirmAnalyzeNew.disabled = true;

    const img = new Image();
    img.onload = async () => {
        state.expertMeshImage = img;
        positionExpertMeshCanvas();
        try {
            await faceMesh.send({ image: img });
        } catch (error) {
            state.expertMeshPending = false;
            btnConfirmAnalyzeNew.disabled = false;
            console.error('Expert mesh init failed:', error);
            alert(t('alert.no.face'));
        }
    };
    img.onerror = () => {
        state.expertMeshPending = false;
        btnConfirmAnalyzeNew.disabled = false;
        alert(t('alert.matching.failed'));
    };
    img.src = dataUrl;
}

function handleExpertMeshResults(results) {
    state.expertMeshPending = false;
    if (newScanProgress) newScanProgress.classList.add('hidden');
    // Guarantee the oval stays hidden during editing, keep corners visible
    var _fg = document.getElementById('face-guide-overlay');
    if (_fg) { _fg.classList.add('hidden'); _fg.style.display = 'none'; }
    document.querySelectorAll('.face-guide-hint').forEach(h => { h.classList.add('hidden'); h.style.display = 'none'; });
    document.querySelectorAll('.scan-corners').forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        btnConfirmAnalyzeNew.disabled = false;
        alert(t('alert.no.face'));
        return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    state.expertFullLandmarks = landmarks;
    state.manualMeshPoints = extractExpertControlPoints(landmarks);
    state.initialMeshPoints = JSON.parse(JSON.stringify(state.manualMeshPoints));
    state.movedExpertPoints = new Set();
    btnConfirmAnalyzeNew.disabled = false;
    btnConfirmAnalyzeNew.classList.remove('hidden');
    btnConfirmAnalyzeNew.style.display = '';
    if (typeof newScanActions !== 'undefined' && newScanActions) {
        newScanActions.classList.remove('hidden');
        newScanActions.style.display = 'flex';
    }
    btnConfirmAnalyzeNew.innerHTML = `<span class="material-symbols-outlined text-[16px]">check</span> ${t('btn.mesh.validate')}`;
    btnConfirmAnalyzeNew.onclick = validateManualMeshAndAnalyze;
    updateHelpButtonVisibility();
    drawExpertMesh();
    bindExpertMeshCanvas();
}

function getExpertCoverMetrics() {
    if (!expertMeshCanvas || !inputImageNew || !state.expertMeshImage) return null;

    const frameRect = inputImageNew.parentElement.getBoundingClientRect();
    const imageWidth = state.expertMeshImage.naturalWidth || 1;
    const imageHeight = state.expertMeshImage.naturalHeight || 1;
    const scale = Math.max(frameRect.width / imageWidth, frameRect.height / imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    const offsetX = (frameRect.width - drawWidth) / 2;
    const offsetY = (frameRect.height - drawHeight) / 2;

    return {
        frameWidth: frameRect.width,
        frameHeight: frameRect.height,
        imageWidth,
        imageHeight,
        scale,
        drawWidth,
        drawHeight,
        offsetX,
        offsetY,
    };
}

function extractExpertControlPoints(landmarks) {
    const points = {};
    const seen = new Set();
    EXPERT_ANATOMY.forEach(zone => {
        zone.indices.forEach(idx => {
            if (seen.has(idx)) return;
            seen.add(idx);
            const lm = landmarks[idx];
            if (lm) points[String(idx)] = { x: lm.x, y: lm.y };
        });
    });
    return points;
}

function positionExpertMeshCanvas() {
    if (!expertMeshCanvas || !inputImageNew || !state.expertMeshImage) return;
    const metrics = getExpertCoverMetrics();
    if (!metrics) return;
    const dpr = window.devicePixelRatio || 1;

    expertMeshCanvas.style.left = '0px';
    expertMeshCanvas.style.top = '0px';
    expertMeshCanvas.style.width = `${metrics.frameWidth}px`;
    expertMeshCanvas.style.height = `${metrics.frameHeight}px`;
    expertMeshCanvas.width = Math.round(metrics.frameWidth * dpr);
    expertMeshCanvas.height = Math.round(metrics.frameHeight * dpr);
    expertMeshCanvas.dataset.cssWidth = String(metrics.frameWidth);
    expertMeshCanvas.dataset.cssHeight = String(metrics.frameHeight);
    expertMeshCanvas.style.pointerEvents = '';
    expertMeshCanvas.classList.remove('hidden');
}

function bindExpertMeshCanvas() {
    if (!expertMeshCanvas || expertMeshCanvas.dataset.bound === 'true') return;
    expertMeshCanvas.dataset.bound = 'true';
    expertMeshCanvas.addEventListener('pointerdown', onExpertMeshPointerDown);
    expertMeshCanvas.addEventListener('touchstart', onExpertMeshTouchStart, { passive: false });
    expertMeshCanvas.addEventListener('touchmove', onExpertMeshTouchMove, { passive: false });
    expertMeshCanvas.addEventListener('touchend', stopExpertPointDrag);
    expertMeshCanvas.addEventListener('touchcancel', stopExpertPointDrag);
    window.addEventListener('resize', () => {
        if (state.scanMode === 'expert' && state.manualMeshPoints && Object.keys(state.manualMeshPoints).length) {
            positionExpertMeshCanvas();
            drawExpertMesh();
        }
    });
}

function getExpertCanvasPoint(event) {
    const rect = expertMeshCanvas.getBoundingClientRect();
    const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? 0;
    const metrics = getExpertCoverMetrics();
    if (!metrics) {
        return {
            x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
            y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
        };
    }

    return {
        x: Math.max(0, Math.min(1, (clientX - rect.left - metrics.offsetX) / metrics.drawWidth)),
        y: Math.max(0, Math.min(1, (clientY - rect.top - metrics.offsetY) / metrics.drawHeight))
    };
}

function findNearestExpertPoint(pos) {
    const rect = expertMeshCanvas.getBoundingClientRect();
    const metrics = getExpertCoverMetrics();
    let nearest = null;
    let best = Infinity;
    Object.entries(state.manualMeshPoints || {}).forEach(([key, point]) => {
        const pointX = metrics ? metrics.offsetX + point.x * metrics.drawWidth : point.x * rect.width;
        const pointY = metrics ? metrics.offsetY + point.y * metrics.drawHeight : point.y * rect.height;
        const posX = metrics ? metrics.offsetX + pos.x * metrics.drawWidth : pos.x * rect.width;
        const posY = metrics ? metrics.offsetY + pos.y * metrics.drawHeight : pos.y * rect.height;
        const dx = pointX - posX;
        const dy = pointY - posY;
        const distance = Math.hypot(dx, dy);
        if (distance < best) {
            best = distance;
            nearest = key;
        }
    });
    return best <= 34 ? nearest : null;
}

function onExpertMeshPointerDown(event) {
    if (!state.manualMeshPoints || !Object.keys(state.manualMeshPoints).length) return;
    event.preventDefault();
    const key = findNearestExpertPoint(getExpertCanvasPoint(event));
    if (!key) return;
    expertMeshCanvas.setPointerCapture(event.pointerId);
    state.draggingExpertPoint = key;
    expertMeshMagnifier?.classList.remove('hidden');
    updateExpertPointFromEvent(event);

    expertMeshCanvas.addEventListener('pointermove', updateExpertPointFromEvent);
    expertMeshCanvas.addEventListener('pointerup', stopExpertPointDrag);
    expertMeshCanvas.addEventListener('pointercancel', stopExpertPointDrag);
}

function onExpertMeshTouchStart(event) {
    if (!state.manualMeshPoints || !Object.keys(state.manualMeshPoints).length || !event.touches?.length) return;
    event.preventDefault();
    const key = findNearestExpertPoint(getExpertCanvasPoint(event));
    if (!key) return;
    state.draggingExpertPoint = key;
    expertMeshMagnifier?.classList.remove('hidden');
    updateExpertPointFromEvent(event);
}

function onExpertMeshTouchMove(event) {
    if (!state.draggingExpertPoint || !event.touches?.length) return;
    event.preventDefault();
    updateExpertPointFromEvent(event);
}

function updateExpertPointFromEvent(event) {
    if (!state.draggingExpertPoint) return;
    state.manualMeshPoints[state.draggingExpertPoint] = getExpertCanvasPoint(event);
    state.movedExpertPoints.add(state.draggingExpertPoint);
    drawExpertMesh();
    drawExpertMagnifier(state.manualMeshPoints[state.draggingExpertPoint], state.draggingExpertPoint);
}

function stopExpertPointDrag() {
    state.draggingExpertPoint = null;
    expertMeshMagnifier?.classList.add('hidden');
    expertMeshCanvas.removeEventListener('pointermove', updateExpertPointFromEvent);
    expertMeshCanvas.removeEventListener('pointerup', stopExpertPointDrag);
    expertMeshCanvas.removeEventListener('pointercancel', stopExpertPointDrag);
}

// Catmull-Rom spline → courbes de Bézier (les points deviennent des nœuds)
function drawSmoothCurve(ctx, points, closed, w, h) {
    const n = points.length;
    if (n < 2) return;
    const T = 1 / 6; // tension Catmull-Rom standard

    const get = (i) => closed
        ? points[((i % n) + n) % n]
        : points[Math.max(0, Math.min(n - 1, i))];

    ctx.beginPath();
    ctx.moveTo(points[0].x * w, points[0].y * h);

    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
        const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
        ctx.bezierCurveTo(
            (p1.x + (p2.x - p0.x) * T) * w,
            (p1.y + (p2.y - p0.y) * T) * h,
            (p2.x - (p3.x - p1.x) * T) * w,
            (p2.y - (p3.y - p1.y) * T) * h,
            p2.x * w,
            p2.y * h
        );
    }
    if (closed) ctx.closePath();
}

function drawTwoPointLoop(ctx, points, w, h) {
    if (points.length !== 2) return;
    const [a, b] = points;
    const x0 = a.x * w, y0 = a.y * h;
    const x1 = b.x * w, y1 = b.y * h;
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (!len) return;

    const nx = -dy / len;
    const ny = dx / len;
    const bulge = Math.max(3, Math.min(14, len * 0.35));

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(
        x0 + dx * 0.35 + nx * bulge,
        y0 + dy * 0.35 + ny * bulge,
        x0 + dx * 0.65 + nx * bulge,
        y0 + dy * 0.65 + ny * bulge,
        x1,
        y1
    );
    ctx.bezierCurveTo(
        x0 + dx * 0.65 - nx * bulge,
        y0 + dy * 0.65 - ny * bulge,
        x0 + dx * 0.35 - nx * bulge,
        y0 + dy * 0.35 - ny * bulge,
        x0,
        y0
    );
    ctx.closePath();
}

// ─────────────────────────────────────────────────────────────────────────
// Dessin architectural du nez : arête + deux narines (haute densité) + base
// ─────────────────────────────────────────────────────────────────────────
function drawNoseStructure(ctx, pts, w, h) {
    const pointKeys = ['6', '456', '294', '305', '309', '457', '458', '238', '237', '79', '75', '64', '236', '6'];
    const points = pointKeys.map(key => pts[key]).filter(p => p);

    if (points.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x * w, points[0].y * h);

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x * w, cp1y * h, cp2x * w, cp2y * h, p2.x * w, p2.y * h);
    }

    ctx.stroke();
}


function drawExpertMesh() {
    if (!expertMeshCanvas || !state.manualMeshPoints) return;
    positionExpertMeshCanvas();
    const ctx = expertMeshCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const metrics = getExpertCoverMetrics();
    const w = metrics ? metrics.drawWidth : parseFloat(expertMeshCanvas.dataset.cssWidth  || expertMeshCanvas.clientWidth);
    const h = metrics ? metrics.drawHeight : parseFloat(expertMeshCanvas.dataset.cssHeight || expertMeshCanvas.clientHeight);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (metrics) {
        ctx.translate(metrics.offsetX, metrics.offsetY);
    }

    const pts = state.manualMeshPoints;

    // ── Couche 1 : masque anatomique (courbes organiques) ─────────────────
    ctx.lineWidth   = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.shadowBlur  = 0;

    EXPERT_ANATOMY.forEach(zone => {
        if (zone.isolated) return;

        // ⭐ Gestion spéciale pour l'architecture nasale
        if (zone.isNoseComponent) {
            // Les composants du nez sont dessinés ensemble dans drawNoseStructure
            // On saute le dessin individuel ici
            return;
        }

        const pos = zone.indices.map(idx => pts[String(idx)]);
        if (pos.some(p => !p)) return;

        if (zone.loop) {
            drawTwoPointLoop(ctx, pos, w, h);
            ctx.stroke();
        } else if (zone.connections) {
            // Lignes droites pour connexions spéciales
            zone.connections.forEach(([a, b]) => {
                ctx.beginPath();
                ctx.moveTo(pos[a].x * w, pos[a].y * h);
                ctx.lineTo(pos[b].x * w, pos[b].y * h);
                ctx.stroke();
            });
        } else {
            // Courbe Catmull-Rom lissée
            drawSmoothCurve(ctx, pos, zone.closed || false, w, h);
            ctx.stroke();
        }
    });

    // ⭐ Dessin de l'architecture nasale complète (après les autres zones)
    drawNoseStructure(ctx, pts, w, h);

    // ── Couche 1.5 : réticule de visée des pupilles (4 lignes fines) ────────
    const PUPIL_RETICULE = [
        { pupil: '468', eye: ['33', '159', '133', '145'] },
        { pupil: '473', eye: ['263', '386', '362', '374'] },
    ];
    ctx.lineWidth   = 0.8;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.shadowBlur  = 0;
    PUPIL_RETICULE.forEach(({ pupil, eye }) => {
        const c = pts[pupil];
        if (!c) return;
        ctx.beginPath();
        eye.forEach(k => {
            const p = pts[k];
            if (!p) return;
            ctx.moveTo(c.x * w, c.y * h);
            ctx.lineTo(p.x * w, p.y * h);
        });
        ctx.stroke();
    });

    // ── Couche 2 : points de contrôle cyan (interactifs) ──────────────────
    Object.entries(pts).forEach(([key, point]) => {
        if (!point) return;
        const x = point.x * w;
        const y = point.y * h;
        const isDragging = state.draggingExpertPoint === key;
        const isNosePoint = ['6', '456', '294', '305', '457', '458', '238', '237', '75', '64', '236'].includes(key);
        const radius = isDragging ? 3 : 1.8;

        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur  = isDragging ? 16 : 5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth   = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Les numéros de points de calibration sont masqués (uniquement les points restent visibles)
    });
}

function drawExpertMagnifier(point, key) {
    if (!expertMeshMagnifier || !expertMeshCanvas || !state.expertMeshImage || !point) return;
    const size = 112;
    const zoom = 2.4;
    const ctx = expertMeshMagnifier.getContext('2d');
    expertMeshMagnifier.width = size * (window.devicePixelRatio || 1);
    expertMeshMagnifier.height = size * (window.devicePixelRatio || 1);
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const srcX = point.x * state.expertMeshImage.naturalWidth;
    const srcY = point.y * state.expertMeshImage.naturalHeight;
    const srcSize = size / zoom;
    ctx.drawImage(
        state.expertMeshImage,
        Math.max(0, srcX - srcSize / 2),
        Math.max(0, srcY - srcSize / 2),
        srcSize,
        srcSize,
        0,
        0,
        size,
        size
    );

    if (key) {
        const label = String(key);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, size, 20);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, size / 2, 10);
    }

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size / 2, 12);
    ctx.lineTo(size / 2, size - 12);
    ctx.moveTo(12, size / 2);
    ctx.lineTo(size - 12, size / 2);
    ctx.stroke();
}

function openHelpMeshModal() {
    if (helpMeshModal) {
        helpMeshModal.classList.remove('hidden');
        helpMeshModal.style.display = 'flex';
        helpMeshModal.style.pointerEvents = 'auto';
        helpMeshModal.style.zIndex = '6000';
        
        // Initialize guide mesh canvas
        const canvas = document.getElementById('guide-mesh-canvas');
        const img = document.getElementById('guide-reference-img');
        // Ensure image has a sane path
        if (img && (!img.src || img.src.indexOf('REPERE.PNG') === -1)) {
            img.src = 'app/REPERE.PNG';
        }
        if (canvas && img) {
            // Wait for image to load before drawing
            if (img.complete) {
                drawGuideMeshOnCanvas(canvas, img);
            } else {
                img.addEventListener('load', () => {
                    drawGuideMeshOnCanvas(canvas, img);
                }, { once: true });
            }
            
            // Resize handler for responsive canvas
            const resizeHandler = () => {
                drawGuideMeshOnCanvas(canvas, img);
            };
            window.addEventListener('resize', resizeHandler);
            
            // Store handler for cleanup
            canvas._resizeHandler = resizeHandler;
        }
    }
}

function closeHelpMeshModal() {
    if (helpMeshModal) {
        helpMeshModal.classList.add('hidden');
        helpMeshModal.style.display = 'none';
        helpMeshModal.style.pointerEvents = 'none';
        helpMeshModal.style.zIndex = '-1';
        
        // Cleanup resize handler
        const canvas = document.getElementById('guide-mesh-canvas');
        if (canvas && canvas._resizeHandler) {
            window.removeEventListener('resize', canvas._resizeHandler);
            delete canvas._resizeHandler;
        }
    }
}

function updateHelpButtonVisibility() {
    if (!btnMeshHelp) return;
    if (state.scanMode === 'expert' && state.manualMeshPoints && Object.keys(state.manualMeshPoints).length) {
        btnMeshHelp.classList.remove('hidden');
        btnMeshHelp.style.display = 'block';
    } else {
        btnMeshHelp.classList.add('hidden');
        btnMeshHelp.style.display = 'none';
    }
}

// ════════════════════════════════════════════════════════════════════════
// GUIDE DE PLACEMENT DYNAMIQUE — Canvas + repere.jpg + Courbes Bézier
// ════════════════════════════════════════════════════════════════════════

// Coordonnées fixes du guide (normalisées 0-1, relatives à l'image repere.jpg)
// À régler manuellement pour correspondre exactement aux positions sur repere.jpg
const guidePointsPositions = {
    '10': { x: 0.50, y: 0.065 },  // head_top (sommet)
    '21': { x: 0.265, y: 0.255 }, // temple_left
    '251': { x: 0.735, y: 0.255 },// temple_right
    '70': { x: 0.50, y: 0.312 },  // brow_center
    '105': { x: 0.395, y: 0.330 },// brow_left
    '334': { x: 0.605, y: 0.330 },// brow_right
    '33': { x: 0.288, y: 0.368 }, // eye_left_outer
    '159': { x: 0.430, y: 0.358 },// eye_left_inner
    '386': { x: 0.570, y: 0.358 },// eye_right_inner
    '263': { x: 0.712, y: 0.368 },// eye_right_outer
    '6': { x: 0.50, y: 0.368 },   // nose_bridge
    '234': { x: 0.220, y: 0.432 },// cheek_left
    '454': { x: 0.780, y: 0.432 },// cheek_right
    '456': { x: 0.560, y: 0.405 },// nose_right_canopy
    '294': { x: 0.440, y: 0.405 },// nose_left_canopy
    '64': { x: 0.540, y: 0.430 }, // nose_right_wing
    '131': { x: 0.460, y: 0.430 },// nose_left_wing
    '238': { x: 0.475, y: 0.450 },// nose_left_inner
    '458': { x: 0.525, y: 0.450 },// nose_right_inner
    '75': { x: 0.450, y: 0.465 }, // nose_left_outer
    '305': { x: 0.550, y: 0.465 },// nose_right_outer
    '237': { x: 0.470, y: 0.478 },// nose_left_top
    '457': { x: 0.530, y: 0.478 },// nose_right_top
    '61': { x: 0.357, y: 0.648 }, // mouth_left
    '40': { x: 0.407, y: 0.632 }, // mouth_top_left
    '37': { x: 0.50, y: 0.625 },  // mouth_top
    '0': { x: 0.50, y: 0.643 },   // mouth_top_center
    '267': { x: 0.593, y: 0.632 },// mouth_top_right
    '270': { x: 0.643, y: 0.632 },// mouth_top_right2
    '291': { x: 0.643, y: 0.648 },// mouth_right
    '321': { x: 0.593, y: 0.666 },// mouth_bottom_right
    '314': { x: 0.50, y: 0.675 }, // mouth_bottom_center_right
    '17': { x: 0.50, y: 0.672 },  // mouth_bottom
    '84': { x: 0.407, y: 0.666 }, // mouth_bottom_left
    '91': { x: 0.50, y: 0.675 },  // mouth_bottom_center_left
    '172': { x: 0.290, y: 0.722 },// jaw_left
    '397': { x: 0.710, y: 0.722 },// jaw_right
    '152': { x: 0.50, y: 0.805 }, // chin_tip
    '468': { x: 0.455, y: 0.380 },// pupil_left
    '473': { x: 0.545, y: 0.380 },// pupil_right
};

function drawGuideMeshOnCanvas(canvas, guideImage) {
    if (!canvas || !guideImage) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    
}

function relDist(points, a, b) {
    if (!points[a] || !points[b]) return 0;
    return Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y);
}

function midPoint(points, a, b) {
    if (!points[a] || !points[b]) return { x: 0, y: 0 };
    return { x: (points[a].x + points[b].x) / 2, y: (points[a].y + points[b].y) / 2 };
}

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

function validateManualMeshAndAnalyze() {
    if (!state.manualMeshPoints || !Object.keys(state.manualMeshPoints).length) return;
    state.expertMeshAttributes = calculateMixAttributes(state.manualMeshPoints);
    // Add custom metrics (mouth area ratio and nostrils size ratio) based on calibration indices
    state.expertMeshAttributes = augmentAttributesWithCustomMetrics(state.manualMeshPoints, state.expertMeshAttributes);
    state.draggingExpertPoint = null;
    if (expertMeshCanvas) expertMeshCanvas.style.pointerEvents = 'none';
    if (expertMeshMagnifier) expertMeshMagnifier.classList.add('hidden');
    // Ensure the main confirm button remains visible after validation
    if (newScanActions) newScanActions.classList.remove('hidden');
    if (btnConfirmAnalyzeNew) {
        btnConfirmAnalyzeNew.classList.remove('hidden');
        btnConfirmAnalyzeNew.style.display = '';
        btnConfirmAnalyzeNew.style.zIndex = '9999';
    }

    // ─── PRODUCTION MODE: Connect to new matching engine (Top 3 selection) ────────
    detectSkinToneFromCanvas(state.expertMeshImage, state.expertFullLandmarks, (skinTone, skinMeta) => {
        console.log(`🎨 Mode Expert - Skin tone detected: ${skinTone}`);

        // 1. Lancement du nouveau moteur de matching
        const { scores } = selectBestPreset(state.expertFullLandmarks, skinTone);

        // 2. Préparation des 3 meilleurs candidats
        const top3 = scores.slice(0, 3).map(s => {
            const preset = PRESETS_DB.find(p => p.preset_id === s.preset_id);
            return { preset, score: s.score };
        }).filter(item => item.preset);

        console.log(`🏆 Top 3 expert presets:`, top3.map(t => ({
            id: t.preset.preset_id,
            position: t.preset.position,
            score: t.score.toFixed(1)
        })));

        // 3. Sauvegarde de l'état pour la suite
        state.pendingAnalysis = {
            landmarks: state.expertFullLandmarks,
            skinTone,
            skinMeta,
            scores: scores.slice(0, 3)
        };

        // 4. Affichage de l'écran de sélection des 3 têtes
        if (typeof showPresetChoiceScreen === 'function') {
            showPresetChoiceScreen(top3);
        } else {
            console.warn('⚠️ showPresetChoiceScreen not found');
        }
    });

    syncExpertMeshCanvasAndRedraw();
}

function syncExpertMeshCanvasAndRedraw() {
    if (!expertMeshCanvas || !state.manualMeshPoints || !Object.keys(state.manualMeshPoints).length) return;
    requestAnimationFrame(() => {
        positionExpertMeshCanvas();
        drawExpertMesh();
    });
}

function formatAttributeValue(value) {
    if (!Number.isFinite(value)) return '0.000';
    return value.toFixed(3);
}

function getMetricLabel(name) {
    const key = `metric.${name}`;
    const label = t(key);
    return label === key ? name : label;
}

function generateJSONData(attributes) {
    const keys = ['base', 'front', 'sourcils', 'yeux', 'nez', 'joues', 'bouche', 'menton', 'machoire'];
    const result = {};
    keys.forEach(key => {
        const section = attributes[key];
        if (!section) return;
        result[key] = {};
        Object.entries(section).forEach(([name, value]) => {
            result[key][name] = Number.isFinite(value) ? parseFloat(value.toFixed(3)) : 0;
        });
    });
    return result;
}

function renderExpertRecipeCard(attributes) {
    if (!newResultContainer || !attributes) return;
    const headerTitle = document.querySelector('#new-scan-modal h2');
    if (headerTitle) headerTitle.innerText = t('expert.recipe.title');

    const rows = [
        { key: 'base', label: t('preset.head') || 'Base' },
        { key: 'front', label: t('zone.front') },
        { key: 'sourcils', label: t('zone.sourcils') },
        { key: 'yeux', label: t('zone.yeux') },
        { key: 'nez', label: t('zone.nez') },
        { key: 'joues', label: t('zone.joues') },
        { key: 'bouche', label: t('zone.bouche') },
        { key: 'menton', label: t('zone.menton') },
        { key: 'machoire', label: t('zone.machoire') }
    ];

    const cards = rows.map(row => {
        const values = attributes[row.key] || {};
        const chips = Object.entries(values).map(([name, value]) => `
            <span class="inline-flex items-center justify-between gap-2 px-2 py-1 rounded border border-white/10 bg-white/5 text-[11px] text-on-surface-variant">
                <span class="uppercase">${getMetricLabel(name)}</span>
                <strong class="text-primary-container">${formatAttributeValue(value)}</strong>
            </span>
        `).join('');

        return `
            <div class="bg-surface-container-lowest border border-white/10 rounded-lg p-md">
                <div class="font-title-sm text-[13px] text-on-surface uppercase mb-sm">${row.label}</div>
                <div class="flex flex-wrap gap-xs">${chips}</div>
            </div>
        `;
    }).join('');

    newResultContainer.innerHTML = `
        <div id="expert-recipe-card" class="flex flex-col gap-md">
            <div class="border border-primary-container/40 bg-primary-container/5 rounded-lg p-md">
                <h3 class="font-title-sm text-title-sm text-primary-container uppercase mb-xs">${t('expert.recipe.title')}</h3>
                <p class="font-body-md text-[14px] text-on-surface-variant leading-relaxed">${t('expert.recipe.desc')}</p>
            </div>
            ${cards}
            <div style="display:flex;gap:8px;margin-top:4px;">
                <button id="btn-copy-json" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;background:rgba(0,240,255,0.08);border:1px solid rgba(0,240,255,0.35);border-radius:8px;color:#00f0ff;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.2s;">
                    📋 Copier JSON
                </button>
                <button id="btn-download-json" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;background:rgba(0,240,255,0.08);border:1px solid rgba(0,240,255,0.35);border-radius:8px;color:#00f0ff;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.2s;">
                    💾 Télécharger JSON
                </button>
            </div>
        </div>
    `;

    document.getElementById('btn-copy-json')?.addEventListener('click', function () {
        const json = JSON.stringify(generateJSONData(attributes), null, 2);
        navigator.clipboard.writeText(json).then(() => {
            this.textContent = '✅ Copié !';
            setTimeout(() => { this.innerHTML = '📋 Copier JSON'; }, 2000);
        }).catch(() => {
            this.textContent = '❌ Erreur';
            setTimeout(() => { this.innerHTML = '📋 Copier JSON'; }, 2000);
        });
    });

    document.getElementById('btn-download-json')?.addEventListener('click', function () {
        const json = JSON.stringify(generateJSONData(attributes), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'preset_scan.json';
        a.click();
        URL.revokeObjectURL(url);
    });
}

let newProgressInterval = null;

window.confirmAndAnalyzeNew = async function(imageDataParam) {
    console.log("confirmAndAnalyzeNew TRIGGÉRED !");

    let finalDataUrl = (typeof imageDataParam === 'string') ? imageDataParam : null;
    if (!finalDataUrl) {
        // Use the original image source (no cropping/resizing) to avoid black bars/zoom artifacts
        finalDataUrl = inputImageNew?.src || (capturedBase64 ? 'data:image/jpeg;base64,' + capturedBase64 : null);
    }

    if (!finalDataUrl) {
        console.error("Aucune image à analyser.");
        return;
    }

    try {
        btnConfirmAnalyzeNew.disabled = true;
        if (newScanActions) newScanActions.classList.add('hidden');

        if (newScanProgress) newScanProgress.classList.remove('hidden');
        if (laserLineNew) {
            laserLineNew.classList.remove('hidden');
            laserLineNew.classList.add('animate-pulse');
        }
        if (progressPercentNew) progressPercentNew.innerText = '0%';
        if (progressBarFillNew) progressBarFillNew.style.width = '0%';

        let progress = 0;
        if (newProgressInterval) clearInterval(newProgressInterval);
        newProgressInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress > 90) progress = 90;
            if (progressPercentNew) progressPercentNew.innerText = progress + '%';
            if (progressBarFillNew) progressBarFillNew.style.width = progress + '%';
        }, 300);

        capturedBase64 = finalDataUrl.split(',')[1];

        // 🔴 FIX : On détruit le cropper AVANT de modifier l'image
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        inputImageNew.onload = null;
        inputImageNew.src = finalDataUrl;
        inputImageNew.classList.remove('hidden');
        // Do NOT add any inline width/maxWidth/height styles - let CSS handle display

        console.log("Verification de la qualité de la photo...");
        const quality = await checkPhotoQuality(capturedBase64);

        if (!quality.ok) {
            console.warn("Quality Check Failed:", quality.reason);
            clearInterval(newProgressInterval);
            if (newScanActions) newScanActions.classList.remove('hidden');
            if (newScanProgress) newScanProgress.classList.add('hidden');
            if (laserLineNew) laserLineNew.classList.add('hidden');
            btnConfirmAnalyzeNew.disabled = false;

            if (quality.reason === 'no_face') alert(t('qa.noface') || 'Aucun visage détecté. Réessaie.');
            else if (quality.reason === 'too_blurry') alert(t('qa.blur') || 'Photo trop floue. Prends une photo plus nette.');
            else if (quality.reason === 'bad_lighting') alert(t('qa.light') || 'Éclairage insuffisant. Trouve un endroit plus lumineux.');
            else if (quality.reason === 'bad_angle') alert(t('qa.angle') || 'Tiens ta tête droite face à la caméra.');
            else alert("Erreur de qualité d'image.");
            return;
        }

        console.log("Qualité OK. Lancement de l'analyse MediaPipe...");

        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    outputCanvas.width = img.naturalWidth;
                    outputCanvas.height = img.naturalHeight;

                    await faceMesh.send({ image: img });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error("Impossible de charger l'image pour MediaPipe."));
            img.src = finalDataUrl;
        });

    } catch(e) {
        console.error("Erreur critique dans confirmAndAnalyzeNew :", e);
        alert(e.message || "Erreur lors de l'analyse de l'image.");
        if (newProgressInterval) clearInterval(newProgressInterval);
        if (newScanActions) newScanActions.classList.remove('hidden');
        if (newScanProgress) newScanProgress.classList.add('hidden');
        if (laserLineNew) laserLineNew.classList.add('hidden');
        btnConfirmAnalyzeNew.disabled = false;
    }
    applyPremiumUnlockUI();
}

// Intercept onResults to finish the progress bar
const originalOnResults = window.onResults || onResults;
window.onResults = function(results) {
    originalOnResults(results);
};

// Override showPresetChoiceScreen
window.showPresetChoiceScreen = function(top3) {
    console.log("New showPresetChoiceScreen called with", top3);
    
    if (newProgressInterval) clearInterval(newProgressInterval);
    if (progressPercentNew) progressPercentNew.innerText = '100%';
    if (progressBarFillNew) progressBarFillNew.style.width = '100%';
    if (laserLineNew) {
        laserLineNew.classList.remove('animate-pulse');
        laserLineNew.classList.add('hidden');
    }
    if (btnConfirmAnalyzeNew) btnConfirmAnalyzeNew.disabled = false;

    state.pendingTop3 = top3;
    if (newResultContainer) newResultContainer.innerHTML = '';
    
    const styles = [
        { border: 'border-tertiary-container', shadow: 'shadow-[0_0_15px_rgba(254,214,57,0.3)]', glow: 'bg-tertiary-container', text: 'text-tertiary-container', label: '★ TOP MATCH' },
        { border: 'border-white/10 hover:border-primary-container/60', shadow: '', glow: 'bg-primary-container opacity-80', text: 'text-primary-container', label: '' },
        { border: 'border-white/10 hover:border-primary-container/60', shadow: '', glow: 'bg-primary-container opacity-60', text: 'text-primary-container', label: '' }
    ];

    top3.forEach((entry, index) => {
        const player = entry?.player ?? entry?.preset ?? entry;
        const presetId = player?.preset_id ?? player?.presetId ?? player?.id ?? null;
        const playerName = player?.name ?? player?.label ?? player?.preset_name ?? `Preset ${presetId ?? ''}`;
        const scoreValue = Number(entry?.score ?? player?.score ?? 0);
        const scorePercent = Number.isFinite(scoreValue) ? Math.max(0, Math.min(100, Math.round(scoreValue))) : 0;
        const imageSrc = getPresetImageSrc(player);
        
        const style = styles[index] || styles[2];
        
        const labelHtml = index === 0 ? `<div class="absolute top-0 right-0 ${style.glow} text-[#0A0A0C] font-label-caps text-[9px] px-sm py-[2px] rounded-bl-lg font-bold shadow-[0_0_10px_rgba(254,214,57,0.5)] z-10">${style.label}</div>` : '';
        
        const cardHtml = `
            <div class="relative bg-surface-container-lowest border ${style.border} ${style.shadow} transition-colors rounded-lg p-md flex gap-lg items-center overflow-hidden group">
                ${labelHtml}
                <div class="w-[70px] h-[90px] rounded border border-white/10 shrink-0 relative overflow-hidden bg-black">
                    <img src="${imageSrc}" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22 viewBox=%220 0 400 500%22%3E%3Crect width=%22400%22 height=%22500%22 fill=%22%23161a1f%22/%3E%3C/svg%3E';this.style.opacity='0.3'">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                <div class="flex flex-col flex-1">
                    <div class="flex items-center justify-between mb-xs">
                        <span class="font-title-sm text-[15px] text-on-surface font-bold uppercase">${playerName}</span>
                        <span class="font-title-sm text-[15px] ${style.text} font-bold">${scorePercent}%</span>
                    </div>
                    <div class="w-full h-[2px] bg-white/10 rounded-full mb-md">
                        <div class="h-full ${style.glow}" style="width: ${scorePercent}%"></div>
                    </div>
                    <button class="w-full py-xs border ${index === 0 ? 'border-tertiary-container text-tertiary-container hover:bg-tertiary-container/10' : 'border-white/10 text-on-surface-variant group-hover:border-primary-container group-hover:text-primary-container'} font-label-caps text-[11px] transition-colors rounded" onclick="window.selectPresetNew(event, '${presetId}')">
                        CHOISIR
                    </button>
                </div>
            </div>
        `;
        
        if(newResultContainer) newResultContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
};

window.selectPresetNew = function(event, presetId) {
    if (event) event.preventDefault();
    
    if (!state.pendingAnalysis) return;
    const { landmarks, skinTone, skinMeta, scores } = state.pendingAnalysis;
    console.log("🔘 Bouton CHOISIR cliqué pour l'ID :", presetId);
    // Conversion sécurisée pour contourner le problème String vs Number
    const chosenPreset = PRESETS_DB.find(p => String(p.preset_id) === String(presetId));

    if (!chosenPreset) {
        console.error("❌ ERREUR : Preset introuvable dans PRESETS_DB pour l'ID :", presetId);
        return;
    }
    console.log("✅ Preset trouvé :", chosenPreset.preset_id, "- Lancement du façonnage...");

    state.results = analyzeWithPreset(landmarks, skinTone, chosenPreset, scores);
    state.results.skinMeta = skinMeta;
    
    // Update Header Text
    const headerTitle = document.querySelector('#new-scan-modal h2');
    if (headerTitle) headerTitle.innerText = "FAÇONNAGE AVANCÉ";
    
    const headerTextElements = document.querySelectorAll('#new-scan-modal p');
    headerTextElements.forEach(p => {
        if (p.innerText.includes("L'IA a trouvé")) {
            p.innerText = "Ajuste les curseurs pour correspondre parfaitement au preset.";
        }
    });
    
    window.renderAdvancedShaping(state.results);
};

window.renderAdvancedShaping = function(result) {
    if (!result) return;
    
    // 1. Colonne de Gauche (Image du Preset)
    if (inputImageNew) {
        inputImageNew.src = `app/assets/presets/${result.preset.id}.png`;
        inputImageNew.classList.remove('hidden', 'mix-blend-luminosity', 'opacity-70', 'grayscale');

        
    }
    
    // Task 3: Masquer le Guide Visuel (Ovale) but keep scan corners visible for framing
    var faceGuide = document.getElementById('face-guide-overlay');
    if (faceGuide) { faceGuide.classList.add('hidden'); faceGuide.style.display = 'none'; }
    // Hide any textual hints but preserve the corners
    document.querySelectorAll('.face-guide-hint').forEach(h => { h.classList.add('hidden'); h.style.display = 'none'; });
    document.querySelectorAll('.scan-corners').forEach(c => c.classList.remove('hidden'));
    
    // Modifie le texte 'SCANNING' (ou SCAN ANALYSIS) en 'MODÈLE DE BASE'
    const scanLabel = document.querySelector('#new-scan-modal .font-label-caps.text-primary-container');
    if (scanLabel) {
        scanLabel.innerText = 'MODÈLE DE BASE';
        scanLabel.style.color = '#ffffff'; // Maybe neutral color ?
    }
    
    // Masque la progression et le laser
    if (newScanProgress) newScanProgress.classList.add('hidden');
    if (laserLineNew) {
        laserLineNew.classList.remove('animate-pulse');
        laserLineNew.classList.add('hidden');
    }

    const container = document.getElementById('new-result-container');
    if (!container) return;
    
    // 2. Colonne de Droite (Le nouveau Zone Mix)
    container.innerHTML = '';
    
    const mainPresetObj = PRESETS_DB.find(p => p.preset_id === result.preset.id);
    let zoneMix = null;
    if (mainPresetObj) {
      zoneMix = computeZoneMix(result.ratios, mainPresetObj, PRESETS_DB);
    }
    
    // Génération dynamique du Zone Mix avec le nouveau design
    const zonesList = [
        { key: 'front', label: t('zone.front') || 'Front' },
        { key: 'sourcils', label: t('zone.sourcils') || 'Sourcils' },
        { key: 'yeux', label: t('zone.yeux') || 'Yeux' },
        { key: 'nez', label: t('zone.nez') || 'Nez' },
        { key: 'joues', label: t('zone.joues') || 'Joues' },
        { key: 'bouche', label: t('zone.bouche') || 'Bouche' },
        { key: 'menton', label: t('zone.menton') || 'Menton' },
        { key: 'machoire', label: t('zone.machoire') || 'Mâchoire' }
    ];

    let mixHtml = `
        <div id="zone-mix-view" class="flex flex-col gap-md">
            <div style="margin-bottom: 24px;">
                <h3 class="font-title-sm text-title-sm text-on-surface uppercase tracking-tight" style="color: #00f0ff; margin-bottom: 8px;">ÉTAPE 2 — ONGLET TÊTE (MIX DE PRESETS)</h3>
                <p class="font-body-md text-[14px] text-on-surface-variant leading-relaxed">
                    Dans EA FC 26, rends-toi dans l'onglet "Tête". Pour chaque zone du visage listée ci-dessous, sélectionne le numéro de modèle exact. C'est ce mix unique qui crée l'ADN de base de ton visage avant l'ajustement des curseurs.
                </p>
            </div>
            
            <div class="bg-surface-container-low/60 rounded-lg p-md border border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-sm">
                    <span class="font-title-sm text-[14px] text-on-surface uppercase font-bold">Base (Crâne)</span>
                </div>
                <div class="flex items-center gap-sm">
                    <span class="font-title-sm text-[16px] text-tertiary-container font-bold">${result.preset.id}</span>
                    <button class="bg-white/5 hover:bg-white/10 transition-colors p-xs rounded text-on-surface-variant hover:text-white" onclick="window.copyValue(${result.preset.id}, this)">
                        <span class="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                </div>
            </div>
    `;

    zonesList.forEach(zone => {
        const presetVal = zoneMix && zoneMix[zone.key] ? zoneMix[zone.key] : result.preset.id;
        mixHtml += `
            <div class="bg-surface-container-low/60 rounded-lg p-md border border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-sm">
                    <span class="font-title-sm text-[14px] text-on-surface uppercase font-bold">${zone.label}</span>
                </div>
                <div class="flex items-center gap-sm">
                    <span class="font-title-sm text-[16px] text-primary-container font-bold">${presetVal}</span>
                    <button class="bg-white/5 hover:bg-white/10 transition-colors p-xs rounded text-on-surface-variant hover:text-white" onclick="window.copyValue(${presetVal}, this)">
                        <span class="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                </div>
            </div>
        `;
    });

    // 3. Transition vers le Façonnage Avancé (Gros bouton)
    mixHtml += `
            <button id="btn-show-advanced" class="w-full mt-lg py-sm bg-primary-container text-[#0A0A0C] font-label-caps text-label-caps hover:scale-[1.02] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-transform rounded flex items-center justify-center gap-xs font-bold">
                <span class="material-symbols-outlined text-[18px]">tune</span>
                FAÇONNAGE AVANCÉ
            </button>
        </div>
        <div id="advanced-shaping-view" class="hidden flex-col gap-md">
            <!-- Accordéon généré ici par JS -->
        </div>
    `;
    
    container.innerHTML = mixHtml;
    applyPremiumUnlockUI();

    // Attache l'événement au bouton pour basculer vers l'Accordéon
    document.getElementById('btn-show-advanced').addEventListener('click', () => {
        document.getElementById('zone-mix-view').classList.add('hidden');
        const advView = document.getElementById('advanced-shaping-view');
        advView.classList.remove('hidden');
        advView.style.display = 'flex';
        
        // Change Header Title again
        const headerTitle = document.querySelector('#new-scan-modal h2');
        if (headerTitle) headerTitle.innerText = "AJUSTEMENTS FINS";
        
        generateAdvancedAccordion(result, zoneMix, mainPresetObj, advView);
    });
};

function generateAdvancedAccordion(result, zoneMix, mainPresetObj, container) {
    if (!result.preset || !result.preset.avance) return;
    
    // Override container classes to match the design (flex layout instead of just flex-col gap-md)
    container.className = 'w-full flex flex-col h-full bg-surface-container-low/50 relative';
    
    const mainPid = result.preset.id;
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

    const keyLabels = {
      re: t('slider.re'), bh: t('slider.bh'), na: t('slider.na'),
      aa: t('slider.aa'), ang: t('slider.ang'), gd: t('slider.gd'),
      nr: t('slider.nr'), nh: t('slider.nh'), gp: t('slider.gp')
    };

    const advZones = [
      { id: 'tab-crane', label: t('adv.zone.head') || 'Tête', basePresetId: craneP?.preset_id, subs: [ 
          { label: t('adv.crane.principal') || 'Crâne principal', avanceKey: 'crane', data: craneP?.avance?.crane ? { re: craneP.avance.crane.re || craneP.avance.crane.reduire_elargir, bh: craneP.avance.crane.bh || craneP.avance.crane.bas_haut, aa: craneP.avance.crane.aa || craneP.avance.crane.arrondi_angulaire, na: craneP.avance.crane.na || craneP.avance.crane.neutre_avant, gd: craneP.avance.crane.gd || craneP.avance.crane.gauche_droite } : undefined }, 
          { label: t('adv.crane.couronne') || 'Couronne', avanceKey: 'couronne', data: craneP?.avance?.couronne ? { re: craneP.avance.couronne.re || craneP.avance.couronne.reduire_elargir, bh: craneP.avance.couronne.bh || craneP.avance.couronne.bas_haut, aa: craneP.avance.couronne.aa || craneP.avance.couronne.neutre_arrondi, na: craneP.avance.couronne.na || craneP.avance.couronne.neutre_avant, gd: craneP.avance.couronne.gd || craneP.avance.couronne.gauche_droite } : undefined }, 
          { label: t('adv.crane.arriere') || 'Arrière du crâne', avanceKey: 'arriere_crane', data: craneP?.avance?.arriere_crane ? { re: craneP.avance.arriere_crane.re || craneP.avance.arriere_crane.reduire_elargir, bh: craneP.avance.arriere_crane.bh || craneP.avance.arriere_crane.bas_haut, aa: craneP.avance.arriere_crane.aa || craneP.avance.arriere_crane.arrondi_angulaire, na: craneP.avance.arriere_crane.na || craneP.avance.arriere_crane.neutre_avant, gd: craneP.avance.arriere_crane.gd || craneP.avance.arriere_crane.gauche_droite } : undefined }, 
          { label: t('adv.crane.tempes') || 'Tempes', avanceKey: 'tempes', data: craneP?.avance?.tempes ? { re: craneP.avance.tempes.re || craneP.avance.tempes.reduire_elargir, bh: craneP.avance.tempes.bh || craneP.avance.tempes.bas_haut, aa: craneP.avance.tempes.aa || craneP.avance.tempes.arrondi_angulaire, na: craneP.avance.tempes.na || craneP.avance.tempes.neutre_avant } : undefined } 
      ] },
      { id: 'tab-front', label: t('adv.zone.front') || 'Front', basePresetId: frontP?.preset_id, subs: [ 
          { label: t('adv.front.sup') || 'Front supérieur', avanceKey: 'front_sup', data: frontP?.avance?.front_sup }, 
          { label: t('adv.front.inf') || 'Front inférieur', avanceKey: 'front_inf', data: frontP?.avance?.front_inf }, 
      ] },
      { id: 'tab-sourcils', label: t('adv.zone.brows') || 'Sourcils', basePresetId: sourcilsP?.preset_id, subs: [ 
          { label: t('adv.sourcils.principal') || 'Sourcils', avanceKey: 'sourcils', data: sourcilsP?.avance?.sourcils }, 
          { label: t('adv.sourcils.centre') || 'Centre des sourcils', avanceKey: 'sourcils_ctr', data: sourcilsP?.avance?.sourcils_ctr }, 
          { label: t('adv.sourcils.ext') || 'Extérieur des sourcils', avanceKey: 'sourcils_ext', data: sourcilsP?.avance?.sourcils_ext }, 
      ] },
      { id: 'tab-yeux', label: t('adv.zone.eyes') || 'Yeux', basePresetId: yeuxP?.preset_id, subs: [ 
          { label: t('adv.yeux.principal') || 'Yeux', avanceKey: 'yeux', data: yeuxP?.avance?.yeux }, 
          { label: t('adv.yeux.orbites') || 'Orbites', avanceKey: 'orbites', data: yeuxP?.avance?.orbites }, 
      ] },
      { id: 'tab-nez', label: t('adv.zone.nose') || 'Nez', basePresetId: nezP?.preset_id, subs: [ 
          { label: t('adv.nez.principal') || 'Nez', avanceKey: 'nez_adv', data: nezP?.avance?.nez_adv }, 
          { label: t('adv.nez.arete.cotes') || 'Arête (côtés)', avanceKey: 'arete_cotes', data: nezP?.avance?.arete_cotes }, 
          { label: t('adv.nez.arete.centre') || 'Arête (centre)', avanceKey: 'arete_centrale', data: nezP?.avance?.arete_centrale }, 
          { label: t('adv.nez.arete.sup') || 'Arête (supérieure)', avanceKey: 'arete_sup', data: nezP?.avance?.arete_sup }, 
      ] },
      { id: 'tab-joues', label: t('adv.zone.cheeks') || 'Joues', basePresetId: jouesP?.preset_id, subs: [ 
          { label: t('adv.joues.principal') || 'Joues', avanceKey: 'joues_adv', data: jouesP?.avance?.joues_adv }, 
      ] },
      { id: 'tab-bouche', label: t('adv.zone.mouth') || 'Bouche', basePresetId: boucheP?.preset_id, subs: [ 
          { label: t('adv.bouche.principal') || 'Bouche', avanceKey: 'bouche_adv', data: boucheP?.avance?.bouche_adv }, 
          { label: t('adv.bouche.ext') || 'Extérieur', avanceKey: 'bouche_ext', data: boucheP?.avance?.bouche_ext }, 
      ] },
      { id: 'tab-menton', label: t('adv.zone.chin') || 'Menton', basePresetId: mentonP?.preset_id, subs: [ 
          { label: t('adv.menton.principal') || 'Menton', avanceKey: 'menton_adv', data: mentonP?.avance?.menton_adv }, 
          { label: t('adv.menton.sup') || 'Supérieur', avanceKey: 'menton_sup', data: mentonP?.avance?.menton_sup }, 
      ] },
      { id: 'tab-machoire', label: t('adv.zone.jaw') || 'Mâchoire', basePresetId: machoireP?.preset_id, subs: [ 
          { label: t('adv.machoire.principal') || 'Mâchoire', avanceKey: 'machoire_adv', data: machoireP?.avance?.machoire_adv }, 
          { label: t('adv.machoire.maxillaire') || 'Maxillaire', avanceKey: 'maxillaire', data: machoireP?.avance?.maxillaire }, 
          { label: t('adv.machoire.mandibule') || 'Mandibule', avanceKey: 'mandibule', data: machoireP?.avance?.mandibule }, 
      ] },
    ];

    // Build Tabs Navigation
    let tabsHtml = `<div class="flex flex-nowrap gap-x-8 overflow-x-auto border-b border-white/10 hide-scrollbar bg-surface-container-highest/30 shrink-0 px-6 pt-2">`;
    
    // Build Content Grid
    let contentHtml = `<div class="flex-1 overflow-y-auto p-md lg:p-lg flex flex-col gap-md custom-scrollbar relative">`;

    advZones.forEach((zone, index) => {
        const isActive = index === 0;
        const tabActiveClasses = isActive 
            ? 'border-primary-container text-primary-container bg-primary-container/5' 
            : 'border-transparent text-on-surface-variant hover:text-primary-container';

        tabsHtml += `
            <button onclick="switchAdvTab('${zone.id}')" id="btn-${zone.id}" class="adv-tab-btn flex items-center gap-xs px-2 py-3 border-b-[2px] ${tabActiveClasses} font-label-caps text-[14px] whitespace-nowrap transition-colors">
                ${zone.label}
            </button>
        `;

        const baseLabel = zone.basePresetId && zone.basePresetId !== mainPid
            ? `— base Preset ${zone.basePresetId}`
            : `— base Preset ${mainPid}`;

        let gridHtml = `
            <div id="${zone.id}" class="adv-tab-content flex-col gap-md flex-1 ${isActive ? 'flex' : 'hidden'}">
                <div class="flex items-center justify-between border-b border-primary-container/20 pb-sm mb-sm">
                    <h2 class="font-title-sm text-[16px] text-primary-container tracking-widest uppercase font-bold drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">${zone.label} ${baseLabel}</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-md flex-1">
        `;

        zone.subs.forEach(sub => {
            if (!sub.data) return;

            let slidersHtml = '';
            const sliderEntries = Object.entries(sub.data).map(([key, val]) => {
                const safeVal = Number(val ?? (result.preset.avance?.[sub.avanceKey]?.[key] ?? 50));
                const adjVal = sub.noAdjust ? undefined : result.adjustments?.avance?.[sub.avanceKey]?.[key];
                const isModified = adjVal !== undefined && Math.abs(adjVal - safeVal) > 1;
                const displayVal = isModified ? adjVal : safeVal;
                const colorClass = isModified ? 'text-primary-container' : 'text-on-surface';
                const labelName = keyLabels[key] || key;
                const highlightClass = isModified ? 'p-2 -mx-2 rounded bg-primary-container/10 border border-primary-container/30 shadow-[0_0_10px_rgba(0,240,255,0.1)_inset]' : '';
                
                slidersHtml += `
                    <div class="${highlightClass}">
                        <div class="flex items-center justify-between font-label-caps text-[10px] ${isModified ? 'text-primary-container font-bold' : 'text-on-surface-variant'} mb-2">
                            <span>${labelName}</span>
                            <div class="${isModified ? 'bg-primary-container text-black px-2 py-0.5 rounded flex items-center shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'flex items-center gap-xs bg-surface-container-highest px-2 py-0.5 rounded border border-white/10'}">
                                <span class="${isModified ? 'font-bold text-[12px]' : colorClass + ' font-bold text-[14px]'}">${displayVal}</span>
                                ${isModified ? '<span class="text-[8px] ml-1 font-black opacity-80">EDITED</span>' : ''}
                                <button class="${isModified ? 'text-black/60 hover:text-black ml-1' : 'text-on-surface-variant hover:text-primary-container'} transition-colors" title="Copy" onclick="window.copyValue(${displayVal}, this)">
                                    <span class="material-symbols-outlined text-[12px]">content_copy</span>
                                </button>
                            </div>
                        </div>
                        <input type="range" min="0" max="100" value="${displayVal}" disabled class="opacity-80 cursor-not-allowed ${isModified ? 'accent-primary-container' : ''}">
                    </div>
                `;
            });

            if (slidersHtml) {
                gridHtml += `
                    <div class="bg-surface/80 border border-white/5 rounded-lg p-md shadow-sm h-max">
                        <h3 class="font-label-caps text-[13px] text-on-surface mb-md opacity-90 border-l-2 border-primary-container pl-2 uppercase">${sub.label}</h3>
                        <div class="space-y-md">
                            ${slidersHtml}
                        </div>
                    </div>
                `;
            }
        });

        gridHtml += `
                </div>
                <button class="mt-md w-full max-w-[300px] mx-auto py-2 border border-primary-container/30 text-primary-container font-label-caps text-[11px] rounded hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-xs" onclick="alert('Copie globale non implémentée')">
                    <span class="material-symbols-outlined text-[16px]">copy_all</span> COPY ALL ${zone.label.toUpperCase()} SETTINGS
                </button>
            </div>
        `;
        
        contentHtml += gridHtml;
    });

    tabsHtml += `</div>`;
    contentHtml += `</div>`;

    // Export & ID Card Section
    // Construct the zone mix summary string for the card
    let zoneMixArr = [];
    advZones.forEach(z => {
        if (z.id !== 'tab-crane' && z.basePresetId && z.basePresetId !== mainPid) {
            zoneMixArr.push(`<span class="text-white">${z.label.toUpperCase()}:</span> ${z.basePresetId}`);
        }
    });
    let zoneMixStr = zoneMixArr.length > 0 ? zoneMixArr.join(' | ') : 'MODÈLE PUR (Aucun mix)';

    let modSlidersArr = [];
    advZones.forEach(z => {
        z.subs.forEach(sub => {
            if (!sub.data) return;
            Object.entries(sub.data).forEach(([key, val]) => {
                const safeVal = val ?? 50;
                const adjVal = sub.noAdjust ? undefined : result.adjustments?.avance?.[sub.avanceKey]?.[key];
                const isModified = adjVal !== undefined && Math.abs(adjVal - safeVal) > 1;
                if (isModified) {
                    const labelName = keyLabels[key] || key;
                    modSlidersArr.push(`<span class="text-primary-container">${sub.label.substring(0,5).toUpperCase()}:</span> ${labelName} ${adjVal}`);
                }
            });
        });
    });
    let modSlidersStr = modSlidersArr.length > 0 ? modSlidersArr.join('  ') : 'Aucun ajustement IA';

    let idCardHtml = `
        <div class="border-t border-primary-container/20 bg-surface-container/90 p-md shrink-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <div class="relative bg-[#08080A] border border-primary-container p-sm md:p-md rounded-lg mb-md overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMC41IiBmaWxsPSIjMDBmMGZmIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=')] before:opacity-20 before:pointer-events-none" id="result-card">
                <div class="absolute top-0 right-0 bg-primary-container text-black font-label-caps text-[8px] px-2 py-0.5 rounded-bl-md font-bold z-20">CONFIDENTIAL // VERIFIED</div>
                <div class="flex gap-md items-start relative z-10">
                    <div class="w-16 h-16 md:w-20 md:h-20 rounded border border-primary-container/50 overflow-hidden shrink-0 bg-black">
                        <img alt="ID Card Avatar" class="w-full h-full object-cover grayscale contrast-125 mix-blend-lighten" src="app/assets/presets/${result.preset.id}.png">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-display-lg text-[14px] md:text-[16px] text-white tracking-tight leading-none mb-1 shadow-primary-container drop-shadow-md truncate">FC26 RECIPE CARD</h4>
                        <div class="text-[9px] md:text-[10px] font-label-caps text-primary-container tracking-widest mb-2 opacity-80 truncate">Généré par ScanMyFace.tech</div>
                        
                        <div class="font-mono text-[9px] md:text-[10px] text-on-surface-variant leading-tight space-y-1">
                            <div><span class="text-white font-bold">BASE :</span> Tête ${mainPid}</div>
                            <div class="break-words"><span class="text-white font-bold">ZONE MIX :</span> ${zoneMixStr}</div>
                            <div class="break-words"><span class="text-white font-bold">CURSEURS :</span> ${modSlidersStr}</div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-sm items-center">
                <button class="flex-1 w-full py-3 md:py-2 bg-primary-container/10 border border-primary-container text-primary-container font-label-caps text-[11px] hover:bg-primary-container hover:text-black transition-colors rounded flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <span class="material-symbols-outlined text-[16px]">content_copy</span> COPY RECIPE
                </button>
                <button class="flex-1 w-full py-3 md:py-2 bg-transparent border border-primary-container text-primary-container font-label-caps text-[11px] hover:bg-primary-container hover:text-black transition-colors rounded flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(0,240,255,0.2)]" onclick="window.shareResults(${result.preset.id}, this)">
                    <span class="material-symbols-outlined text-[16px]">share</span> SHARE
                </button>
                <button class="flex-1 w-full py-3 md:py-2 bg-primary-container text-black font-label-caps text-[11px] hover:scale-[1.02] transition-transform rounded flex items-center justify-center gap-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold" onclick="window.downloadResult()">
                    <span class="material-symbols-outlined text-[16px]">download</span> DOWNLOAD ID CARD
                </button>
            </div>
            
            <!-- Social Share Fallback -->
            <div class="mt-md flex justify-center items-center gap-md border-t border-white/5 pt-md">
                <span class="font-label-caps text-[10px] text-on-surface-variant uppercase">Partage Rapide :</span>
                <a href="https://twitter.com/intent/tweet?text=Je%20viens%20de%20créer%20mon%20preset%20visage%20pour%20FC26%20avec%20ScanMyFace.tech%20!%20🎮&url=https://scanmyface.tech" target="_blank" class="text-on-surface-variant hover:text-primary-container transition-colors">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.reddit.com/submit?title=Mon%20Preset%20FC26%20via%20ScanMyFace.tech&url=https://scanmyface.tech" target="_blank" class="text-on-surface-variant hover:text-primary-container transition-colors">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 11.5c0-1.654-1.346-3-3-3-.674 0-1.29.226-1.785.602C17.155 7.64 14.656 7 11.93 7l1.79-4 4.96 1.1c.14 1.13 1.1 2 2.26 2 1.24 0 2.25-1.01 2.25-2.25S22.18 1.6 20.94 1.6c-1.01 0-1.85.67-2.14 1.58l-5.32-1.18c-.28-.06-.56.11-.64.38l-2.01 4.5C8.01 6.94 5.35 7.62 3.25 9.102 2.755 8.726 2.139 8.5 1.5 8.5c-1.654 0-3 1.346-3 3 0 1.32.86 2.44 2.05 2.84-.03.22-.05.44-.05.66 0 3.86 4.68 7 10.42 7 5.75 0 10.43-3.14 10.43-7 0-.22-.02-.44-.05-.66 1.19-.4 2.05-1.52 2.05-2.84zM2.38 12.83c-.45-.15-.75-.58-.75-1.06 0-.61.49-1.1 1.1-1.1.25 0 .48.09.67.24-1 1.02-1.02 1.02-.92.92zm18.3 11.45c-2.43 2.18-8.1 2.18-10.53 0-.15-.14-.17-.37-.03-.52.14-.15.37-.17.52-.03 2.1 1.88 7.35 1.88 9.46 0 .15-.14.38-.12.52.03.14.15.12.38-.02.52zm.45-12.51c.19-.15.42-.24.67-.24.61 0 1.1.49 1.1 1.1 0 .48-.3.91-.75 1.06.1-.1.08-.1-.92-.92z"/></svg>
                </a>
            </div>
        </div>
    `;

    container.innerHTML = tabsHtml + contentHtml + idCardHtml;
    applyPremiumUnlockUI();
    console.log("Rendu Façonnage Avancé généré (Nouveau Design)");
}

// Helper JS logic to switch tabs
window.switchAdvTab = function(tabId) {
    // Reset all tabs
    document.querySelectorAll('.adv-tab-btn').forEach(btn => {
        btn.classList.remove('border-primary-container', 'text-primary-container', 'bg-primary-container/5');
        btn.classList.add('border-transparent', 'text-on-surface-variant');
    });
    // Set active tab
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-on-surface-variant');
        activeBtn.classList.add('border-primary-container', 'text-primary-container', 'bg-primary-container/5');
    }
    
    // Hide all content
    document.querySelectorAll('.adv-tab-content').forEach(content => {
        content.classList.remove('flex');
        content.classList.add('hidden');
    });
    // Show active content
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.remove('hidden');
        activeContent.classList.add('flex');
    }
};



// Global function to download the result card using html2canvas
window.downloadResult = async function() {
  const card = document.getElementById('result-card');
    if (!card) return;
    if (typeof html2canvas !== 'function') {
        console.error("html2canvas n'est pas chargé.");
        alert("Le module de téléchargement n'est pas encore disponible. Réessaie dans quelques secondes.");
        return;
    }
    
    try {
    await new Promise(resolve => setTimeout(resolve, 500));
        const canvas = await html2canvas(card, {
            backgroundColor: '#08080A',
            scale: 2, // High resolution
            useCORS: true,
            allowTaint: true
        });
        
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
    link.download = 'ScanMyFace-Result.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
    console.error("Erreur lors de la capture de la carte de résultats:", err);
        alert("Une erreur est survenue lors du téléchargement.");
    }
};

window.downloadIDCard = window.downloadResult;

// Global function to share results (Image generation)
window.shareResults = async function(presetId, shareBtn) {
  const card = document.getElementById('result-card');
    if (!card) return;
    if (typeof html2canvas !== 'function') {
        console.error("html2canvas n'est pas chargé.");
        alert("Le module de partage n'est pas encore disponible. Réessaie dans quelques secondes.");
        return;
    }
    
    // Feedback UI
    const originalText = shareBtn ? shareBtn.innerHTML : '';
    if (shareBtn) {
        shareBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> GENERATING...';
    }
    
    try {
        const canvas = await html2canvas(card, {
            backgroundColor: '#08080A',
            scale: 2,
            useCORS: true,
            allowTaint: true
        });
        
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'ScanMyFace_Recipe.png', { type: 'image/png' });
            const shareData = {
                title: 'ScanMyFace - Mon Preset FC26',
                text: `Je viens de créer mon preset visage pour FC26 avec ScanMyFace.tech ! 🎮 ID Preset : ${presetId}\n\nRejoins-nous sur https://scanmyface.tech`,
                files: [file]
            };
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
            } else {
                // Fallback: Download instead if sharing files is not supported
                const dataUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'ScanMyFace_Recipe.png';
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(dataUrl);
                alert('Partage natif non supporté. Image téléchargée !');
            }
            if (shareBtn) shareBtn.innerHTML = originalText;
        }, 'image/png');
    } catch (err) {
        console.error('Erreur lors du partage:', err);
        if (shareBtn) shareBtn.innerHTML = originalText;
        alert("Une erreur est survenue lors de la préparation de l'image.");
    }
};
