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
    mix_title:'Mix par zone · <b>Frankenstein</b>',
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
    mix_title:'Zone mix · <b>Frankenstein</b>',
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
    buildSwatches(S.skinTone);
    const sg=document.querySelector('.skintone__suggest');
    if(sg)sg.innerHTML=`${t('suggests')} <b>${S.skinTone}</b>`;
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
  landmarks:null, skinTone:'Claire-bronzée', sliders:null,
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

// ─── ITA → CATÉGORIE FC26 ────────────────────────────────────────────
// 5 catégories FC26 nommées (Claire / Claire-bronzée / Métis / Foncée / Très foncée)
function itaToCategory(ita){
  if (ita >= 41)  return 'Claire';
  if (ita >= 28)  return 'Claire-bronzée';
  if (ita >= 10)  return 'Métis';
  if (ita >= -30) return 'Foncée';
  return 'Très foncée';
}

// ─── ZONES ────────────────────────────────────────────────────────────
const ZONES = {
  crane:   {fr:'Tête',    en:'Head',     icon:'⬡', px:['crane_','tempes_','couronne_']},
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
  'deplacement_gd':{fr:'Déplacer gauche / droite',en:'Move left / right'},
  'moins_plus':{fr:'Moins / Plus',en:'Less / More'},
  'neutre_moins':{fr:'Neutre / Moins',en:'Neutral / Less'},
  'plus_petite':{fr:'Plus grande / Plus petite',en:'Larger / Smaller'},
  'plus_grande_petite':{fr:'Plus grande / Plus petite',en:'Larger / Smaller'},
  'neutre_avant':{fr:'Neutre / Avant',en:'Neutral / Forward'},
  'neutre_arrondi':{fr:'Neutre / Arrondi',en:'Neutral / Round'},
  'neutre_haut':{fr:'Neutre / Haut',en:'Neutral / Up'},
};
// Overrides par clé exacte : pour les sliders dont le suffixe data ne reflète
// pas le vrai libellé canonique (cf. slider_ui_order.json). Audit du 7 juin :
// - crane_arriere_avant   : 3e slider du Crâne, canonique = "Neutre / Avant"
// - yeux_arrondi_angulaire: 4e slider des Yeux, canonique = "Plus grande / Plus petite"
const KEY_LABEL_OVERRIDE = {
  'crane_arriere_avant':    {fr:'Neutre / Avant',           en:'Neutral / Forward'},
  'yeux_arrondi_angulaire': {fr:'Plus grande / Plus petite', en:'Larger / Smaller'},
};
function sliderLabel(key) {
  if (KEY_LABEL_OVERRIDE[key]) {
    const ov = KEY_LABEL_OVERRIDE[key];
    return ov[_lang] || ov.fr;
  }
  for (const [s,lb] of Object.entries(SL)) {
    if (key.endsWith('_'+s)||key===s) return lb[_lang]||lb.fr;
  }
  return key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}

