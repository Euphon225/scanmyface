/* ═══════════════════════════════════════════════════════════════════
 * ScanMyFace V2 — SPA Bridge  (script_spa.js)
 * ═══════════════════════════════════════════════════════════════════ */
'use strict';

const SMF = { AZURE: 'https://scanmyface-site-hdbheranbyd8htc5.germanywestcentral-01.azurewebsites.net' };

// ─── i18n ─────────────────────────────────────────────────────────────
const TR = {
  fr:{
    step1_sub:'Une photo · les sliders exacts · prêts à coller dans FC26.',
    btn_camera:'📷 Caméra live', btn_gallery:'🖼 Charger une photo',
    btn_capture:'📸 Capturer', btn_launch:'Lancer l\'analyse',
    btn_crop_ok:'✓ Confirmer', btn_crop_retry:'↩ Reprendre',
    btn_new_scan:'↩ Nouveau scan', btn_copy:'📋 Copier la recette',
    btn_share:'📤 PNG', scan_wait:'Chargez une photo ou ouvrez la caméra',
    analyzing:'Analyse en cours…', no_face:'Aucun visage détecté. Photo de face requise.',
    too_blurry:'Photo trop floue.', bad_angle:'Tenez la tête droite face à la caméra.',
    bad_light:'Éclairage insuffisant.', cam_error:'Caméra inaccessible.',
    copied:'✅ Recette copiée !', shared:'✅ Image téléchargée',
    carnation_lbl:'Carnation FC26 estimée', coverage_lbl:'Couverture automatique',
    sq_lbl:'SQUELETTE', ch_lbl:'CHAIR', gr_lbl:'GRAISSE',
    ai_badge:'🎯 IA', p9_badge:'P9',
    ob_slide1_title:'Une photo',
    ob_slide1_text:'30 secondes · les sliders exacts FC26 générés automatiquement',
    ob_slide2_title:'La bonne photo',
    ob_slide2_text:'Visage de face, lumière naturelle, fond neutre',
    ob_slide3_title:'Valide ta carnation',
    ob_slide3_text:"L'IA suggère une carnation FC26 — confirme ou ajuste selon ta peau",
    ob_skip:'Passer', ob_next:'Suivant', ob_start:'Commencer →',
    skin_tone_title:'Teinte de peau', back:'Retour',
    ref_head:'TÊTE DE RÉF. · PRESET 9',
    p9_step1:'Jeu → Tête → Choix de la tête',
    p9_step2:'Sélectionne la tête de réf.',
    p9_step3:'Applique les valeurs zone par zone',
    suggests:'Suggère', err_analysis:'❌ Erreur analyse',
    kicker_mesh:'Face Mesh · 468 points',
    hero_title:'Scan ton visage, <em>importe la recette</em>.',
    fineprint:'PNG · JPG · ≤ 8 MB · traitement 100% local',
    face_ph:'visage · placeholder',
    step3_meta:'Étape 3 / 4 · Résultats & Mix',
    step3_title:'Recette de presets',
    step4_meta:'Étape 4 / 4 · Façonnage',
    step4_title:'Façonnage Avancé · entre ces valeurs dans FC26',
    step4_wordmark:'Façonnage · sliders',
    btn_to_shaping:'Passer au façonnage avancé',
    fam_title:'Familles · <b>3 groupes</b>',
    zone_sliders_suffix:'sliders · V2',
    mediapipe_wait:'⏳ MediaPipe en cours de chargement, réessayez dans quelques secondes',
    scan_laser_caption:'Analyse en cours…',
  },
  en:{
    step1_sub:'One photo · exact sliders · ready to paste in FC26.',
    btn_camera:'📷 Live camera', btn_gallery:'🖼 Upload photo',
    btn_capture:'📸 Capture', btn_launch:'Launch analysis',
    btn_crop_ok:'✓ Confirm', btn_crop_retry:'↩ Retake',
    btn_new_scan:'↩ New scan', btn_copy:'📋 Copy recipe',
    btn_share:'📤 PNG', scan_wait:'Upload a photo or start the camera',
    analyzing:'Analyzing…', no_face:'No face detected. Use a front-facing photo.',
    too_blurry:'Photo too blurry.', bad_angle:'Keep head straight.',
    bad_light:'Insufficient lighting.', cam_error:'Camera unavailable.',
    copied:'✅ Recipe copied!', shared:'✅ Image downloaded',
    carnation_lbl:'Estimated FC26 Carnation', coverage_lbl:'Automatic coverage',
    sq_lbl:'SKELETON', ch_lbl:'FLESH', gr_lbl:'FAT',
    ai_badge:'🎯 AI', p9_badge:'P9',
    ob_slide1_title:'One photo',
    ob_slide1_text:'30 seconds · exact FC26 sliders generated automatically',
    ob_slide2_title:'The right photo',
    ob_slide2_text:'Face forward, natural light, neutral background',
    ob_slide3_title:'Validate your skin tone',
    ob_slide3_text:'AI suggests an FC26 skin tone — confirm or adjust for your skin',
    ob_skip:'Skip', ob_next:'Next', ob_start:'Start →',
    skin_tone_title:'Skin tone', back:'Back',
    ref_head:'REF. HEAD · PRESET 9',
    p9_step1:'In your game → Head → Choose head',
    p9_step2:'Select the reference head',
    p9_step3:'Apply values zone by zone',
    suggests:'Suggests', err_analysis:'❌ Analysis error',
    kicker_mesh:'Face Mesh · 468 points',
    hero_title:'Scan your face, <em>import the recipe</em>.',
    fineprint:'PNG · JPG · ≤ 8 MB · 100% local processing',
    face_ph:'face · placeholder',
    step3_meta:'Step 3 / 4 · Results & Mix',
    step3_title:'Preset recipe',
    step4_meta:'Step 4 / 4 · Shaping',
    step4_title:'Advanced Shaping · enter these values in FC26',
    step4_wordmark:'Shaping · sliders',
    btn_to_shaping:'Go to advanced shaping',
    fam_title:'Families · <b>3 groups</b>',
    zone_sliders_suffix:'sliders · V2',
    mediapipe_wait:'⏳ MediaPipe loading, please retry in a few seconds',
    scan_laser_caption:'Analyzing…',
  }
};
let _lang = 'fr';
const t = k => TR[_lang][k] || TR.fr[k] || k;
window.setLanguage = l => {
  _lang = l==='en'?'en':'fr';
  applyI18n();
  // Re-render l'étape active pour que les textes dynamiques changent immédiatement
  const step = parseInt(document.getElementById('app')?.dataset.step)||1;
  if(step===2){
    buildSwatches(S.carnation);
    const sg=document.querySelector('.skintone__suggest');
    if(sg)sg.innerHTML=`${t('suggests')} <b>Carnation ${S.carnation}</b>`;
  } else if(step===3 && S.sliders){
    renderStep3();
  } else if(step===4 && S.sliders){
    renderZoneSliders(S.activeZone);
  }
};
function applyI18n() {
  const m = {'btn-camera':'btn_camera','btn-gallery':'btn_gallery','btn-capture':'btn_capture',
    'btn-launch':'btn_launch',
    'btn-confirm-crop':'btn_crop_ok','btn-retry-crop':'btn_crop_retry',
    'btn-new-scan':'btn_new_scan','btn-copy-recipe':'btn_copy','btn-share-png':'btn_share'};
  Object.entries(m).forEach(([id,k])=>{const e=document.getElementById(id);if(e)e.textContent=t(k);});
  const s=document.querySelector('.s1__sub'); if(s) s.textContent=t('step1_sub');
  // html lang attr
  document.documentElement.lang=_lang;
  // Step 1 hero
  const kk=document.querySelector('.s1__kicker');if(kk)kk.textContent=t('kicker_mesh');
  const ht=document.querySelector('.s1__title');if(ht)ht.innerHTML=t('hero_title');
  const fp=document.querySelector('.s1__fineprint');if(fp)fp.textContent=t('fineprint');
  // Viewport face placeholder + scanlaser
  const vph=document.querySelector('.viewport__face-ph');if(vph)vph.textContent=t('face_ph');
  const slc=document.querySelector('.scanlaser__caption');if(slc)slc.textContent=t('scan_laser_caption');
  // Step 3 header
  const s3m=document.querySelector('.s3__head-title small');if(s3m)s3m.textContent=t('step3_meta');
  const s3t=document.querySelector('.s3__head-title b');if(s3t)s3t.textContent=t('step3_title');
  // Step 4 header + wordmark
  const s4m=document.querySelector('.s4__head-title small');if(s4m)s4m.textContent=t('step4_meta');
  const s4t=document.querySelector('.s4__head-title b');if(s4t)s4t.textContent=t('step4_title');
  const s4w=document.getElementById('s4-wordmark-sub');if(s4w)s4w.textContent=t('step4_wordmark');
  const bts=document.getElementById('lbl-to-shaping');if(bts)bts.textContent=t('btn_to_shaping');
  // Zone tabs rebuild avec la bonne langue
  if(typeof buildZoneTabs==='function')buildZoneTabs();
  // Lang switcher — marquer la langue active
  document.querySelectorAll('.topbar__lang__btn[data-lang]').forEach(b=>{
    b.dataset.active=String(b.dataset.lang===_lang);
  });
  // Skin tone title
  const stt=document.querySelector('.skintone__title');
  if(stt)stt.textContent=t('skin_tone_title');
  // Onboarding (only if visible)
  const obEl=document.getElementById('onboarding');
  if(obEl&&!obEl.hidden){
    const obSkip=document.getElementById('ob-skip');
    if(obSkip)obSkip.textContent=t('ob_skip');
    const obNext=document.getElementById('ob-next');
    if(obNext){
      const cur=typeof window._obCur==='function'?window._obCur():0;
      obNext.textContent=cur===2?t('ob_start'):t('ob_next');
    }
    const keys=[['ob_slide1_title','ob_slide1_text'],['ob_slide2_title','ob_slide2_text'],['ob_slide3_title','ob_slide3_text']];
    obEl.querySelectorAll('.ob-slide').forEach((sl,i)=>{
      const h2=sl.querySelector('.ob-title'),p=sl.querySelector('.ob-text');
      if(h2&&keys[i])h2.textContent=t(keys[i][0]);
      if(p&&keys[i])p.textContent=t(keys[i][1]);
    });
  }
}

