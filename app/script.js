// ============================================================
// FC26 CRANIUM ANALYZER — PRESET MATCHER v1.0
// ============================================================

// --- 1. SURVIVAL & i18n BLOCK ---
let capturedBase64 = null;
let capturedCanvas = null;
let cropper = null;
let currentLang = 'fr';

const state = {
    results: null,
    zoneMix: null,
    pendingAnalysis: null,
    isPremium: false
};

const i18n = {
    fr: {
        // === ÉCRANS PRINCIPAUX ===
        'app.title': 'FC26 CRANIUM',
        'app.title.cranium': 'CRANIUM',
        'app.subtitle': 'Pro Face Geometry Analyzer',
        'screen.scan.title': 'Scanning',
        'screen.preset.title': 'Choix du Modèle',
        'preset.head': 'TÊTE',
        'screen.results.title': 'Résultats',
        'screen.premium.title': 'Premium',
        
        // === BOUTONS PRINCIPAUX ===
        'btn.camera': 'Live Camera',
        'btn.upload': 'Upload Photo',
        'btn.capture': 'Capturer & Analyser',
        'btn.analyze.upload': 'Analyser la Photo',
        'btn.retake': '↩ Reprendre',
        'btn.confirm.analyze': '✓ Confirmer & Analyser',
        'btn.choose': 'Choisir',
        'btn.unlock.all': 'Déverrouiller Tout',
        'btn.get.premium': 'Obtenir Premium',
        'btn.unlock.now': 'Déverrouiller Maintenant',
        'btn.share': 'Partager',
        
        // === ZONES FACIALES ===
        'zone.front': 'Front',
        'zone.machoire': 'Mâchoire',
        'zone.joues': 'Joues',
        'zone.menton': 'Menton',
        'zone.oreilles': 'Oreilles',
        'zone.cou': 'Cou',
        'zone.yeux': 'Yeux',
        'zone.sourcils': 'Sourcils',
        'zone.nez': 'Nez',
        'zone.bouche': 'Bouche',
        
        // === ZONES AVANCÉES ===
        'adv.zone.head': 'Tête',
        'adv.zone.front': 'Front',
        'adv.zone.brows': 'Sourcils',
        'adv.zone.eyes': 'Yeux',
        'adv.zone.nose': 'Nez',
        'adv.zone.cheeks': 'Joues',
        'adv.zone.mouth': 'Bouche',
        'adv.zone.chin': 'Menton',
        'adv.zone.jaw': 'Mâchoire',
        
        // === SOUS-LABELS AVANCÉS ===
        'adv.crane.principal': 'Crâne principal',
        'adv.crane.couronne': 'Couronne',
        'adv.crane.arriere': 'Arrière du crâne',
        'adv.crane.tempes': 'Tempes',
        'adv.front.sup': 'Partie supérieure',
        'adv.front.inf': 'Partie inférieure',
        'adv.sourcils.principal': 'Sourcils',
        'adv.sourcils.centre': 'Partie centrale',
        'adv.sourcils.ext': 'Partie extérieure',
        'adv.yeux.principal': 'Yeux',
        'adv.yeux.orbites': 'Orbites',
        'adv.nez.principal': 'Nez principal',
        'adv.nez.arete.cotes': 'Arête côtés',
        'adv.nez.arete.centre': 'Arête centrale',
        'adv.nez.arete.sup': 'Arête supérieure',
        'adv.joues.principal': 'Joues',
        'adv.bouche.principal': 'Bouche',
        'adv.bouche.ext': 'Extérieur sup.',
        'adv.menton.principal': 'Menton',
        'adv.menton.sup': 'Partie supérieure',
        'adv.machoire.principal': 'Mâchoire',
        'adv.machoire.maxillaire': 'Maxillaire',
        'adv.machoire.mandibule': 'Mandibule',
        
        // === KEY LABELS POUR SLIDERS ===
        'slider.re': 'Réduire/Élargir',
        'slider.bh': 'Bas/Haut',
        'slider.na': 'Neutre/Avant',
        'slider.aa': 'Arrière/Avant',
        'slider.ang': 'Arrondi/Angulaire',
        'slider.gd': 'Gauche/Droite',
        'slider.nr': 'Neutre/Arrondi',
        'slider.nh': 'Neutre/Haut',
        'slider.gp': 'Plus grande/Petite',
        
        // === CONFIRMATION MORPHOLOGIE ===
        'morph.confirm.title': 'CONFIRMATION',
        'morph.lips.question': '1. Tes lèvres sont :',
        'morph.nose.question': '2. Ton nez est :',
        'morph.jaw.question': '3. Ta mâchoire est :',
        'morph.lips.fine': 'Fines',
        'morph.lips.medium': 'Moyennes',
        'morph.lips.full': 'Pleines',
        'morph.nose.fine': 'Fin',
        'morph.nose.medium': 'Moyen',
        'morph.nose.large': 'Large',
        'morph.jaw.fine': 'Fine',
        'morph.jaw.medium': 'Moyenne',
        'morph.jaw.large': 'Large',
        'morph.confirm.btn': 'CONFIRMER',
        
        // === RÉSULTATS & INSTRUCTIONS ===
        'results.title': '🎯 Résultat pour ton visage',
        'step1.title': 'ÉTAPE 1 — Choisis cette tête dans FC26 :',
        'step2.title': 'ÉTAPE 2 — Onglet Tête',
        'step2.desc': 'Dans FC26, onglet Tête — une tête par zone',
        'adv.title': 'Façonnage Avancé',
        'adv.desc': 'Active "Façonnage Avancé" dans FC26 puis applique ces valeurs',
        
        // === QUALITÉ AUDIO/VIDÉO ===
        'qa.noface': 'Aucun visage détecté. Réessaie.',
        'qa.blur': 'Photo trop floue. Prends une photo plus nette.',
        'qa.light': 'Éclairage insuffisant. Trouve un endroit plus lumineux.',
        'qa.angle': 'Tiens ta tête droite face à la caméra.',
        
        // === CHARGEMENT & MESSAGES ===
        'loading.landmarks': 'Détection de 468 points faciaux...',
        'copied': 'Copié !',
        'preset.id': 'ID Preset',
        
        // === BADGE & PREMIUM ===
        'badge.free': 'Free Tier',
        'divider.or': 'OU',
        'preset.message': 'L\'IA a trouvé ces 3 modèles. Lequel te semble le plus proche ?',
        'premium.gate.text': 'Déverrouille 6 zones avancées supplémentaires (Crâne, Menton, Sourcils, Front, Bouche, Oreilles) et l\'Export PDF.',
        'premium.hero.sub': 'Obtiens l\'avantage concurrentiel dans FC26',
        'premium.access': 'ACCÈS PRO',
        'premium.feat1': '✓ Déverrouille les 10 zones faciales',
        'premium.feat2': '✓ Mappage de précision extrême',
        'premium.feat3': '✓ Exporte la feuille de sliders en PDF',
        'premium.feat4': '✓ Sans publicités',
        'premium.price': '$4.99',
        'premium.period': 'une seule fois',
        
        // === TONES DE PEAU ===
        'skin.tone.very.light': 'Très claire',
        'skin.tone.light': 'Claire',
        'skin.tone.light.tanned': 'Claire-bronzée',
        'skin.tone.medium': 'Métisse',
        'skin.tone.dark': 'Foncée',
        'skin.tone.very.dark': 'Très foncée',
        'skin.confirm': 'Confirme ta teinte de peau',
        'skin.ai.suggests': 'L\'IA suggère :',
        
        // === ALERTES ===
        'alert.camera.permission': 'Accès à la caméra impossible. Vérifie les permissions.',
        'alert.camera.not.supported': 'Ton navigateur ne supporte pas la capture vidéo.',
        'alert.no.face': 'Aucun visage détecté. Réessaie avec une autre photo.',
        'alert.share.not.supported': 'L\'API Web Share n\'est pas supportée sur ce navigateur.'
    },
    en: {
        // === MAIN SCREENS ===
        'app.title': 'FC26 CRANIUM',
        'app.title.cranium': 'CRANIUM',
        'app.subtitle': 'Pro Face Geometry Analyzer',
        'screen.scan.title': 'Scanning',
        'screen.preset.title': 'Choose Model',
        'preset.head': 'HEAD',
        'screen.results.title': 'Results',
        'screen.premium.title': 'Premium',
        
        // === MAIN BUTTONS ===
        'btn.camera': 'Live Camera',
        'btn.upload': 'Upload Photo',
        'btn.capture': 'Capture & Analyze',
        'btn.analyze.upload': 'Analyze Photo',
        'btn.retake': '↩ Retake',
        'btn.confirm.analyze': '✓ Confirm & Analyze',
        'btn.choose': 'Choose',
        'btn.unlock.all': 'Unlock All',
        'btn.get.premium': 'Get Premium',
        'btn.unlock.now': 'Unlock Now',
        'btn.share': 'Share',
        
        // === FACIAL ZONES ===
        'zone.front': 'Forehead',
        'zone.machoire': 'Jaw',
        'zone.joues': 'Cheeks',
        'zone.menton': 'Chin',
        'zone.oreilles': 'Ears',
        'zone.cou': 'Neck',
        'zone.yeux': 'Eyes',
        'zone.sourcils': 'Brows',
        'zone.nez': 'Nose',
        'zone.bouche': 'Mouth',
        
        // === ADVANCED ZONES ===
        'adv.zone.head': 'Head',
        'adv.zone.front': 'Forehead',
        'adv.zone.brows': 'Brows',
        'adv.zone.eyes': 'Eyes',
        'adv.zone.nose': 'Nose',
        'adv.zone.cheeks': 'Cheeks',
        'adv.zone.mouth': 'Mouth',
        'adv.zone.chin': 'Chin',
        'adv.zone.jaw': 'Jaw',
        
        // === ADVANCED SUB-LABELS ===
        'adv.crane.principal': 'Main Skull',
        'adv.crane.couronne': 'Crown',
        'adv.crane.arriere': 'Back of Head',
        'adv.crane.tempes': 'Temples',
        'adv.front.sup': 'Upper Part',
        'adv.front.inf': 'Lower Part',
        'adv.sourcils.principal': 'Brows',
        'adv.sourcils.centre': 'Central Part',
        'adv.sourcils.ext': 'Outer Part',
        'adv.yeux.principal': 'Eyes',
        'adv.yeux.orbites': 'Eye Sockets',
        'adv.nez.principal': 'Main Nose',
        'adv.nez.arete.cotes': 'Bridge Sides',
        'adv.nez.arete.centre': 'Bridge Center',
        'adv.nez.arete.sup': 'Upper Bridge',
        'adv.joues.principal': 'Cheeks',
        'adv.bouche.principal': 'Mouth',
        'adv.bouche.ext': 'Upper Exterior',
        'adv.menton.principal': 'Chin',
        'adv.menton.sup': 'Upper Part',
        'adv.machoire.principal': 'Jaw',
        'adv.machoire.maxillaire': 'Maxilla',
        'adv.machoire.mandibule': 'Mandible',
        
        // === KEY LABELS FOR SLIDERS ===
        'slider.re': 'Reduce/Widen',
        'slider.bh': 'Down/Up',
        'slider.na': 'Neutral/Forward',
        'slider.aa': 'Back/Forward',
        'slider.ang': 'Rounded/Angular',
        'slider.gd': 'Left/Right',
        'slider.nr': 'Neutral/Rounded',
        'slider.nh': 'Neutral/Up',
        'slider.gp': 'Larger/Smaller',
        
        // === MORPHOLOGY CONFIRMATION ===
        'morph.confirm.title': 'CONFIRMATION',
        'morph.lips.question': '1. Your lips are:',
        'morph.nose.question': '2. Your nose is:',
        'morph.jaw.question': '3. Your jaw is:',
        'morph.lips.fine': 'Thin',
        'morph.lips.medium': 'Medium',
        'morph.lips.full': 'Full',
        'morph.nose.fine': 'Thin',
        'morph.nose.medium': 'Medium',
        'morph.nose.large': 'Large',
        'morph.jaw.fine': 'Thin',
        'morph.jaw.medium': 'Medium',
        'morph.jaw.large': 'Large',
        'morph.confirm.btn': 'CONFIRM',
        
        // === RESULTS & INSTRUCTIONS ===
        'results.title': '🎯 Result for your face',
        'step1.title': 'STEP 1 — Choose this head in FC26:',
        'step2.title': 'STEP 2 — Head Tab',
        'step2.desc': 'In FC26, Head tab — one head per zone',
        'adv.title': 'Advanced Sculpting',
        'adv.desc': 'Enable "Advanced Sculpting" in FC26 then apply these values',
        
        // === QUALITY CHECKS ===
        'qa.noface': 'No face detected. Try again.',
        'qa.blur': 'Photo too blurry. Take a clearer photo.',
        'qa.light': 'Insufficient lighting. Find a brighter spot.',
        'qa.angle': 'Keep your head straight facing the camera.',
        
        // === LOADING & MESSAGES ===
        'loading.landmarks': 'Detecting 468 facial landmarks...',
        'copied': 'Copied!',
        'preset.id': 'Preset ID',
        
        // === BADGE & PREMIUM ===
        'badge.free': 'Free Tier',
        'divider.or': 'OR',
        'preset.message': 'The AI found these 3 models. Which one looks closest to you?',
        'premium.gate.text': 'Unlock 6 advanced zones (Head, Chin, Brows, Forehead, Mouth, Ears) and PDF Export.',
        'premium.hero.sub': 'Get the competitive edge in FC26',
        'premium.access': 'PRO ACCESS',
        'premium.feat1': '✓ Unlock all 10 facial zones',
        'premium.feat2': '✓ Pinpoint accuracy mapping',
        'premium.feat3': '✓ Export slider sheet to PDF',
        'premium.feat4': '✓ No ads',
        'premium.price': '$4.99',
        'premium.period': 'one-time',
        
        // === SKIN TONES ===
        'skin.tone.very.light': 'Very Light',
        'skin.tone.light': 'Light',
        'skin.tone.light.tanned': 'Light-Tanned',
        'skin.tone.medium': 'Medium',
        'skin.tone.dark': 'Dark',
        'skin.tone.very.dark': 'Very Dark',
        'skin.confirm': 'Confirm your skin tone',
        'skin.ai.suggests': 'The AI suggests:',
        
        // === ALERTS ===
        'alert.camera.permission': 'Camera access denied. Please check your permissions.',
        'alert.camera.not.supported': 'Your browser does not support video capture.',
        'alert.no.face': 'No face detected. Please try another photo.',
        'alert.share.not.supported': 'Web Share API is not supported on this browser.',
        'btn.unlock.now': 'Unlock Now'
    }
};