const SLIDER_SUBTAB = [
  // SQUELETTE — Tête
  ['crane_',                        'Crâne'],
  ['crane_couronne_',               'Crâne : couronne'],
  ['crane_arriere_',                'Arrière du crâne'],
  ['tempes_',                       'Tempes'],
  // SQUELETTE — Front
  ['front_sup_',                    'Front : partie supérieure'],
  ['front_inf_',                    'Front : partie inférieure'],
  // SQUELETTE — Sourcils
  ['sourcils_',                     'Sourcils'],
  ['sourcils_central_',             'Sourcils : partie centrale'],
  ['sourcils_ext_sup_',             'Sourcils : partie supérieure extérieure'],
  // SQUELETTE — Yeux
  ['yeux_',                         'Yeux'],
  ['orbites_',                      'Orbites'],
  // SQUELETTE — Nez
  ['nez_',                          'Nez'],
  ['arete_nez_cotes_',              'Arête du nez : côtés'],
  ['arete_nez_centrale_',           'Arête du nez : partie centrale'],
  ['arete_nez_sup_',                'Arête du nez : partie supérieure'],
  // SQUELETTE — Joues
  ['joues_',                        'Joues'],
  // SQUELETTE — Bouche
  ['bouche_',                       'Bouche'],
  ['ext_bouche_sup_',               'Extérieur de la bouche : partie sup.'],
  // SQUELETTE — Menton
  ['menton_',                       'Menton'],
  ['menton_sup_',                   'Menton : partie supérieure'],
  // SQUELETTE — Mâchoire
  ['machoire_',                     'Mâchoire'],
  ['maxillaire_',                   'Maxillaire'],
  ['mandibule_',                    'Mandibule'],
  // CHAIR — Tête
  ['tempes_',                       'Tempes'],
  // CHAIR — Sourcils
  ['sourcils_central_',             'Sourcils : partie centrale'],
  ['espace_sourcils_',              'Espace entre les sourcils'],
  // CHAIR — Yeux
  ['pli_paupieres_central_',        'Pli des paupières : partie centrale'],
  ['pli_paupieres_ext_',            'Pli des paupières : partie extérieure'],
  ['pli_paupieres_int_',            'Pli des paupières : partie intérieure'],
  ['paupiere_inf_centrale_',        'Paupière inférieure : partie centrale'],
  ['paupiere_inf_ext_',             'Paupière inférieure : partie extérieure'],
  ['paupiere_inf_int_',             'Paupière inférieure : partie intérieure'],
  ['paupiere_sup_centrale_',        'Paupière supérieure : partie centrale'],
  ['paupiere_sup_ext_',             'Paupière supérieure : partie ext.'],
  ['paupiere_sup_int_',             'Paupière supérieure : partie int.'],
  ['coin_oeil_ext_',                'Extérieur du coin de l\'œil'],
  ['coin_oeil_int_',                'Intérieur du coin de l\'œil'],
  // CHAIR — Nez
  ['narine_sup_',                   'Narine : partie supérieure'],
  ['narine_sup_ext_',               'Narine : partie supérieure extérieure'],
  ['narine_sup_centrale_',          'Narine : partie supérieure centrale'],
  ['narine_inf_',                   'Narine : partie inférieure'],
  ['ext_narine_ext_',               'Extérieur de la narine : partie ext.'],
  ['ext_narine_centrale_',          'Extérieur de la narine : partie centrale'],
  ['pointe_nez_sup_',               'Pointe du nez : partie supérieure'],
  ['pointe_nez_sous_jacente_',      'Pointe du nez : partie sous-jacente'],
  ['pointe_nez_inf_',               'Pointe du nez : partie inférieure'],
  // CHAIR — Joues
  ['joues_',                        'Joues'],
  ['joues_ext_sup_',                'Joues : partie externe supérieure'],
  ['joues_yeux_int_sup_',           'Yeux : partie interne supérieure'],
  ['joues_int_sup_',                'Joues : partie interne supérieure'],
  ['joues_ext_inf_',                'Joues : partie externe inférieure'],
  ['joues_int_inf_',                'Joues : partie interne inférieure'],
  // CHAIR — Bouche
  ['commissures_levres_',           'Commissures des lèvres'],
  ['espacement_levres_centre_',     'Espacement entre les lèvres : centre'],
  ['espacement_levres_cotes_',      'Espacement entre les lèvres : côtés'],
  ['levre_sup_centre_sup_',         'Lèvre supérieure : centre supérieur'],
  ['levre_sup_cotes_sup_',          'Lèvre supérieure : côtés supérieurs'],
  ['levre_sup_coins_sup_',          'Lèvre supérieure : coins supérieurs'],
  ['levre_sup_centre_inf_',         'Lèvre supérieure : centre inférieur'],
  ['levre_sup_cotes_inf_',          'Lèvre supérieure : côtés inférieurs'],
  ['epaisseur_levre_sup_',          'Épaisseur de la lèvre supérieure'],
  ['philtrum_',                     'Philtrum'],
  ['epaisseur_levre_inf_',          'Épaisseur de la lèvre inférieure'],
  ['levre_inf_centre_sup_',         'Lèvre inférieure : partie sup. centrale'],
  ['levre_inf_cotes_sup_',          'Lèvre inférieure : côtés supérieurs'],
  ['levre_inf_centre_inf_',         'Lèvre inférieure : partie inf. centrale'],
  ['levre_inf_cotes_inf_',          'Lèvre inférieure : côtés inférieurs'],
  ['levre_inf_coins_inf_',          'Lèvre inférieure : coins inférieurs'],
  ['plis_coin_bouche_',             'Plis du coin de la bouche'],
  // CHAIR — Menton
  ['fossette_mentonniere_',         'Fossette mentonnière'],
  ['menton_cotes_',                 'Menton : côtés'],
  // CHAIR — Mâchoire
  ['machoire_',                     'Mâchoire'],
  // GRAISSE — Tête
  ['haut_cou_',                     'Haut du cou'],
  // GRAISSE — Front
  ['front_centre_',                 'Front : centre'],
  ['front_cotes_',                  'Front : côtés'],
  // GRAISSE — Yeux
  ['paupiere_sup_',                 'Paupière supérieure'],
  ['paupiere_inf_',                 'Paupière inférieure'],
  ['cernes_inf_',                   'Cernes : partie inférieure'],
  // GRAISSE — Nez
  ['nez_',                          'Nez'],
  // GRAISSE — Joues
  ['joues_sup_',                    'Joues : partie supérieure'],
  ['joues_inf_',                    'Joues : partie inférieure'],
  ['bajoue_',                       'Bajoue'],
  ['joues_int_sup_',                'Joues : partie intérieure supérieure'],
  ['joues_int_inf_',                'Joues : partie intérieure inférieure'],
  ['tempes_',                       'Tempes'],
  // GRAISSE — Bouche
  ['cotes_bouche_',                 'Côtés de la bouche'],
  ['levres_sup_',                   'Lèvre supérieure'],
  ['levres_inf_',                   'Lèvre inférieure'],
  // GRAISSE — Menton
  ['menton_',                       'Menton'],
  ['sous_menton_',                  'Sous le menton'],
  // GRAISSE — Mâchoire
  ['machoire_',                     'Mâchoire'],
];