// ─── STATE ────────────────────────────────────────────────────────────
const S = {
  landmarks:null, skinTone:'Neutre', carnation:5, sliders:null,
  activeZone:'crane', faceLandmarker:null, cropper:null,
  webcamStream:null, imgNaturalW:1, imgNaturalH:1, cropSource:null,
};

// ─── PRESET 9 VALEURS RÉELLES (tête de référence FC26) ───────────────
// Source : FAÇONNAGE AVANCÉ COMPLET.md — Preset 9
// Organisé par famille pour éviter les collisions de noms entre Squelette/Chair/Graisse
const P9 = {
  // ═══ SQUELETTE ═══
  S: {
    // Crâne
    crane_reduire_elargir:30, crane_bas_haut:69, crane_arriere_avant:82,
    crane_arrondi_angulaire:100, crane_deplacement_gd:29,
    // Couronne
    crane_couronne_reduire_elargir:41, crane_couronne_bas_haut:14,
    crane_couronne_arriere_avant:68, crane_couronne_neutre_arrondi:0, crane_couronne_deplacement_gd:66,
    // Arrière du crâne
    crane_arriere_reduire_elargir:53, crane_arriere_bas_haut:75,
    crane_arriere_arriere_avant:75, crane_arriere_arrondi_angulaire:38, crane_arriere_deplacement_gd:58,
    // Tempes
    tempes_reduire_elargir:68, tempes_bas_haut:53, tempes_arriere_avant:76, tempes_arrondi_angulaire:44,
    // Front supérieur
    front_sup_reduire_elargir:50, front_sup_arriere_avant:52, front_sup_neutre_haut:0,
    front_sup_arrondi_angulaire:81, front_sup_deplacement_gd:41,
    // Front inférieur
    front_inf_reduire_elargir:23, front_inf_bas_haut:31, front_inf_arriere_avant:30, front_inf_arrondi_angulaire:64,
    // Sourcils
    sourcils_reduire_elargir:43, sourcils_bas_haut:43, sourcils_arriere_avant:63, sourcils_arrondi_angulaire:33,
    sourcils_central_reduire_elargir:64, sourcils_central_bas_haut:25, sourcils_central_arriere_avant:39,
    sourcils_central_arrondi_angulaire:22, sourcils_central_deplacement_gd:48,
    sourcils_ext_sup_reduire_elargir:60, sourcils_ext_sup_bas_haut:35,
    sourcils_ext_sup_arriere_avant:32, sourcils_ext_sup_arrondi_angulaire:44,
    // Yeux + Orbites
    yeux_reduire_elargir:31, yeux_bas_haut:47, yeux_arriere_avant:64, yeux_arrondi_angulaire:50,
    orbites_reduire_elargir:26, orbites_bas_haut:37, orbites_arriere_avant:56, orbites_plus_grande_petite:98,
    // Nez
    nez_reduire_elargir:40, nez_bas_haut:23, nez_arriere_avant:51, nez_arrondi_angulaire:51, nez_deplacement_gd:64,
    arete_nez_cotes_reduire_elargir:25, arete_nez_cotes_bas_haut:25,
    arete_nez_cotes_arriere_avant:31, arete_nez_cotes_arrondi_angulaire:75,
    arete_nez_centrale_reduire_elargir:49, arete_nez_centrale_bas_haut:25,
    arete_nez_centrale_arriere_avant:36, arete_nez_centrale_arrondi_angulaire:100, arete_nez_centrale_deplacement_gd:58,
    arete_nez_sup_reduire_elargir:29, arete_nez_sup_bas_haut:29,
    arete_nez_sup_arriere_avant:30, arete_nez_sup_arrondi_angulaire:13, arete_nez_sup_deplacement_gd:42,
    // Joues
    joues_reduire_elargir:50, joues_bas_haut:46, joues_arriere_avant:47, joues_arrondi_angulaire:50,
    // Bouche
    bouche_reduire_elargir:64, bouche_bas_haut:51, bouche_arriere_avant:50,
    bouche_arrondi_angulaire:100, bouche_deplacement_gd:43,
    ext_bouche_sup_reduire_elargir:38, ext_bouche_sup_bas_haut:50,
    ext_bouche_sup_arriere_avant:39, ext_bouche_sup_arrondi_angulaire:64,
    // Menton
    menton_reduire_elargir:45, menton_bas_haut:63, menton_arriere_avant:49,
    menton_arrondi_angulaire:44, menton_deplacement_gd:56,
    menton_sup_reduire_elargir:47, menton_sup_bas_haut:54, menton_sup_arriere_avant:42,
    menton_sup_arrondi_angulaire:89, menton_sup_deplacement_gd:56,
    // Mâchoire
    machoire_reduire_elargir:46, machoire_bas_haut:38, machoire_arriere_avant:81, machoire_arrondi_angulaire:22,
    maxillaire_reduire_elargir:22, maxillaire_bas_haut:42, maxillaire_arriere_avant:68, maxillaire_arrondi_angulaire:90,
    mandibule_reduire_elargir:23, mandibule_bas_haut:42, mandibule_arriere_avant:49, mandibule_arrondi_angulaire:56,
  },

  // ═══ CHAIR ═══
  C: {
    // Tempes
    tempes_moins_plus:33,
    // Sourcils
    sourcils_central_bas_haut:43, sourcils_central_moins_plus:14,
    espace_sourcils_bas_haut:38, espace_sourcils_moins_plus:62,
    // Pli paupières
    pli_paupieres_central_reduire_elargir:71, pli_paupieres_central_bas_haut:33,
    pli_paupieres_central_arriere_avant:17, pli_paupieres_central_plus_petite:51,
    pli_paupieres_ext_reduire_elargir:76, pli_paupieres_ext_bas_haut:49,
    pli_paupieres_ext_arriere_avant:28, pli_paupieres_ext_plus_petite:0,
    pli_paupieres_int_reduire_elargir:47, pli_paupieres_int_bas_haut:41,
    pli_paupieres_int_arriere_avant:18, pli_paupieres_int_plus_petite:35,
    // Paupières inférieures
    paupiere_inf_centrale_reduire_elargir:33, paupiere_inf_centrale_bas_haut:47, paupiere_inf_centrale_plus_petite:69,
    paupiere_inf_ext_reduire_elargir:29, paupiere_inf_ext_bas_haut:43, paupiere_inf_ext_plus_petite:70,
    paupiere_inf_int_reduire_elargir:72, paupiere_inf_int_bas_haut:51, paupiere_inf_int_plus_petite:46,
    // Paupières supérieures
    paupiere_sup_centrale_reduire_elargir:62, paupiere_sup_centrale_bas_haut:56,
    paupiere_sup_centrale_neutre_avant:0, paupiere_sup_centrale_plus_petite:50,
    paupiere_sup_ext_reduire_elargir:67, paupiere_sup_ext_bas_haut:60, paupiere_sup_ext_plus_petite:50,
    paupiere_sup_int_reduire_elargir:80, paupiere_sup_int_bas_haut:50, paupiere_sup_int_plus_petite:53,
    // Coins œil
    coin_oeil_ext_reduire_elargir:49, coin_oeil_ext_bas_haut:57, coin_oeil_ext_plus_petite:49,
    coin_oeil_int_reduire_elargir:55, coin_oeil_int_bas_haut:38, coin_oeil_int_plus_petite:46,
    // Narines
    narine_sup_reduire_elargir:59, narine_sup_bas_haut:45, narine_sup_arriere_avant:29, narine_sup_arrondi_angulaire:40,
    narine_sup_ext_reduire_elargir:44, narine_sup_ext_bas_haut:44, narine_sup_ext_arriere_avant:41, narine_sup_ext_arrondi_angulaire:78,
    narine_sup_centrale_reduire_elargir:40, narine_sup_centrale_bas_haut:19, narine_sup_centrale_arriere_avant:26, narine_sup_centrale_arrondi_angulaire:81,
    narine_inf_reduire_elargir:57, narine_inf_bas_haut:38, narine_inf_arriere_avant:60, narine_inf_arrondi_angulaire:48,
    ext_narine_ext_reduire_elargir:54, ext_narine_ext_bas_haut:42, ext_narine_ext_arriere_avant:33, ext_narine_ext_arrondi_angulaire:45,
    ext_narine_centrale_reduire_elargir:100, ext_narine_centrale_bas_haut:45, ext_narine_centrale_arriere_avant:54, ext_narine_centrale_arrondi_angulaire:36,
    // Pointe du nez
    pointe_nez_sup_reduire_elargir:31, pointe_nez_sup_bas_haut:22, pointe_nez_sup_arriere_avant:48, pointe_nez_sup_arrondi_angulaire:36, pointe_nez_sup_deplacement_gd:60,
    pointe_nez_sous_jacente_reduire_elargir:65, pointe_nez_sous_jacente_bas_haut:15, pointe_nez_sous_jacente_arriere_avant:36, pointe_nez_sous_jacente_arrondi_angulaire:11, pointe_nez_sous_jacente_deplacement_gd:52,
    pointe_nez_inf_reduire_elargir:30, pointe_nez_inf_bas_haut:21, pointe_nez_inf_arriere_avant:32, pointe_nez_inf_arrondi_angulaire:70, pointe_nez_inf_deplacement_gd:63,
    // Joues
    joues_bas_haut:81, joues_moins_plus:29,
    joues_ext_sup_moins_plus:1,
    joues_yeux_int_sup_bas_haut:24, joues_yeux_int_sup_moins_plus:33,
    joues_int_sup_moins_plus:14,
    joues_ext_inf_neutre_moins:50, joues_int_inf_neutre_moins:50,
    // Bouche
    commissures_levres_reduire_elargir:44, commissures_levres_bas_haut:37,
    commissures_levres_arriere_avant:40, commissures_levres_arrondi_angulaire:59,
    espacement_levres_centre_reduire_elargir:46, espacement_levres_centre_bas_haut:8,
    espacement_levres_centre_arriere_avant:31, espacement_levres_centre_arrondi_angulaire:64,
    espacement_levres_cotes_reduire_elargir:50, espacement_levres_cotes_bas_haut:33,
    espacement_levres_cotes_arriere_avant:38, espacement_levres_cotes_arrondi_angulaire:47,
    // Lèvre supérieure
    levre_sup_centre_sup_reduire_elargir:51, levre_sup_centre_sup_bas_haut:16,
    levre_sup_centre_sup_arriere_avant:15, levre_sup_centre_sup_arrondi_angulaire:48, levre_sup_centre_sup_deplacement_gd:66,
    levre_sup_cotes_sup_reduire_elargir:53, levre_sup_cotes_sup_bas_haut:34,
    levre_sup_cotes_sup_arriere_avant:0, levre_sup_cotes_sup_arrondi_angulaire:32,
    levre_sup_coins_sup_reduire_elargir:0, levre_sup_coins_sup_bas_haut:50,
    levre_sup_coins_sup_arriere_avant:51, levre_sup_coins_sup_arrondi_angulaire:48,
    levre_sup_centre_inf_reduire_elargir:27, levre_sup_centre_inf_bas_haut:10,
    levre_sup_centre_inf_arriere_avant:4, levre_sup_centre_inf_arrondi_angulaire:77, levre_sup_centre_inf_deplacement_gd:69,
    levre_sup_cotes_inf_reduire_elargir:0, levre_sup_cotes_inf_bas_haut:31,
    levre_sup_cotes_inf_arriere_avant:33, levre_sup_cotes_inf_arrondi_angulaire:100,
    epaisseur_levre_sup_reduire_elargir:50, epaisseur_levre_sup_bas_haut:27,
    epaisseur_levre_sup_arriere_avant:69, epaisseur_levre_sup_arrondi_angulaire:50,
    // Philtrum
    philtrum_reduire_elargir:57, philtrum_bas_haut:0,
    philtrum_arriere_avant:56, philtrum_arrondi_angulaire:50, philtrum_deplacement_gd:78,
    // Lèvre inférieure
    epaisseur_levre_inf_reduire_elargir:26, epaisseur_levre_inf_bas_haut:47,
    epaisseur_levre_inf_arriere_avant:38, epaisseur_levre_inf_arrondi_angulaire:48,
    levre_inf_centre_sup_reduire_elargir:41, levre_inf_centre_sup_bas_haut:10,
    levre_inf_centre_sup_arriere_avant:33, levre_inf_centre_sup_arrondi_angulaire:10, levre_inf_centre_sup_deplacement_gd:52,
    levre_inf_cotes_sup_reduire_elargir:38, levre_inf_cotes_sup_bas_haut:3,
    levre_inf_cotes_sup_arriere_avant:17, levre_inf_cotes_sup_arrondi_angulaire:77,
    levre_inf_centre_inf_reduire_elargir:74, levre_inf_centre_inf_bas_haut:37,
    levre_inf_centre_inf_arriere_avant:32, levre_inf_centre_inf_arrondi_angulaire:67, levre_inf_centre_inf_deplacement_gd:65,
    levre_inf_cotes_inf_reduire_elargir:58, levre_inf_cotes_inf_bas_haut:32,
    levre_inf_cotes_inf_arriere_avant:50, levre_inf_cotes_inf_arrondi_angulaire:50,
    levre_inf_coins_inf_reduire_elargir:0, levre_inf_coins_inf_bas_haut:28,
    levre_inf_coins_inf_arriere_avant:85, levre_inf_coins_inf_arrondi_angulaire:51,
    plis_coin_bouche_neutre_moins:50,
    // Menton
    fossette_mentonniere_bas_haut:51, fossette_mentonniere_deplacement_gd:34,
    menton_cotes_neutre_moins:50,
    // Mâchoire
    machoire_moins_plus:39,
  },

  // ═══ GRAISSE ═══
  G: {
    haut_cou_bas_haut:100, haut_cou_moins_plus:99,
    front_centre_bas_haut:19, front_centre_moins_plus:70,
    front_cotes_bas_haut:41, front_cotes_moins_plus:79,
    paupiere_sup_bas_haut:37, paupiere_sup_moins_plus:69,
    paupiere_inf_bas_haut:28, paupiere_inf_moins_plus:52,
    cernes_inf_bas_haut:45, cernes_inf_moins_plus:15,
    nez_moins_plus:82,
    joues_sup_bas_haut:56, joues_sup_moins_plus:26,
    joues_inf_bas_haut:55, joues_inf_moins_plus:53,
    bajoue_bas_haut:58, bajoue_moins_plus:50,
    joues_int_sup_bas_haut:33, joues_int_sup_moins_plus:48,
    joues_int_inf_bas_haut:52, joues_int_inf_moins_plus:47,
    tempes_bas_haut:93, tempes_moins_plus:80,
    cotes_bouche_bas_haut:55, cotes_bouche_moins_plus:61,
    levres_sup_bas_haut:26, levres_sup_moins_plus:44,
    levres_inf_bas_haut:32, levres_inf_moins_plus:50,
    menton_bas_haut:63, menton_moins_plus:29,
    sous_menton_bas_haut:91, sous_menton_moins_plus:44,
    machoire_bas_haut:46, machoire_moins_plus:48,
  },
};