window.setLanguage = function(lang) {
    if (!i18n[lang]) return;
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn) btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (el) {
            const key = el.dataset.i18n;
            if (i18n[lang][key]) el.textContent = i18n[lang][key];
        }
    });
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
};

window.t = function(key) {
    return i18n[currentLang] && i18n[currentLang][key] ? i18n[currentLang][key] : key;
};

// Global handles for Survival
let btnCamera, fileUpload, screens, navButtons, btnCapture, btnAnalyzeUpload, inputVideo, inputImage, outputCanvas, canvasCtx, loadingIndicator, resultsAccordion, btnShare, btnPurchase, reviewButtons, btnRetake, btnConfirmAnalyze;

window.addEventListener('DOMContentLoaded', () => {
    // Basic elements
    screens = document.querySelectorAll('.screen');
    navButtons = document.querySelectorAll('[data-target]');
    fileUpload = document.getElementById('file-upload');
    btnCamera = document.getElementById('btn-camera');
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
    if (btnCamera) btnCamera.addEventListener('click', () => { if (typeof startLiveScan === 'function') startLiveScan(); });
    if (fileUpload) fileUpload.addEventListener('change', (e) => { if (typeof handleFileUpload === 'function') handleFileUpload(e); });
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

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            setLanguage(btn.dataset.lang);
        });
    });
    setLanguage('fr');
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
// Cache des stats DB (min/max) pour normalisation 0-1 des métriques
let _dbStatsCache = null;
function getDbStats() {
  if (_dbStatsCache) return _dbStatsCache;
  const fields = ['nez','machoire','joues','bouche','yeux','sourcils',
                  'eyebrowGap','lipFullness','noseFlare','philtrum',
                  'cheekProminence','eyeHeightPos'];
  const mn = {}, mx = {};
  for (const key of fields) {
    const vals = PRESETS_DB.map(p => p.ratios_cibles?.[key]).filter(v => v != null && isFinite(v));
    mn[key] = Math.min(...vals);
    mx[key] = Math.max(...vals);
  }
  _dbStatsCache = { mn, mx };
  return _dbStatsCache;
}

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