function getSubTab(key) {
  // MAP d'exceptions — clés qui ne suivent pas leur préfixe naturel
  const EXCEPTIONS = {
    'crane_arriere_avant': 'Crâne',
    'crane_arrondi_angulaire': 'Crâne',
    'crane_deplacement_gd': 'Crâne',
  };
  if (key in EXCEPTIONS) return EXCEPTIONS[key];
  const sorted = [...SLIDER_SUBTAB].sort((a, b) => b[0].length - a[0].length);
  const match = sorted.find(([prefix]) => key.startsWith(prefix));
  return match ? match[1] : null;
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
    document.dispatchEvent(new Event('mp-landmarker-ready'));
    console.log('✅ MediaPipe prêt');
  }catch(e){console.error('MP init:',e);if(window.Sentry)Sentry.captureException(e);}
}
async function runMP(img) {
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
  // Conteneur flex centré → image en cover (viewMode 3), cadre fixe = tout le viewport
  let m=vp.querySelector('.viewport__media');
  if(!m){m=document.createElement('div');m.className='viewport__media';vp.prepend(m);}
  if(S.cropper){S.cropper.destroy();S.cropper=null;}
  m.removeAttribute('style');
  const img=document.createElement('img');
  img.id='spa-crop-img';img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;z-index:1;';img.alt='';
  m.innerHTML='';m.appendChild(img);
  // Boutons : Confirmer + Reprendre visibles, Lancer masqué
  document.getElementById('btn-confirm-crop').hidden=false;
  document.getElementById('btn-retry-crop').hidden=false;
  document.getElementById('btn-launch').style.display='none';
  // Init Cropper après chargement (onload avant src)
  img.onload=()=>{
    S.cropper=new Cropper(img,{
      aspectRatio:NaN,        // libre, le cadre = tout le viewport
      viewMode:3,             // image COUVRE tout le conteneur (plus de bandes)
      dragMode:'move',        // iPhone-style : on déplace l'image derrière le cadre
      autoCropArea:1,         // crop = tout ce qui est visible (pas de zoom surprise)
      cropBoxMovable:false,   // cadre fixe
      cropBoxResizable:false, // cadre fixe
      toggleDragModeOnDblclick:false,
      movable:true,zoomable:true,rotatable:false,scalable:false,
      guides:false,center:true,highlight:false,background:false,
      ready(){
        // Force la box de crop à couvrir TOUT le conteneur (autoCropArea seul ne suffit
        // pas avec aspectRatio:NaN → box centrée plus petite, crop zoome au Confirmer)
        const cd = S.cropper.getContainerData();
        S.cropper.setCropBoxData({ left:0, top:0, width:cd.width, height:cd.height });
      }
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
    S.landmarks=null;S.sliders=null;S.tddfa=null;
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

  // Attendre MediaPipe si pas encore prêt (race condition fix)
  if(!S.faceLandmarker){
    await new Promise(resolve=>document.addEventListener('mp-landmarker-ready',resolve,{once:true}));
  }
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

  // Quality gate Azure — no_face non-bloquant (MediaPipe reste le juge final)
  const q=await checkQuality(dataUrl);
  if(!q.ok){
    const r=q.reason;
    if(r==='too_blurry'||r==='bad_angle'||r==='bad_light'){
      if(laser)laser.hidden=true;
      if(btnLaunch){btnLaunch.disabled=false;btnLaunch.style.opacity='1';btnLaunch.textContent=t('btn_launch');}
      toast(r==='too_blurry'?t('too_blurry'):r==='bad_angle'?t('bad_angle'):t('bad_light'));
      return;
    }
  }

  const t0=performance.now();
  // MediaPipe + 3DDFA en parallèle sur la même image cropée (= #spa-photo)
  const tddfaPromise = (typeof run3DDFA === 'function')
    ? run3DDFA(img).catch(e => { console.warn('[3DDFA] échec, fallback preset:', e); return null; })
    : Promise.resolve(null);
  const [lm, tddfa] = await Promise.all([runMP(img), tddfaPromise]);
  const elapsed=((performance.now()-t0)/1000).toFixed(2);
  if(laser)laser.hidden=true;
  if(!lm){
    toast(t('no_face'));
    if(btnLaunch){btnLaunch.disabled=false;btnLaunch.style.opacity='1';btnLaunch.textContent=t('btn_launch');}
    if(chipMode)chipMode.textContent='❌';
    return;
  }
  S.landmarks=lm;
  S.tddfa=tddfa;
  if(chipMode)chipMode.textContent=`SCAN · ${elapsed}s`;

  drawMesh(lm);
  if(meshEl)meshEl.hidden=false;

  const ita=detectITA(img,lm);
  S.skinTone = itaToCategory(ita);   // catégorie suggérée
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
const FC26_SKIN_CATEGORIES = [
  { key: 'Claire',         color: '#c9a896' },
  { key: 'Claire-bronzée', color: '#b08968' },
  { key: 'Métis',          color: '#9e6e5e' },
  { key: 'Foncée',         color: '#6b4435' },
  { key: 'Très foncée',    color: '#3d2418' },
];
// helper couleur par catégorie (pour pastille / export)
function skinCategoryColor(cat){
  const f = FC26_SKIN_CATEGORIES.find(c=>c.key===cat);
  return f ? f.color : '#9e6e5e';
}
function buildSwatches(activeKey){
  const row=document.querySelector('.skintone__row');if(!row)return;
  row.innerHTML=FC26_SKIN_CATEGORIES.map(({key,color})=>{
    const a = key===activeKey;
    return `<button class="swatch${a?' is-active':''}" data-cat="${key}" aria-pressed="${a}" type="button" title="${key}">
      <span class="swatch__dot" style="background:${color};"></span>
      <span class="swatch__label">${key}</span>
    </button>`;
  }).join('');
  row.querySelectorAll('.swatch').forEach(s=>{
    s.addEventListener('click',()=>{
      row.querySelectorAll('.swatch').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-pressed','false');});
      s.classList.add('is-active');s.setAttribute('aria-pressed','true');
      S.skinTone = s.dataset.cat;
      // recalcul LIVE du bestPreset avec la nouvelle catégorie
      if(S.landmarks){
        try{
          const tddfaSliders=(S.tddfa&&typeof computeFC26from3DDFA==='function')?computeFC26from3DDFA(S.tddfa,S.landmarks):null;
          S.sliders=scanToSliders(S.landmarks, tddfaSliders, S.skinTone);
          if(typeof renderStep3==='function')renderStep3();
        }catch(e){console.warn('[recalc carnation] échec:',e);}
      }
    });
  });
}
function renderSwatches(ita){
  const active = itaToCategory(ita);
  S.skinTone = active;
  buildSwatches(active);
  const sg=document.querySelector('.skintone__suggest');
  if(sg)sg.innerHTML=`${t('suggests')} <b>${active}</b>`;
}

// ─── LAUNCH ───────────────────────────────────────────────────────────
window.onLaunchClick=async function(){
  if(!S.landmarks){toast(t('scan_wait'));return;}
  const btn=document.getElementById('btn-launch');
  if(btn){btn.disabled=true;btn.textContent=t('analyzing');}
  try{
    const tddfaSliders = (S.tddfa && typeof computeFC26from3DDFA === 'function')
      ? computeFC26from3DDFA(S.tddfa, S.landmarks)
      : null;
    S.tddfaSliders = tddfaSliders;   // pour lire S.tddfaSliders._debug en console
    S.sliders=scanToSliders(S.landmarks, tddfaSliders, S.skinTone);
    renderStep3();
    if(window.goToStep)window.goToStep(3);
  }catch(e){
    console.error(e);if(window.Sentry)Sentry.captureException(e);toast('❌ Erreur analyse');
  }finally{
    if(btn){btn.disabled=false;btn.textContent=t('btn_launch');}
  }
};

// ─── STEP 3 : SYNTHÈSE ────────────────────────────────────────────────
// Switch manuel vers un preset alternatif : recalcule les sliders en forçant ce preset
function switchToPreset(presetId){
  if(!window.PRESETS_DB) return;
  const p = window.PRESETS_DB.find(x=>x.preset_id===presetId);
  if(!p || !S.landmarks) return;
  try{
    const tddfaSliders=(S.tddfa&&typeof computeFC26from3DDFA==='function')?computeFC26from3DDFA(S.tddfa,S.landmarks):null;
    S.sliders=scanToSliders(S.landmarks, tddfaSliders, S.skinTone, presetId);
    renderStep3();
  }catch(e){console.warn('[switchToPreset] échec:',e);}
}

function renderStep3(){
  if(!S.sliders)return;
  const{squelette,chair,graisse,_meta}=S.sliders;
  // Hero
  const hn=document.getElementById('hero-name');
  if(hn)hn.textContent=`${S.skinTone}`;
  const hs=document.querySelector('.hero-compact__score');
  if(hs)hs.innerHTML=`${_meta.autoCount} sliders calculés · <b>${_meta.coverageRate}%</b> auto`;
  const kk=document.querySelector('.hero-compact__kicker');
  if(kk){
    const dotColor=skinCategoryColor(S.skinTone);
    kk.innerHTML=`${t('carnation_lbl')} <b>${S.skinTone}</b><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${dotColor};vertical-align:middle;margin-left:6px;border:1px solid rgba(255,255,255,0.25);flex-shrink:0;"></span>`;
  }
  // Meta → label cyan dynamique (vrai preset choisi) + 3 instructions FC26
  const hm=document.querySelector('.hero-compact__meta');
  if(hm){
    const _mt = S.sliders && S.sliders._meta;
    // Phase 2.3 : on affiche bestOfficial (preset EA sélectionnable en jeu),
    // pas bestPreset (qui peut être une célébrité preset_id ≥ 10001).
    const _bpid = _mt && (_mt.bestOfficialId || _mt.bestPresetId);
    const _forme = _mt && (_mt.bestOfficialForme || _mt.bestPresetForme);
    const _headLbl = _bpid
      ? (`TÊTE DE RÉF. · PRESET ${_bpid}` + (_forme ? ` · ${String(_forme).toUpperCase()}` : ''))
      : t('ref_head');
    // Bonus UX : "INSPIRATION MORPHO · <célébrité>" quand le matcher DNA
    // a piqué une célébrité différente du preset officiel affiché.
    const _isCeleb = _mt && _mt.bestPresetEntryType === 'celebrity'
                     && _mt.bestPresetId !== _mt.bestOfficialId
                     && _mt.bestPresetDisplayName;
    const _inspirationLine = _isCeleb
      ? `<div style="color:#7a82a6;font-size:8.5px;font-weight:600;letter-spacing:0.08em;margin-bottom:6px;">INSPIRATION MORPHO · ${_mt.bestPresetDisplayName.toUpperCase()}</div>`
      : '';
    hm.innerHTML=`<div style="color:#00f0ff;font-size:9px;font-weight:700;letter-spacing:0.12em;margin-bottom:6px;">${_headLbl}</div>
      ${_inspirationLine}
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
    // Phase 2.3 : la vignette montre le preset officiel (bestOfficial), pas la
    // célébrité (qui n'a pas d'image dans ./assets/presets/).
    const _metaTh = S.sliders._meta;
    const bpId = (_metaTh && (_metaTh.bestOfficialId || _metaTh.bestPresetId)) || 9;
    img.src='./assets/presets/'+bpId+'.png';
    img.alt='Preset '+bpId;
    img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;';
    img.onerror=function(){this.style.display='none';if(ph)ph.style.display='';};
    if(corners)th.insertBefore(img,corners);else th.appendChild(img);
  }
  // Masquer l'ancienne preset9-card (déplacée dans la hero)
  const p9c=document.getElementById('preset9-card');
  if(p9c)p9c.style.display='none';
  // Alts — Têtes alternatives (top 2-4) cliquables pour switcher le preset de réf
  const at=document.getElementById('alts-thin-title');if(at)at.textContent='Top 3 alternatives';
  const ar=document.getElementById('alts-thin-row');
  if(ar){
    // Phase 2.3 : les 3 alternatives sont des presets officiels uniquement
    // (officialTopPresets), pas le pool 41 (qui inclurait des célébrités
    // avec preset_id ≥ 10001 et donc pas d'image dans ./assets/presets/).
    const _altsSrc = (_meta && _meta.officialTopPresets && _meta.officialTopPresets.length)
                     ? _meta.officialTopPresets
                     : ((_meta && _meta.topPresets) ? _meta.topPresets : []);
    const alts = _altsSrc.slice(1, 4);
    if(alts.length){
      ar.style.display='flex';ar.style.gap='8px';
      ar.innerHTML = alts.map(a=>`
        <button class="alt-head" data-preset-id="${a.id}" type="button"
                style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:1px solid rgba(0,240,255,0.2);border-radius:10px;padding:6px;cursor:pointer;min-width:0;">
          <img src="./assets/presets/${a.id}.png" alt="Preset ${a.id}"
               style="width:56px;height:56px;object-fit:cover;border-radius:8px;"
               onerror="this.style.opacity=0.2;">
          <span style="font-size:9px;color:#9ea4c4;letter-spacing:0.05em;text-align:center;line-height:1.2;">P${a.id} · ${(a.forme||'').toUpperCase()}</span>
        </button>`).join('');
      ar.querySelectorAll('.alt-head').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const chosenId = parseInt(btn.dataset.presetId, 10);
          switchToPreset(chosenId);
        });
      });
    } else {
      ar.innerHTML='';
    }
  }
  const mt=document.getElementById('mix-title');
  if(mt)mt.innerHTML=t('mix_title');
  const ml=document.getElementById('mix-list');
  if(!ml)return;ml.innerHTML='';

  // Mix Frankenstein : meilleur preset PAR zone (stashé dans _meta.zoneMix par scanToSliders).
  const zoneMix = (S.sliders && S.sliders._meta && S.sliders._meta.zoneMix) || null;
  if(!zoneMix){
    ml.innerHTML='<div style="font-size:11px;color:#64748b;padding:14px;text-align:center;">Mix non disponible</div>';
    return;
  }
  const ZONE_LABELS=[
    ['front','Front'],['sourcils','Sourcils'],['yeux','Yeux'],['nez','Nez'],
    ['joues','Joues'],['bouche','Bouche'],['menton','Menton'],['machoire','Mâchoire']
  ];
  ZONE_LABELS.forEach(([k,lbl])=>{
    const z=zoneMix[k]; if(!z) return;
    // Pastille de confiance basée sur separation
    let conf,confLbl;
    if(z.separation>0.15){       conf='#00ff88'; confLbl='FIABLE'; }
    else if(z.separation>=0.05){ conf='#ff9500'; confLbl='CORRECT'; }
    else{                         conf='#ff5577'; confLbl='APPROX.'; }
    const row=document.createElement('div');
    row.style.cssText='display:grid;grid-template-columns:90px 1fr auto;align-items:center;gap:10px;padding:9px 14px;border-radius:8px;background:rgba(0,240,255,0.03);border:1px solid rgba(0,240,255,0.10);margin-bottom:6px;';
    row.innerHTML=`<span style="font-size:11px;letter-spacing:0.08em;color:#9ea4c4;font-weight:600;">${lbl}</span>
      <span style="font-size:11px;color:#cfd5ff;font-weight:700;">Preset #${z.best}</span>
      <span style="font-size:9px;padding:3px 9px;border-radius:10px;background:${conf}22;color:${conf};letter-spacing:0.08em;font-weight:700;">${confLbl}</span>`;
    row.title=`${lbl} · Preset #${z.best} · d=${z.distance.toFixed(2)} · sep=${z.separation.toFixed(2)}`;
    ml.appendChild(row);
  });
}

// ─── SOUS-ONGLETS FC26 (noms exacts — FAÇONNAGE AVANCÉ COMPLET.md) ───
// Ordered longest-prefix-first within each family to ensure correct matching.

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

  // Ordre canonique des suffixes FC26 (Façonnage Avancé) : pilote le tri intra-bucket
  const SUFFIX_ORDER = [
    'reduire_elargir', 'bas_haut', 'neutre_haut', 'arriere_avant',
    'arrondi_angulaire', 'neutre_arrondi', 'plus_petite', 'plus_grande_petite',
    'deplacement_gd', 'neutre_avant', 'neutre_moins', 'moins_plus'
  ];
  const suffixRank = key => {
    const i = SUFFIX_ORDER.findIndex(s => key.endsWith(s));
    return i === -1 ? 999 : i;
  };

  function renderGroup(entries, familyKey, color, fam) {
    if(!entries.length) return '';
    const order = SLIDER_SUBTAB.map(s => s[1]); // ordre de référence des labels
    const buckets = new Map();
    const noSub = [];
    entries.forEach(e => {
      const sub = getSubTab(e[0]);
      if (!sub) { noSub.push(e); return; }
      if (!buckets.has(sub)) buckets.set(sub, []);
      buckets.get(sub).push(e);
    });
    const sortedLabels = [...buckets.keys()].sort((a,b) => order.indexOf(a) - order.indexOf(b));
    // Tri intra-bucket selon l'ordre canonique des suffixes (sort stable ES2019+)
    sortedLabels.forEach(label => {
      buckets.get(label).sort((a,b) => suffixRank(a[0]) - suffixRank(b[0]));
    });

    const renderRow = ([key,aiVal]) => {
      const {v,src} = getVal(key,aiVal,fam);
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
    };

    let html = `<div class="slider-section-lbl" style="color:${color};">${familyKey}</div>`;
    noSub.forEach(e => { html += renderRow(e); });
    sortedLabels.forEach(label => {
      html += `<div class="slider-subgroup-lbl">${esc(label)}</div>`;
      buckets.get(label).forEach(e => { html += renderRow(e); });
    });
    return html;
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
  const lines=[`=== SCANMYFACE V2 · ${S.skinTone.toUpperCase()} ===`,
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
  ctx.fillText(`${S.skinTone}`,360,78);
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
  S.landmarks=null;S.sliders=null;S.tddfa=null;S.skinTone='Claire-bronzée';S.imgNaturalW=1;S.imgNaturalH=1;S.cropSource=null;

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

  // Swatches — reset aux 5 catégories FC26 (défaut : Claire-bronzée, médian)
  buildSwatches('Claire-bronzée');
  const sg=document.querySelector('.skintone__suggest');
  if(sg)sg.innerHTML=`${t('suggests')} <b>Claire-bronzée</b>`;

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
  buildSwatches('Claire-bronzée');

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

  // Wrapper goToStep : force le rendu réel de l'étape 4 à chaque navigation
  (function(){
    const _orig = window.goToStep;
    window.goToStep = function(n){
      _orig && _orig(n);
      if(Number(n) === 4){
        buildZoneTabs();
        renderZoneSliders(S.activeZone || 'crane');
      }
    };
  })();

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