// Retourne la valeur effective : IA si calculée (≠50), sinon valeur preset 9
// fam = 'S' (squelette), 'C' (chair), 'G' (graisse)
function getVal(key, aiVal, fam) {
  if (aiVal !== 50) return { v: aiVal, src: 'ai' };
  const p9 = (fam && P9[fam] && P9[fam][key] !== undefined) ? P9[fam][key]
           : (P9.S[key] !== undefined) ? P9.S[key]
           : (P9.C[key] !== undefined) ? P9.C[key]
           : (P9.G[key] !== undefined) ? P9.G[key]
           : undefined;
  if (p9 !== undefined) return { v: p9, src: 'p9' };
  return { v: 50, src: 'neutral' };
}

// ─── ITA → CARNATION FC26 ────────────────────────────────────────────
const ITA_MAP = [{min:55,c:1},{min:41,c:2},{min:28,c:3},{min:18,c:4},{min:8,c:5},{min:0,c:6},{min:-10,c:7},{min:-22,c:8},{min:-38,c:9},{min:-999,c:10}];
const itaToCarnation = ita => (ITA_MAP.find(r=>ita>=r.min)||{c:10}).c;
const skinToneLabel = (ita,l=_lang) => {
  const lb = {fr:['Claire','Claire bronzée','Intermédiaire','Bronzée','Métissée','Foncée','Très foncée'],
              en:['Fair','Light','Medium','Tan','Brown','Dark','Very dark']};
  const i = ita>50?0:ita>38?1:ita>26?2:ita>14?3:ita>4?4:ita>-14?5:6;
  return (lb[l]||lb.fr)[i];
};