// Algorithme : Matching Pondéré avec voisinage peau et règle asiatique
function computePresetScore(ratios, skinTone, preset) {
  const resolvedSkinTone = normalizeSkinToneLabel(skinTone);

  // A. Voisinage peau — éliminatoire si hors voisinage
  const neighborhoods = {
    "Claire":        ["Claire", "Claire-bronzée"],
    "Claire-bronzée":["Claire", "Claire-bronzée", "Métis"],
    "Métis":         ["Claire-bronzée", "Métis", "Foncée"],
    "Foncée":        ["Métis", "Foncée", "Très foncée"],
    "Très foncée":   ["Foncée", "Très foncée"],
  };
  const allowed = neighborhoods[resolvedSkinTone] ?? [resolvedSkinTone];
  if (!allowed.includes(preset.couleur_peau)) return 0;

  const rc = preset.ratios_cibles;
  if (!rc || rc.nez === null) return 20;

  // B. Erreurs pondérées — chaque métrique normalisée 0-1 sur le range DB
  const { mn, mx } = getDbStats();
  const norm = (val, key) => {
    const range = mx[key] - mn[key];
    const numericVal = Number(val);
    if (!Number.isFinite(range) || range === 0 || !Number.isFinite(numericVal)) return 0;
    return (numericVal - mn[key]) / range;
  };
  const normRC = (key) => {
    const range = mx[key] - mn[key];
    const numericVal = Number(rc[key]);
    if (!Number.isFinite(range) || range === 0 || !Number.isFinite(numericVal)) return 0;
    return (numericVal - mn[key]) / range;
  };

  // Poids Extrême ×10 — Ancreurs Fixes (impossibles à corriger par sliders)
  const errLipFullness  = Math.abs(norm(ratios.lipFullness,     'lipFullness')      - normRC('lipFullness'))      * 10;
  const errNoseFlare    = Math.abs(norm(ratios.noseFlare,       'noseFlare')        - normRC('noseFlare'))        * 10;
  const errPhiltrum     = Math.abs(norm(ratios.philtrum,        'philtrum')         - normRC('philtrum'))         * 10;
  const errCheekProm    = Math.abs(norm(ratios.cheekProminence, 'cheekProminence')  - normRC('cheekProminence'))  * 10;
  const errEyebrowGap   = Math.abs(norm(ratios.eyebrowGap,      'eyebrowGap')       - normRC('eyebrowGap'))       * 10;
  // Poids Faible ×1 — Ajustables (corrigibles via façonnage 0-100)
  const errNez          = Math.abs(norm(ratios.noseToInterEye,      'nez')          - normRC('nez'))              * 1;
  const errMachoire     = Math.abs(norm(ratios.jawToFaceRatio,      'machoire')     - normRC('machoire'))         * 1;
  const errJoues        = Math.abs(norm(ratios.cheekToFaceRatio,    'joues')        - normRC('joues'))            * 1;
  const errBouche       = Math.abs(norm(ratios.mouthToFace,         'bouche')       - normRC('bouche'))           * 1;
  const errYeux         = Math.abs(norm(ratios.eyeOpenness,         'yeux')         - normRC('yeux'))             * 1;
  const errSourcils     = Math.abs(norm(ratios.eyebrowHeightRatio,  'sourcils')     - normRC('sourcils'))         * 1;
  const errEyeHeightPos = Math.abs(norm(ratios.eyeHeightPos,        'eyeHeightPos') - normRC('eyeHeightPos'))     * 1;

  let totalError = errLipFullness + errNoseFlare + errPhiltrum + errCheekProm + errEyebrowGap +
                   errNez + errMachoire + errJoues + errBouche + errYeux + errSourcils + errEyeHeightPos;

  // C. Règle asiatique : mega-pénalité si preset asiatique mais yeux non bridés
  if (preset.notes && /asiatique/i.test(preset.notes) && (ratios.eyeOpenness || 0) > 0.075) {
    totalError += 50;
  }

  // D. Score final — normalisation par le poids max (57) pour garder l'échelle 0-100
  // sum des poids = 10×5 + 1×7 = 57
  return Math.max(0, 100 - (totalError / 57) * 100);
}