// ─── ZONES ────────────────────────────────────────────────────────────
const ZONES = {
  crane:   {fr:'Crâne',   en:'Head',     icon:'⬡', px:['crane_','tempes_','couronne_']},
  front:   {fr:'Front',   en:'Forehead', icon:'▭', px:['front_']},
  sourcils:{fr:'Sourcils',en:'Brows',    icon:'〰', px:['sourcils_','espace_sourcils']},
  yeux:    {fr:'Yeux',    en:'Eyes',     icon:'◉', px:['yeux_','orbites_','pli_paupieres','paupiere_','coin_oeil','cernes']},
  nez:     {fr:'Nez',     en:'Nose',     icon:'▽', px:['nez_','arete_','narine_','ext_narine_','pointe_nez']},
  joues:   {fr:'Joues',   en:'Cheeks',   icon:'◡', px:['joues_','bajoue_']},
  bouche:  {fr:'Bouche',  en:'Mouth',    icon:'⌒', px:['bouche_','commissures_','espacement_levres','levre_','epaisseur_levre','philtrum_','plis_coin','ext_bouche','cotes_bouche','levres_s','levres_i']},
  menton:  {fr:'Menton',  en:'Chin',     icon:'∇', px:['menton_','fossette_','sous_menton']},
  machoire:{fr:'Mâchoire',en:'Jaw',      icon:'⬢', px:['machoire_','maxillaire_','mandibule_']},
};
const SL = {
  'reduire_elargir':{fr:'Réduire / Élargir',en:'Narrow / Wide'},
  'bas_haut':{fr:'Bas / Haut',en:'Down / Up'},
  'arriere_avant':{fr:'Arrière / Avant',en:'Back / Forward'},
  'arrondi_angulaire':{fr:'Arrondi / Angulaire',en:'Round / Angular'},
  'deplacement_gd':{fr:'Gauche / Droite',en:'Left / Right'},
  'moins_plus':{fr:'Moins / Plus',en:'Less / More'},
  'neutre_moins':{fr:'Neutre / Moins',en:'Neutral / Less'},
  'plus_petite':{fr:'+ Grande / + Petite',en:'Larger / Smaller'},
  'plus_grande_petite':{fr:'+ Grande / + Petite',en:'Larger / Smaller'},
  'neutre_avant':{fr:'Neutre / Avant',en:'Neutral / Forward'},
  'neutre_arrondi':{fr:'Neutre / Arrondi',en:'Neutral / Round'},
  'neutre_haut':{fr:'Neutre / Haut',en:'Neutral / Up'},
};
function sliderLabel(key) {
  for (const [s,lb] of Object.entries(SL)) {
    if (key.endsWith('_'+s)||key===s) return lb[_lang]||lb.fr;
  }
  return key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}

// ─── MEDIAPIPE ───────────────────────────────────────────────────────
async function initMP() {
  await new Promise(r=>{if(window._FaceLandmarker){r();return;}document.addEventListener('mp-ready',r,{once:true});});
  try {
    const fs=await window._FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm');
    S.faceLandmarker=await window._FaceLandmarker.createFromOptions(fs,{
      baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',delegate:'GPU'},
      outputFaceBlendshapes:false,runningMode:'IMAGE',numFaces:1
    });
    console.log('✅ MediaPipe prêt');
  }catch(e){console.error('MP init:',e);if(window.Sentry)Sentry.captureException(e);}
}
async function runMP(img) {
  console.log('[runMP] reçu dataUrl:', typeof img, img?.src?.substring(0, 80));
  if(!S.faceLandmarker)return null;
  try{const r=S.faceLandmarker.detect(img);return r.faceLandmarks?.[0]??null;}
  catch(e){if(window.Sentry)Sentry.captureException(e);return null;}
}

// ─── ITA DETECTION ────────────────────────────────────────────────────
function rgbToLab(r,g,b){
  const l=v=>{v/=255;return v>0.04045?Math.pow((v+0.055)/1.055,2.4):v/12.92;};
  const R=l(r),G=l(g),B=l(b),Y=R*0.2126+G*0.7152+B*0.0722,Z=R*0.0193+G*0.1192+B*0.9505;
  const f=v=>v>0.008856?Math.cbrt(v):7.787*v+16/116;
  return{L:116*f(Y)-16,b:200*(f(Y)-f(Z/1.089))};
}
function detectITA(img,lm){
  const c=document.createElement('canvas');
  c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;
  const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
  let tL=0,tB=0,n=0;
  [lm[116],lm[345],lm[205],lm[425]].filter(Boolean).forEach(p=>{
    try{
      const d=ctx.getImageData(Math.max(0,Math.round(p.x*c.width)-3),Math.max(0,Math.round(p.y*c.height)-3),6,6).data;
      for(let i=0;i<d.length;i+=4){const lab=rgbToLab(d[i],d[i+1],d[i+2]);tL+=lab.L;tB+=lab.b;n++;}
    }catch(e){}
  });
  if(!n)return 0;
  const avgL=tL/n, avgB=tB/n;
  return Math.atan((avgL-50)/Math.max(0.001,avgB))*(180/Math.PI);
}

// ─── IMAGE RESIZE BEFORE AZURE (avoid 413 Payload Too Large) ─────────
async function shrinkForAzure(dataUrl, maxSide=512, quality=0.75) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

// ─── AZURE QUALITY GATE ───────────────────────────────────────────────
async function checkQuality(b64){
  try{
    const small=await shrinkForAzure(b64);
    const r=await fetch(`${SMF.AZURE}/api/matchFace`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:small,qualityCheckOnly:true})});
    if(!r.ok)return{ok:true};return await r.json();
  }catch(e){return{ok:true};}
}

// ─── WEBCAM ───────────────────────────────────────────────────────────
async function startWebcam(){
  const vp=document.getElementById('viewport');
  const ph=vp?.querySelector('.viewport__face-ph');
  if(ph)ph.hidden=true;
  let vid=document.getElementById('spa-video');
  if(!vid){
    vid=document.createElement('video');vid.id='spa-video';vid.autoplay=true;vid.playsInline=true;vid.muted=true;
    vid.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1);z-index:2;';
    vp?.appendChild(vid);
  }
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:1280,height:720}});
    S.webcamStream=stream;vid.srcObject=stream;await vid.play();
    const bc=document.getElementById('btn-capture');
    if(bc){bc.hidden=false;bc.style.display='flex';}
    const bl=document.getElementById('btn-launch');
    if(bl)bl.style.display='none';
  }catch(e){
    console.error('Webcam:',e);toast(t('cam_error'));
    document.getElementById('file-upload')?.click();
  }
}
function stopWebcam(){
  S.webcamStream?.getTracks().forEach(tr=>tr.stop());S.webcamStream=null;
  const v=document.getElementById('spa-video');
  if(v){v.srcObject=null;v.remove();}
}
function captureWebcam(){
  const v=document.getElementById('spa-video');if(!v)return;
  const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;
  const ctx=c.getContext('2d');ctx.translate(c.width,0);ctx.scale(-1,1);ctx.drawImage(v,0,0);
  const dataUrl=c.toDataURL('image/jpeg',0.92);
  stopWebcam();
  S.cropSource='camera';
  // Photo figée directement dans le viewport — pas de Cropper pour la caméra
  showPhoto(dataUrl);
  document.getElementById('btn-capture').hidden=true;
  document.getElementById('btn-retry-crop').hidden=false;
  const btnL=document.getElementById('btn-launch');
  if(btnL){btnL.style.display='flex';btnL.disabled=true;btnL.style.opacity='0.5';}
  console.log('[camera] dataUrl:', typeof dataUrl, dataUrl?.substring(0, 80));
  runAnalysis(dataUrl);
}

// ─── CROPPER DANS LE VIEWPORT (upload + caméra) ──────────────────────
function openCropperInViewport(url, source='upload'){
  S.cropSource=source;
  const vp=document.getElementById('viewport');if(!vp)return;
  // Masquer les overlays UI pendant le recadrage
  vp.querySelector('.viewport__face-ph')?.setAttribute('hidden','');
  vp.querySelector('.viewport__hud')?.setAttribute('hidden','');
  vp.querySelector('.viewport__chips')?.setAttribute('hidden','');
  document.getElementById('scanlaser')?.setAttribute('hidden','');
  document.getElementById('mesh')?.setAttribute('hidden','');
  document.getElementById('metrics')?.setAttribute('hidden','');
  // Conteneur flex centré → image en contain (vraies proportions pour Cropper.js)
  let m=vp.querySelector('.viewport__media');
  if(!m){m=document.createElement('div');m.className='viewport__media';vp.prepend(m);}
  if(S.cropper){S.cropper.destroy();S.cropper=null;}
  m.style.cssText='position:absolute;inset:0;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center;';
  const img=document.createElement('img');
  img.id='spa-crop-img';img.style.cssText='display:block;max-width:100%;max-height:100%;';img.alt='';
  m.innerHTML='';m.appendChild(img);
  // Boutons : Confirmer + Reprendre visibles, Lancer masqué
  document.getElementById('btn-confirm-crop').hidden=false;
  document.getElementById('btn-retry-crop').hidden=false;
  document.getElementById('btn-launch').style.display='none';
  // Init Cropper après chargement (onload avant src)
  img.onload=()=>{
    S.cropper=new Cropper(img,{
      aspectRatio:NaN,viewMode:1,autoCropArea:0.78,
      movable:true,zoomable:true,rotatable:false,scalable:false,
      guides:false,center:true,highlight:false,background:false,
    });
  };
  img.src=url;
}
function confirmViewportCrop(){
  if(!S.cropper)return;
  const cv=S.cropper.getCroppedCanvas({maxWidth:1024,maxHeight:1024});
  const url=cv.toDataURL('image/jpeg',0.92);
  S.cropper.destroy();S.cropper=null;S.cropSource=null;
  // Restaurer overlays UI
  const vp=document.getElementById('viewport');
  vp?.querySelector('.viewport__hud')?.removeAttribute('hidden');
  vp?.querySelector('.viewport__chips')?.removeAttribute('hidden');
  document.getElementById('scanlaser')?.removeAttribute('hidden');
  // Réinitialiser le conteneur (showPhoto le remplira)
  const m=vp?.querySelector('.viewport__media');
  if(m)m.removeAttribute('style');
  // Boutons : Confirmer + Reprendre masqués, Lancer affiché (désactivé)
  document.getElementById('btn-confirm-crop').hidden=true;
  document.getElementById('btn-retry-crop').hidden=true;
  const btnL=document.getElementById('btn-launch');
  if(btnL){btnL.style.display='flex';btnL.disabled=true;btnL.style.opacity='0.5';}
  showPhoto(url);
  console.log('[confirmCrop] dataUrl:', typeof url, url?.substring(0, 80));
  runAnalysis(url);
}
function retryCropViewport(){
  if(S.cropper){S.cropper.destroy();S.cropper=null;}
  const src=S.cropSource;S.cropSource=null;
  // Réinitialiser le viewport
  const vp=document.getElementById('viewport');
  const m=vp?.querySelector('.viewport__media');
  if(m){m.removeAttribute('style');m.innerHTML='';}
  vp?.querySelector('.viewport__face-ph')?.removeAttribute('hidden');
  vp?.querySelector('.viewport__hud')?.removeAttribute('hidden');
  vp?.querySelector('.viewport__chips')?.removeAttribute('hidden');
  document.getElementById('scanlaser')?.removeAttribute('hidden');
  document.getElementById('btn-confirm-crop').hidden=true;
  document.getElementById('btn-retry-crop').hidden=true;
  if(src==='camera'){
    // Effacer l'état d'analyse, masquer les overlays MediaPipe, relancer la caméra
    S.landmarks=null;S.sliders=null;
    document.getElementById('mesh')?.setAttribute('hidden','');
    document.getElementById('metrics')?.setAttribute('hidden','');
    document.getElementById('btn-launch').style.display='none';
    startWebcam();
  } else {
    document.getElementById('btn-launch').style.display='flex';
    document.getElementById('file-upload')?.click();
  }
}

// ─── PHOTO DANS VIEWPORT ─────────────────────────────────────────────
function showPhoto(url){
  const vp=document.getElementById('viewport');if(!vp)return;
  let m=vp.querySelector('.viewport__media');
  if(!m){m=document.createElement('div');m.className='viewport__media';vp.prepend(m);}
  m.innerHTML=`<img id="spa-photo" src="${url}"
    style="position:absolute;inset:0;width:100%;height:100%;
    object-fit:cover;border-radius:inherit;z-index:1;">`;
  vp.querySelector('.viewport__face-ph')?.setAttribute('hidden','');
}