// ─── 7. SÉLECTION DU MEILLEUR PRESET ──────────────────────
function selectBestPreset(landmarks, skinTone) {
  const ratios = Array.isArray(landmarks) ? extractMorphRatios(landmarks) : (landmarks || {});
  const resolvedSkinTone = normalizeSkinToneLabel(skinTone);
  const neighborhoods = {
    "Claire":        ["Claire", "Claire-bronzée"],
    "Claire-bronzée":["Claire", "Claire-bronzée", "Métis"],
    "Métis":         ["Claire-bronzée", "Métis", "Foncée"],
    "Foncée":        ["Métis", "Foncée", "Très foncée"],
    "Très foncée":   ["Foncée", "Très foncée"],
  };
  const allowedSkinTones = neighborhoods[resolvedSkinTone] ?? [resolvedSkinTone];
  const candidates = PRESETS_DB.filter(p => allowedSkinTones.includes(p.couleur_peau));
  const scoringPool = candidates.length > 0 ? candidates : PRESETS_DB;
  let bestPreset = null;
  let bestScore  = -1;
  const scores   = [];

  for (const preset of scoringPool) {
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
  const skinMap = { "Claire": 0, "Claire-bronzée": 1, "Métis": 2, "Foncée": 3, "Très foncée": 4 };
  const mainSkinLevel = skinMap[mainPreset.couleur_peau] ?? 0;

  // Candidats : filtre peau ±2 crans
  const candidates = allPresets.filter(p =>
    Math.abs((skinMap[p.couleur_peau] ?? 0) - mainSkinLevel) <= 2
  );

  console.log(`🔬 [ZoneMix] mainPreset #${mainPreset.preset_id} peau="${mainPreset.couleur_peau}" (lvl ${mainSkinLevel}) → ${candidates.length}/${allPresets.length} candidats (filtre peau ±2)`);

  function bestForZoneMath(scoreFn, dbgName) {
    let best = mainPreset;
    let bestError = scoreFn(mainPreset);
    if (dbgName) console.group(`🔬 [ZoneMix ${dbgName}] mainPreset #${mainPreset.preset_id} error=${bestError}`);
    for (const p of candidates) {
      if (p.preset_id === mainPreset.preset_id) continue;
      const error = scoreFn(p);
      if (dbgName) console.log(`  #${p.preset_id} [${p.couleur_peau}] → error=${error}${error < bestError ? ' ★ MEILLEUR' : ''}`);
      if (error < bestError) { bestError = error; best = p; }
    }
    if (dbgName) { console.log(`  ✅ WINNER: Preset #${best.preset_id} [${best.couleur_peau}]`); console.groupEnd(); }
    return best.preset_id;
  }

  // Helper to safely get preset ratios
  const getPRatio = (p, key) => p.ratios_cibles && p.ratios_cibles[key] !== undefined ? p.ratios_cibles[key] : 0;
  const getURatio = (key) => detectedMorpho[key] || 0;

  // NEZ
  const nezPreset = bestForZoneMath(p => {
    return (Math.abs(getURatio('noseFlare') - getPRatio(p, 'noseFlare')) * 20) + 
           (Math.abs(getURatio('philtrum') - getPRatio(p, 'philtrum')) * 10) + 
           (Math.abs(getURatio('noseToInterEye') - getPRatio(p, 'nez')) * 1);
  }, 'NEZ');

  // BOUCHE
  const bouchePreset = bestForZoneMath(p => {
    return (Math.abs(getURatio('lipFullness') - getPRatio(p, 'lipFullness')) * 20) + 
           (Math.abs(getURatio('mouthToFace') - getPRatio(p, 'bouche')) * 1);
  }, 'BOUCHE');

  // YEUX/SOURCILS
  const yeuxPreset = bestForZoneMath(p => {
    return (Math.abs(getURatio('eyebrowGap') - getPRatio(p, 'eyebrowGap')) * 15) + 
           (Math.abs(getURatio('eyeOpenness') - getPRatio(p, 'yeux')) * 10) + 
           (Math.abs(getURatio('eyebrowHeightRatio') - getPRatio(p, 'sourcils')) * 1);
  }, 'YEUX/SOURCILS');

  // JOUES/MÂCHOIRE
  const machoirePreset = bestForZoneMath(p => {
    return (Math.abs(getURatio('cheekProminence') - getPRatio(p, 'cheekProminence')) * 15) + 
           (Math.abs(getURatio('jawToFaceRatio') - getPRatio(p, 'machoire')) * 1) + 
           (Math.abs(getURatio('cheekToFaceRatio') - getPRatio(p, 'joues')) * 1);
  }, 'JOUES/MÂCHOIRE');

  // FRONT
  function bestForZoneLabel(labelKey, userLevel, orderMap) {
    let best = mainPreset;
    let bestScore = mainPreset[labelKey] != null ? 2 - Math.abs((orderMap[mainPreset[labelKey]] ?? 1) - userLevel) : 0;
    for (const p of candidates) {
      if (p.preset_id === mainPreset.preset_id) continue;
      const s = p[labelKey] != null ? 2 - Math.abs((orderMap[p[labelKey]] ?? 1) - userLevel) : 0;
      if (s > bestScore) { bestScore = s; best = p; }
    }
    return best.preset_id;
  }
  const fwRatio = detectedMorpho.foreheadWidthRatio ?? 0;
  const userFrontLevel = fwRatio > 0.88 ? 2 : fwRatio > 0.78 ? 1 : 0;
  const frontOrder = { "Étroit": 0, "Moyen": 1, "Large": 2 };
  const frontPreset = bestForZoneLabel('front_label', userFrontLevel, frontOrder);

  return {
    front:    frontPreset,
    machoire: machoirePreset,
    joues:    machoirePreset,
    nez:      nezPreset,
    bouche:   bouchePreset,
    menton:   mainPreset.preset_id,
    oreilles: mainPreset.preset_id,
    cou:      mainPreset.preset_id,
    yeux:     yeuxPreset,
    sourcils: yeuxPreset,
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
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then(function(stream) {
            window.localStream = stream;
            inputVideo.srcObject = stream;
            inputVideo.muted = true;
            inputVideo.play().catch(e => console.error("Erreur play:", e));
        })
        .catch(function(error) {
            console.error("Erreur caméra:", error);
            alert(t("alert.camera.permission"));
        });
    } else {
        alert(t("alert.camera.not.supported"));
    }
}

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
    };
    inputImage.src = dataUrl;
    inputImage.classList.remove('hidden');
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
        if (quality.reason === 'no_face') showQAWarning(t('qa.noface'));
        else if (quality.reason === 'too_blurry') showQAWarning(t('qa.blur'));
        else if (quality.reason === 'bad_lighting') showQAWarning(t('qa.light'));
        else if (quality.reason === 'bad_angle') showQAWarning(t('qa.angle'));
        reviewButtons.classList.remove('hidden');
        return;
    }

    const img = new Image();
    img.onload = async () => {
        outputCanvas.width  = img.naturalWidth;
        outputCanvas.height = img.naturalHeight;
        await faceMesh.send({ image: img });
        loadingIndicator.classList.add('hidden');
    };
    img.src = imageDataUrl;
}