// ─── ANALYSIS PIPELINE ────────────────────────────────────────────────
async function runAnalysis(dataUrl){
  const laser=document.getElementById('scanlaser');
  const meshEl=document.getElementById('mesh');
  const metricsEl=document.getElementById('metrics');
  const btnLaunch=document.getElementById('btn-launch');
  const chipMode=document.getElementById('chip-mode');
  const btnCapture=document.getElementById('btn-capture');
  if(laser)laser.hidden=false;
  if(meshEl)meshEl.hidden=true;
  if(metricsEl)metricsEl.hidden=true;
  if(btnLaunch){btnLaunch.disabled=true;btnLaunch.style.display='flex';btnLaunch.style.opacity='0.5';}
  if(chipMode)chipMode.textContent=t('analyzing');
  if(btnCapture)btnCapture.hidden=true;

  // Vérifier que MediaPipe est prêt
  if(!S.faceLandmarker){
    if(laser)laser.hidden=true;
    if(btnLaunch){btnLaunch.disabled=false;btnLaunch.style.opacity='1';btnLaunch.textContent=t('btn_launch');}
    toast(t('mediapipe_wait'));
    return;
  }

  // Charger l'image SANS crossOrigin (data URL n'en a pas besoin)
  const img=new Image();
  await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=dataUrl;});
  S.imgNaturalW=img.naturalWidth||img.width;
  S.imgNaturalH=img.naturalHeight||img.height;

  // Quality gate Azure (fallback permissif si hors ligne)
  const q=await checkQuality(dataUrl);
  if(!q.ok){
    if(laser)laser.hidden=true;
    if(btnLaunch){btnLaunch.disabled=false;btnLaunch.style.opacity='1';btnLaunch.textContent=t('btn_launch');}
    const r=q.reason;
    toast(r==='no_face'?t('no_face'):r==='too_blurry'?t('too_blurry'):r==='bad_angle'?t('bad_angle'):r==='bad_light'?t('bad_light'):t('no_face'));
    return;
  }

  const t0=performance.now();
  const lm=await runMP(img);
  const elapsed=((performance.now()-t0)/1000).toFixed(2);
  if(laser)laser.hidden=true;
  if(!lm){
    toast(t('no_face'));
    if(btnLaunch){btnLaunch.disabled=false;btnLaunch.style.opacity='1';btnLaunch.textContent=t('btn_launch');}
    if(chipMode)chipMode.textContent='❌';
    return;
  }
  S.landmarks=lm;
  if(chipMode)chipMode.textContent=`SCAN · ${elapsed}s`;

  drawMesh(lm);
  if(meshEl)meshEl.hidden=false;

  const ita=detectITA(img,lm);
  S.carnation=itaToCarnation(ita);S.skinTone=skinToneLabel(ita,_lang);
  renderSwatches(ita);

  if(metricsEl){
    const sp=metricsEl.querySelectorAll('.viewport__metric span');
    if(sp[0])sp[0].textContent='97%';if(sp[1])sp[1].textContent='2°';if(sp[2])sp[2].textContent='OK';
    metricsEl.hidden=false;
  }
  if(btnLaunch){btnLaunch.disabled=false;btnLaunch.style.opacity='1';btnLaunch.textContent=t('btn_launch');}
}

// ─── MAILLAGE (aligné sur object-fit:cover) ──────────────────────────
function drawMesh(lm){
  const meshEl=document.getElementById('mesh');
  const vp=document.getElementById('viewport');
  if(!meshEl||!vp)return;
  // Effacer tout le contenu SVG sample du design (supprime l'oval vert)
  meshEl.innerHTML='';
  const cv=document.createElement('canvas');
  meshEl.appendChild(cv);
  const vpW=vp.offsetWidth,vpH=vp.offsetHeight;
  cv.width=vpW;cv.height=vpH;
  const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,vpW,vpH);

  // Calcul du scaling object-fit:cover
  const iw=S.imgNaturalW,ih=S.imgNaturalH;
  const scale=Math.max(vpW/iw,vpH/ih);
  const dw=iw*scale,dh=ih*scale;
  const ox=(vpW-dw)/2,oy=(vpH-dh)/2;
  const tx=nx=>nx*dw+ox;
  const ty=ny=>ny*dh+oy;

  // Points
  ctx.fillStyle='rgba(0,240,255,0.65)';
  lm.forEach(p=>{ctx.beginPath();ctx.arc(tx(p.x),ty(p.y),1.4,0,Math.PI*2);ctx.fill();});

  // Contour facial
  const ci=[10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109,10];
  ctx.strokeStyle='rgba(0,240,255,0.9)';ctx.lineWidth=1.5;
  ctx.beginPath();
  ci.forEach((i,idx)=>{const p=lm[i];if(!p)return;idx===0?ctx.moveTo(tx(p.x),ty(p.y)):ctx.lineTo(tx(p.x),ty(p.y));});
  ctx.stroke();
}

// ─── CARNATIONS FC26 ─────────────────────────────────────────────────
const FC26_CARNATIONS={
  1:'#c4948a',2:'#b8857a',3:'#c99090',4:'#b8887e',5:'#9e6e5e',
  6:'#7a5548',7:'#8a6558',8:'#5c3528',9:'#3d2018',10:'#2a1208'
};
function buildSwatches(activeNum){
  const row=document.querySelector('.skintone__row');if(!row)return;
  row.innerHTML=Object.entries(FC26_CARNATIONS).map(([num,color])=>{
    const n=parseInt(num),a=n===activeNum;
    return`<button class="swatch${a?' is-active':''}" data-carnation="${n}" aria-pressed="${a}" type="button" title="Carnation ${n}">
      <span class="swatch__dot" style="background:${color};"></span>
      <span class="swatch__label">${n}</span>
    </button>`;
  }).join('');
  row.querySelectorAll('.swatch').forEach(s=>{
    s.addEventListener('click',()=>{
      row.querySelectorAll('.swatch').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-pressed','false');});
      s.classList.add('is-active');s.setAttribute('aria-pressed','true');
      S.carnation=parseInt(s.dataset.carnation);S.skinTone=`Carnation ${S.carnation}`;
    });
  });
}
function renderSwatches(ita){
  const active=itaToCarnation(ita);
  buildSwatches(active);
  const sg=document.querySelector('.skintone__suggest');
  if(sg)sg.innerHTML=`${t('suggests')} <b>Carnation ${active}</b>`;
}

// ─── LAUNCH ───────────────────────────────────────────────────────────
window.onLaunchClick=async function(){
  if(!S.landmarks){toast(t('scan_wait'));return;}
  const btn=document.getElementById('btn-launch');
  if(btn){btn.disabled=true;btn.textContent=t('analyzing');}
  try{
    S.sliders=scanToSliders(S.landmarks);
    renderStep3();
    if(window.goToStep)window.goToStep(3);
  }catch(e){
    console.error(e);if(window.Sentry)Sentry.captureException(e);toast('❌ Erreur analyse');
  }finally{
    if(btn){btn.disabled=false;btn.textContent=t('btn_launch');}
  }
};