async function analyzeUpload() {
    loadingIndicator.classList.remove('hidden');
    
    const base64Image = inputImage.src.includes(',') ? inputImage.src.split(',')[1] : inputImage.src;
    const quality = await checkPhotoQuality(base64Image);
    if (!quality.ok) {
        loadingIndicator.classList.add('hidden');
        if (quality.reason === 'no_face') showQAWarning(t('qa.noface'));
        else if (quality.reason === 'too_blurry') showQAWarning(t('qa.blur'));
        else if (quality.reason === 'bad_lighting') showQAWarning(t('qa.light'));
        else if (quality.reason === 'bad_angle') showQAWarning(t('qa.angle'));
        return;
    }

    const img = new Image();
    img.onload = async () => {
        await faceMesh.send({ image: img });
        loadingIndicator.classList.add('hidden');
    };
    img.src = inputImage.src;
}

// --- Results Callback ---
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    if (results.image) {
        canvasCtx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);
    }

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        const qa = checkCaptureQuality(landmarks, outputCanvas);
        if (!qa.ok) {
            loadingIndicator.classList.add('hidden');
            showQAWarning(qa.reason);
            return;
        }

        drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#00f0ff'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#00f0ff'});

        detectSkinToneFromCanvas(results.image, landmarks, (skinTone, skinMeta) => {
            loadingIndicator.classList.add('hidden');

            const { bestPreset, ratios, scores } = selectBestPreset(landmarks, skinTone);

            const top3 = scores.slice(0, 3)
                .map(s => ({ preset: PRESETS_DB.find(p => p.preset_id === s.preset_id), score: s.score }))
                .filter(item => item.preset);

            state.pendingAnalysis = { landmarks, skinTone, skinMeta, scores };

            showPresetChoiceScreen(top3);
        });
    } else {
        loadingIndicator.classList.add('hidden');
        if (!inputVideo.classList.contains('hidden') === false) {
            alert(t("alert.no.face"));
        }
    }
    canvasCtx.restore();
}