// ─── STEP 3 : SYNTHÈSE ────────────────────────────────────────────────
function renderStep3(){
  if(!S.sliders)return;
  const{squelette,chair,graisse,_meta}=S.sliders;
  // Hero
  const hn=document.getElementById('hero-name');
  if(hn)hn.textContent=`Carnation ${S.carnation} · ${S.skinTone}`;
  const hs=document.querySelector('.hero-compact__score');
  if(hs)hs.innerHTML=`${_meta.autoCount} sliders calculés · <b>${_meta.coverageRate}%</b> auto`;
  const kk=document.querySelector('.hero-compact__kicker');
  if(kk){
    const dotColor=FC26_CARNATIONS[S.carnation]||'#9e6e5e';
    kk.innerHTML=`${t('carnation_lbl')} <b>n°${S.carnation}</b><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${dotColor};vertical-align:middle;margin-left:6px;border:1px solid rgba(255,255,255,0.25);flex-shrink:0;"></span>`;
  }
  // Meta → label cyan + 3 instructions FC26
  const hm=document.querySelector('.hero-compact__meta');
  if(hm){
    hm.innerHTML=`<div style="color:#00f0ff;font-size:9px;font-weight:700;letter-spacing:0.12em;margin-bottom:6px;">${t('ref_head')}</div>
      <div style="display:flex;flex-direction:column;gap:3px;">
        <div style="font-size:10px;color:#9ea4c4;line-height:1.4;"><b style="color:#00f0ff;">①</b> ${t('p9_step1')}</div>
        <div style="font-size:10px;color:#9ea4c4;line-height:1.4;"><b style="color:#00f0ff;">②</b> ${t('p9_step2')}</div>
        <div style="font-size:10px;color:#9ea4c4;line-height:1.4;"><b style="color:#00f0ff;">③</b> ${t('p9_step3')}</div>
      </div>`;
  }
  // Masquer le row score (redondant avec les instructions)
  const hr=document.querySelector('.hero-compact__row');
  if(hr)hr.style.display='none';
  // Thumb — Injecter image preset 9
  const th=document.querySelector('.hero-compact__thumb');
  if(th){
    // Retirer ancienne image s'il y en a une
    const oldImg=th.querySelector('.hero-compact__thumb-img');
    if(oldImg)oldImg.remove();
    // Masquer le placeholder texte
    const ph=th.querySelector('.hero-compact__thumb-ph');
    if(ph)ph.style.display='none';
    // Injecter image avant les coins (pour que les coins restent visibles dessus)
    const corners=th.querySelector('.hero-compact__thumb-corners');
    const img=document.createElement('img');
    img.className='hero-compact__thumb-img';
    img.src='./assets/presets/9.png';
    img.alt='Preset 9';
    img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;';
    img.onerror=function(){this.style.display='none';if(ph)ph.style.display='';};
    if(corners)th.insertBefore(img,corners);else th.appendChild(img);
  }
  // Masquer l'ancienne preset9-card (déplacée dans la hero)
  const p9c=document.getElementById('preset9-card');
  if(p9c)p9c.style.display='none';
  // Alts
  const at=document.getElementById('alts-thin-title');if(at)at.textContent=t('coverage_lbl');
  const ar=document.getElementById('alts-thin-row');
  if(ar){
    const fams=[{lb:t('sq_lbl'),co:'#00f0ff',d:squelette},{lb:t('ch_lbl'),co:'#b026ff',d:chair},{lb:t('gr_lbl'),co:'#ff9500',d:graisse}];
    ar.innerHTML=fams.map(f=>{
      const e=Object.entries(f.d),a=e.filter(([,v])=>v!==50).length,p=Math.round(a/e.length*100);
      return`<div style="flex:1;padding:10px 6px;background:${f.co}0d;border:1px solid ${f.co}30;border-radius:10px;text-align:center;min-width:0;">
        <div style="font-size:9px;letter-spacing:0.14em;color:${f.co};font-weight:700;margin-bottom:4px;">${f.lb}</div>
        <div style="font-size:24px;font-weight:800;color:#e2e8f0;">${p}%</div>
        <div style="font-size:9px;color:#6b7099;">${e.length} sliders</div>
      </div>`;
    }).join('');
  }
  const mt=document.getElementById('mix-title');
  if(mt)mt.innerHTML=t('fam_title');
  const ml=document.getElementById('mix-list');
  if(!ml)return;ml.innerHTML='';
  [{k:'squelette',fam:'S',lb:t('sq_lbl'),co:'#00f0ff',d:squelette},
   {k:'chair',fam:'C',lb:t('ch_lbl'),co:'#b026ff',d:chair},
   {k:'graisse',fam:'G',lb:t('gr_lbl'),co:'#ff9500',d:graisse}
  ].forEach(f=>{
    const entries=Object.entries(f.d),auto=entries.filter(([,v])=>v!==50).length;
    const w=document.createElement('div');
    w.style.cssText=`margin-bottom:10px;border-radius:10px;overflow:hidden;background:${f.co}09;border:1px solid ${f.co}25;`;
    const h=document.createElement('div');
    h.style.cssText='display:flex;align-items:center;gap:8px;padding:10px 14px;cursor:pointer;';
    h.innerHTML=`<div style="width:7px;height:7px;border-radius:50%;background:${f.co};flex-shrink:0;"></div>
      <span style="font-size:10px;letter-spacing:0.14em;color:${f.co};font-weight:700;flex:1;">${f.lb}</span>
      <span style="font-size:9px;color:#6b7099;">${auto}/${entries.length}</span>
      <span class="arr" style="font-size:10px;color:#6b7099;">▼</span>`;
    const b=document.createElement('div');b.style.cssText='display:none;padding:6px 14px 12px;';
    entries.forEach(([key,val])=>{
      const{v,src}=getVal(key,val,f.fam);
      const ip=src==='neutral';
      const c=v>=95?'#ff3355':v<=5?'#b026ff':v>=80||v<=20?'#ff9500':'#00ff88';
      b.insertAdjacentHTML('beforeend',`<div style="display:grid;grid-template-columns:1fr 80px 32px;align-items:center;gap:8px;padding:3px 0;${ip?'opacity:0.3;':''}">
        <span style="font-size:9px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${key}">${key.replace(/_/g,' ')}</span>
        <div style="height:4px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${v}%;background:${c};border-radius:2px;"></div></div>
        <span style="font-size:11px;font-weight:700;color:${c};text-align:right;">${v}</span>
      </div>`);
    });
    h.addEventListener('click',()=>{const op=b.style.display!=='none';b.style.display=op?'none':'block';h.querySelector('.arr').textContent=op?'▼':'▲';});
    w.appendChild(h);w.appendChild(b);ml.appendChild(w);
  });
}

// ─── STEP 4 : ZONES + SLIDERS (Squelette → Chair → Graisse) ──────────
function buildZoneTabs(){
  const el=document.getElementById('zone-tabs');if(!el)return;
  el.innerHTML=Object.entries(ZONES).map(([k,z],i)=>`
    <button class="tab${i===0?' is-active':''}" role="tab" aria-pressed="${i===0}"
      data-zone="${k}" onclick="window.setActiveZone('${k}')">
      ${z.icon} ${z[_lang]||z.fr}
    </button>`).join('');
}

window.setActiveZone=function(zk){
  S.activeZone=zk;
  document.querySelectorAll('#zone-tabs .tab').forEach(tb=>{
    const on=tb.dataset.zone===zk;
    tb.classList.toggle('is-active',on);tb.setAttribute('aria-pressed',on);
    if(on&&tb.scrollIntoView)tb.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  });
  renderZoneSliders(zk);
};

function renderZoneSliders(zk){
  if(!S.sliders)return;
  const zone=ZONES[zk];if(!zone)return;
  const{squelette,chair,graisse}=S.sliders;
  const filterZone=obj=>Object.entries(obj).filter(([k])=>zone.px.some(p=>k.startsWith(p)));

  const sq_m=filterZone(squelette);
  const ch_m=filterZone(chair);
  const gr_m=filterZone(graisse);
  const total=sq_m.length+ch_m.length+gr_m.length;

  const zl=document.getElementById('zone-label');
  const zs=document.getElementById('zone-source');
  if(zl)zl.textContent=zone[_lang]||zone.fr;
  if(zs)zs.textContent=`${total} ${t('zone_sliders_suffix')}`;

  const sl=document.getElementById('sliders');if(!sl)return;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function renderGroup(entries, familyKey, color, fam) {
    if(!entries.length) return '';
    return `<div class="slider-section-lbl" style="color:${color};">${familyKey}</div>` +
      entries.map(([key,aiVal])=>{
        const{v,src}=getVal(key,aiVal,fam);
        const isAI=src==='ai', isP9=src==='p9', isNeutral=src==='neutral';
        const lb=sliderLabel(key), parts=lb.split(' / ');
        const ml=parts.length>1?`${esc(parts[0])} <span>/</span> ${esc(parts[1])}`:esc(lb);
        const badge=isAI?`<span title="${t('ai_badge')}" style="margin-left:4px;font-size:9px;background:rgba(0,240,255,0.15);color:#00f0ff;padding:1px 4px;border-radius:3px;">🎯</span>`
          :isP9?`<span title="Preset 9" style="margin-left:4px;font-size:9px;background:rgba(255,255,255,0.06);color:#6b7099;padding:1px 4px;border-radius:3px;">P9</span>`:'';
        const op=isNeutral?'opacity:0.35;':'';
        return `<div class="slider-row" data-adjusted="${isAI}" style="${op}">
          <div class="slider-row__label">${ml}${badge}</div>
          <div class="slider-row__value">${v}</div>
          <div class="slider-track">
            <div class="slider-track__rail"><div class="slider-track__fill" style="width:${v}%;"></div></div>
            <div class="slider-track__thumb" style="left:${v}%;"></div>
          </div>
        </div>`;
      }).join('');
  }

  sl.innerHTML =
    renderGroup(sq_m, t('sq_lbl'), '#00f0ff', 'S') +
    renderGroup(ch_m, t('ch_lbl'), '#b026ff', 'C') +
    renderGroup(gr_m, t('gr_lbl'), '#ff9500', 'G');

  const s4=document.getElementById('s4-main');if(s4)s4.scrollTop=0;
}

// ─── COPY + SHARE ─────────────────────────────────────────────────────
window.onCopyRecipe=function(){
  if(!S.sliders){toast(t('scan_wait'));return;}
  const{squelette,chair,graisse}=S.sliders;
  const lines=[`=== SCANMYFACE V2 · ${S.skinTone.toUpperCase()} · CARNATION ${S.carnation} ===`,
    '','── SQUELETTE ──',...Object.entries(squelette).map(([k,v])=>{const{v:val}=getVal(k,v,'S');return`${k.replace(/_/g,' ')}: ${val}`;}),
    '','── CHAIR ──',...Object.entries(chair).map(([k,v])=>{const{v:val}=getVal(k,v,'C');return`${k.replace(/_/g,' ')}: ${val}`;}),
    '','── GRAISSE ──',...Object.entries(graisse).map(([k,v])=>{const{v:val}=getVal(k,v,'G');return`${k.replace(/_/g,' ')}: ${val}`;}),
  ];
  navigator.clipboard.writeText(lines.join('\n')).then(()=>toast(t('copied'))).catch(()=>toast('❌'));
};

window.onSharePng=function(){
  if(!S.sliders){toast(t('scan_wait'));return;}
  const{squelette,chair,graisse}=S.sliders;
  const cv=document.createElement('canvas');cv.width=720;cv.height=1080;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07080d';ctx.fillRect(0,0,720,1080);
  ctx.fillStyle='#00f0ff';ctx.font='bold 28px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('SCANMYFACE V2',360,52);
  ctx.fillStyle='#6b7099';ctx.font='13px Inter,sans-serif';
  ctx.fillText(`${S.skinTone} · Carnation FC26 n°${S.carnation}`,360,78);
  ctx.strokeStyle='rgba(0,240,255,0.2)';ctx.beginPath();ctx.moveTo(40,95);ctx.lineTo(680,95);ctx.stroke();
  let y=118;
  const drawF=(lb,co,data,fam)=>{
    ctx.fillStyle=co;ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='left';ctx.fillText(`── ${lb} ──`,40,y);y+=20;
    Object.entries(data).forEach(([k,v])=>{
      const{v:val}=getVal(k,v,fam);
      if(val===50)return;if(y>1050)return;
      ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fillRect(40,y-10,440,14);
      ctx.fillStyle=co;ctx.fillRect(40,y-10,(val/100)*440,14);
      ctx.fillStyle='#e2e8f0';ctx.font='10px Inter,sans-serif';ctx.textAlign='left';ctx.fillText(sliderLabel(k),46,y+1);
      ctx.fillStyle=co;ctx.textAlign='right';ctx.fillText(String(val),690,y+1);
      ctx.textAlign='left';y+=19;
    });y+=6;
  };
  drawF(t('sq_lbl'),'#00f0ff',squelette,'S');
  drawF(t('ch_lbl'),'#b026ff',chair,'C');
  drawF(t('gr_lbl'),'#ff9500',graisse,'G');
  ctx.fillStyle='#6b7099';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';ctx.fillText('scanmyface.tech',360,1065);
  cv.toBlob(bl=>{
    const a=document.createElement('a');a.href=URL.createObjectURL(bl);
    a.download=`scanmyface-fc26-${Date.now()}.png`;a.click();toast(t('shared'));
  },'image/png');
};

// ─── NOUVEAU SCAN ─────────────────────────────────────────────────────
window.onNewScan=function(){
  // Cropper
  if(S.cropper){S.cropper.destroy();S.cropper=null;}

  // Webcam
  stopWebcam();

  // State
  S.landmarks=null;S.sliders=null;S.skinTone='Neutre';S.carnation=5;S.imgNaturalW=1;S.imgNaturalH=1;S.cropSource=null;

  // Viewport
  const vp=document.getElementById('viewport');
  const m=vp?.querySelector('.viewport__media');
  if(m){m.removeAttribute('style');m.innerHTML='';}
  vp?.querySelector('.viewport__face-ph')?.removeAttribute('hidden');
  vp?.querySelector('.viewport__hud')?.removeAttribute('hidden');
  vp?.querySelector('.viewport__chips')?.removeAttribute('hidden');
  document.getElementById('mesh')?.setAttribute('hidden','');
  document.getElementById('scanlaser')?.removeAttribute('hidden');
  document.getElementById('metrics')?.setAttribute('hidden','');
  document.getElementById('chip-mode')?.textContent && (document.getElementById('chip-mode').textContent='RAPIDE · 0.41s');
  document.getElementById('btn-confirm-crop').hidden=true;
  document.getElementById('btn-retry-crop').hidden=true;

  // Swatches — reset aux 10 carnations FC26 (défaut : 5)
  buildSwatches(5);
  const sg=document.querySelector('.skintone__suggest');
  if(sg)sg.innerHTML=`${t('suggests')} <b>Carnation 5</b>`;

  // Buttons
  const bl=document.getElementById('btn-launch');
  if(bl){bl.disabled=true;bl.style.display='flex';bl.style.opacity='0.5';bl.textContent=t('btn_launch');}
  const bc=document.getElementById('btn-capture');
  if(bc)bc.hidden=true;

  if(window.goToStep)window.goToStep(1);
};

// ─── TOAST ────────────────────────────────────────────────────────────
function toast(msg){
  if(window.showCraniumToast){window.showCraniumToast(msg);return;}
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=msg;el.classList.add('is-visible');
  setTimeout(()=>el.classList.remove('is-visible'),2200);
}

// ─── INIT ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  initMP();
  buildSwatches(5);

  // Désactiver btn-launch au départ
  const bl=document.getElementById('btn-launch');
  if(bl){bl.disabled=true;bl.style.opacity='0.5';}

  // Masquer mode toggle
  document.querySelector('.modetoggle')?.style.setProperty('display','none');
  document.querySelector('.toolbar')?.style.setProperty('display','none');

  // Hooks boutons
  window.onCameraClick=()=>{if(window.goToStep)window.goToStep(2);startWebcam();};
  window.onFileChange=e=>{
    const f=e.target.files?.[0];if(!f)return;
    if(window.goToStep)window.goToStep(2);
    openCropperInViewport(URL.createObjectURL(f));e.target.value='';
  };

  // Bouton capturer webcam
  const bc=document.getElementById('btn-capture');
  if(bc){bc.addEventListener('click',captureWebcam);bc.hidden=true;}

  // Crop viewport (upload + caméra)
  document.getElementById('btn-confirm-crop')?.addEventListener('click',confirmViewportCrop);
  document.getElementById('btn-retry-crop')?.addEventListener('click',retryCropViewport);

  // Reset global (✕ topbar) + nouveau scan
  document.querySelectorAll('.topbar__reset').forEach(btn=>btn.addEventListener('click',window.onNewScan));
  document.getElementById('btn-share-png')?.addEventListener('click',window.onSharePng);
  document.getElementById('btn-new-scan')?.addEventListener('click',window.onNewScan);

  // Drag & drop viewport
  const vp=document.getElementById('viewport');
  if(vp){
    vp.addEventListener('dragover',e=>{e.preventDefault();vp.classList.add('drag-over');});
    vp.addEventListener('dragleave',()=>vp.classList.remove('drag-over'));
    vp.addEventListener('drop',e=>{
      e.preventDefault();vp.classList.remove('drag-over');
      const f=e.dataTransfer.files?.[0];
      if(f&&f.type.startsWith('image/')){if(window.goToStep)window.goToStep(2);openCropperInViewport(URL.createObjectURL(f));}
    });
  }

  // Zone tabs
  buildZoneTabs();

  // Lang switcher
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>window.setLanguage(b.dataset.lang)));

  // Traductions initiales
  applyI18n();

  // Onboarding
  (function(){
    const el=document.getElementById('onboarding');if(!el)return;
    if(localStorage.getItem('smf_onboarded')){el.hidden=true;return;}
    let cur=0;const N=3;
    const track=el.querySelector('.ob-track');
    const dots=el.querySelectorAll('.ob-dot');
    const btnNext=document.getElementById('ob-next');
    const btnSkip=document.getElementById('ob-skip');
    window._obCur=()=>cur;
    function go(n){
      cur=n;
      track.style.transform=`translateX(${-n*100}%)`;
      dots.forEach((d,i)=>d.classList.toggle('is-active',i===n));
      btnNext.textContent=n===N-1?t('ob_start'):t('ob_next');
      if(btnSkip)btnSkip.textContent=t('ob_skip');
    }
    function done(){localStorage.setItem('smf_onboarded','1');el.hidden=true;window._obCur=null;}
    btnNext.addEventListener('click',()=>cur<N-1?go(cur+1):done());
    btnSkip.addEventListener('click',done);
    go(0);
  })();

  console.log('✅ ScanMyFace V2 ready');
});