// ─── PRESET CHOICE SCREEN ──────────────────────────────────────
function showPresetChoiceScreen(top3) {
    const grid = document.getElementById('preset-grid');
  state.pendingTop3 = top3;
    grid.innerHTML = '';

    top3.forEach(({ preset, score }) => {
      const scorePercent = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
        const card = document.createElement('div');
        card.className = 'preset-choice-card';
        card.innerHTML = `
            <img src="./assets/presets/${preset.preset_id}.png"
                 alt="Preset ${preset.preset_id}"
                 onerror="this.style.opacity='0.3'"
                 class="preset-choice-img">
        <div class="preset-choice-id">${t('preset.head')} #${preset.preset_id}</div>
            <div class="preset-choice-score">${scorePercent}%</div>
            <button class="preset-choice-btn" data-id="${preset.preset_id}">${t('btn.choose')}</button>
        `;
        card.querySelector('.preset-choice-btn').addEventListener('click', () => {
            selectPreset(preset.preset_id);
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

    const zoneMix = computeZoneMix(ratios, chosenPreset, PRESETS_DB);
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
        ratios,
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
        label: t('adv.zone.head'), icon: '👤', basePresetId: craneP?.preset_id,
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
        label: t('adv.zone.front'), icon: '🗣️', basePresetId: frontP?.preset_id,
        subs: [
          { label: t('adv.front.sup'), avanceKey: 'front_sup', data: frontP?.avance?.front_sup },
          { label: t('adv.front.inf'), avanceKey: 'front_inf', data: frontP?.avance?.front_inf },
        ]
      },
      {
        label: t('adv.zone.brows'), icon: '👁️', basePresetId: sourcilsP?.preset_id,
        subs: [
          { label: t('adv.sourcils.principal'),           avanceKey: 'sourcils',     data: sourcilsP?.avance?.sourcils },
          { label: t('adv.sourcils.centre'),    avanceKey: 'sourcils_ctr', data: sourcilsP?.avance?.sourcils_ctr },
          { label: t('adv.sourcils.ext'),  avanceKey: 'sourcils_ext', data: sourcilsP?.avance?.sourcils_ext },
        ]
      },
      {
        label: t('adv.zone.eyes'), icon: '👁️', basePresetId: yeuxP?.preset_id,
        subs: [
          { label: t('adv.yeux.principal'),    avanceKey: 'yeux',    data: yeuxP?.avance?.yeux },
          { label: t('adv.yeux.orbites'), avanceKey: 'orbites', data: yeuxP?.avance?.orbites },
        ]
      },
      {
        label: t('adv.zone.nose'), icon: '👃', basePresetId: nezP?.preset_id,
        subs: [
          { label: t('adv.nez.principal'),    avanceKey: 'nez_adv',        data: nezP?.avance?.nez_adv },
          { label: t('adv.nez.arete.cotes'),      avanceKey: 'arete_cotes',    data: nezP?.avance?.arete_cotes },
          { label: t('adv.nez.arete.centre'),   avanceKey: 'arete_centrale', data: nezP?.avance?.arete_centrale },
          { label: t('adv.nez.arete.sup'), avanceKey: 'arete_sup',      data: nezP?.avance?.arete_sup },
        ]
      },
      {
        label: t('adv.zone.cheeks'), icon: '😊', basePresetId: jouesP?.preset_id,
        subs: [
          { label: t('adv.joues.principal'), avanceKey: 'joues_adv', data: jouesP?.avance?.joues_adv },
        ]
      },
      {
        label: t('adv.zone.mouth'), icon: '👄', basePresetId: boucheP?.preset_id,
        subs: [
          { label: t('adv.bouche.principal'),         avanceKey: 'bouche_adv', data: boucheP?.avance?.bouche_adv },
          { label: t('adv.bouche.ext'), avanceKey: 'bouche_ext', data: boucheP?.avance?.bouche_ext },
        ]
      },
      {
        label: t('adv.zone.chin'), icon: '🫦', basePresetId: mentonP?.preset_id,
        subs: [
          { label: t('adv.menton.principal'),            avanceKey: 'menton_adv', data: mentonP?.avance?.menton_adv },
          { label: t('adv.menton.sup'), avanceKey: 'menton_sup', data: mentonP?.avance?.menton_sup },
        ]
      },
      {
        label: t('adv.zone.jaw'), icon: '💪', basePresetId: machoireP?.preset_id,
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
