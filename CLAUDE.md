# ScanMyFace.tech — FC26 PWA

## Stack
- Vanilla JS + HTML/CSS pur, SPA 4 steps (100dvh par step)
- Fichiers principaux : script_spa.js, scanToSliders_v6.js, app_index_v2.html (= index.html dans app/), style.css, sw.js
- Backend : Node.js/Express (server.js) sur Azure App Service (Germany West Central)
- Deploy : Vercel (auto-deploy depuis GitHub main) | Secrets : Doppler
- Domain : scanmyface.tech | Repo : github.com/Euphon225/scanmyface
- Dossier local : /Users/loriekeita/Desktop/FC26/app/
- ⚠️ Repo sur le Bureau Mac = synchronisé iCloud → corrompt régulièrement .git/index
  (erreur "unable to map index file"). Fix : rm -f .git/index && git reset.
  Recommandé : déplacer le projet hors Bureau/Documents (ex: ~/dev/FC26).

## Règles absolues
- Zéro framework JS (pas de React, Vue, etc.)
- Azure Face API → uniquement via server.js (endpoint /api/matchFace), jamais côté client
- Service Worker : incrémenter CACHE_VERSION dans sw.js à CHAQUE modification de script_spa.js, scanToSliders_v6.js ou style.css
- SW actuel : fc26-cranium-v77 (à incrémenter)
- Mobile-first : tester à 375px avant tout commit
- Chemins fichiers : tous avec ./ prefix (ex: ./style.css, ./9.png, ./sw.js)

## ⚠️ Fonctions — état réel (correction d'une ancienne erreur de doc)
L'ancien CLAUDE.md listait 4 "fonctions protégées à ne jamais modifier" :
softClampSlider(), extractMorphRatios(), computePresetScore(), selectBestPreset().
Vérification dans le code (mai 2026) :
- softClampSlider() : EXISTE — créée dans scanToSliders_v6.js (clamp 0-100 + arrondi).
  Utilisée par les blocs élancement et volume. OK de la réutiliser, ne pas la dupliquer.
- extractMorphRatios(), computePresetScore(), selectBestPreset() : N'EXISTENT PLUS.
  Vestiges de l'ancienne archi (script.js + PRESETS_DB, sélection du meilleur preset).
  La V6 n'utilise plus de scoring/sélection → ces fonctions ont disparu avec script.js.
  → La règle "ne jamais modifier ces 4 fonctions" est obsolète.

## Architecture sliders FC26
- 303 sliders organisés en 3 familles : S (Squelette 103), C (Chair 163), G (Graisse 37)
- Table P9 dans script_spa.js organisée par famille : P9 = { S: {...}, C: {...}, G: {...} }
- getVal(key, aiVal, fam) — toujours passer la famille ('S', 'C', ou 'G')
- Preset de référence : Preset 9 (image 9.png à la racine de app/)
- Source des valeurs P9 : fichier FAÇONNAGE AVANCÉ COMPLET.md
- scanToSliders_v6.js : auto() pour les sliders calculables, preset() pour les autres
- getVal() : si aiVal === 50 (= "non mesuré"), substitue la valeur P9 de la famille
  → src:'ai' (mesuré) / src:'p9' (valeur de base Preset 9) / src:'neutral' (50 pur)
  → la source EST affichée à l'UI : badge 🎯 (mesuré, cyan) / badge P9 (gris) / grisé (neutral)
    (lignes ~1040-1042 de script_spa.js). Quick win restant : compteur de synthèse + phrase
    d'aide pour guider l'utilisateur vers les sliders P9 à retoucher.

## Moteur FC26 — règles critiques
- Le moteur FC26 est 100% MODULAIRE : copier tous les attributs écrase complètement le DNA de base
- Les sous-menus R2 exposent les familles Graisse et Squelette
- PAS de logique "relative au DNA de base" — tout est absolu

## Traductions
- Système TR dans script_spa.js : TR = { fr: {...}, en: {...} }
- Appel via t('clé') — toujours utiliser t() pour les textes UI
- setLanguage() re-render l'étape active automatiquement
- en.json et fr.json à la racine FC26/ pour la landing page (système séparé)

## Flow analyse
1. Upload photo ou capture caméra
2. Cropper.js dans le viewport (pas d'overlay séparé)
3. confirmCrop() → showPhoto() → runAnalysis()
4. runAnalysis() : Azure quality check (non-bloquant si no_face) + MediaPipe en parallèle
5. Azure bloquant uniquement pour : too_blurry, bad_angle, bad_light
6. Azure no_face → warning console + continue avec MediaPipe
7. runMP() → scanToSliders_v6.js → rendu étape 3 puis 4

## Flow caméra live
- Caméra live dans le viewport
- Bouton "Capturer" → photo figée
- Boutons "Reprendre" + "Lancer l'analyse" (PAS de cropper pour la caméra)
- Reprendre → relance startWebcam()

## Carnations FC26
- 10 carnations (1 = plus clair, 10 = plus foncé)
- Couleurs réelles dans FC26_CARNATIONS dans script_spa.js
- Détection via ITA (CIELAB) — biasFix coefficient 0.6 pour corriger biais éclairage
- Azure no_face ne bloque pas la carnation (détectée par MediaPipe)

## Composants UI clés
- Topbar : logo + step indicator + FR|EN + bouton ✕ (reset global)
- Étape 2 : viewport + swatches 10 carnations + bouton lancer analyse
- Étape 3 : hero card (image preset 9 + instructions ①②③) + familles S/C/G accordion
- Étape 4 : zones accordion (9 zones) + copy + export PNG
- Onboarding : 3 slides au premier lancement (localStorage smf_onboarded)
- Bouton ✕ : reset complet = même comportement que onNewScan()

## Zones FC26 (étape 4)
- Crâne, Front, Sourcils, Yeux, Nez, Joues, Bouche, Menton, Mâchoire
- Filtrage par préfixes dans ZONES dans script_spa.js
- renderZoneSliders(zone) → renderGroup(entries, familyKey, color, fam)

## Desktop (>600px)
- .app fixé à 390×844px centré dans le viewport
- #cropper-overlay : position:absolute !important via CSS <head> — ne pas mettre position:fixed en JS
- body : display:flex + align-items:center + justify-content:center

## Service Worker
- Stratégie : network-first
- Fichiers cachés : index.html, style.css, script_spa.js, scanToSliders_v6.js, manifest.json
- Enregistrement : navigator.serviceWorker.register('./sw.js', {scope: './'})

## Azure
- Resource : scanmyface-face-api (Germany West Central, F0 free tier)
- Endpoint backend : https://scanmyface-site-hdbheranbyd8htc5.germanywestcentral-01.azurewebsites.net
- Image envoyée en POST body JSON : { image: dataUrl } (PAS en GET URL)
- shrinkForAzure() : réduit à 512px max, JPEG 75% avant envoi
- CORS : ajouter scanmyface.tech + vercel domain dans server.js pour prod

# ════════════════════════════════════════════════════════════
# BLOCS ALGO CALIBRÉS (mai 2026) — valeurs à NE PAS reperdre
# ════════════════════════════════════════════════════════════

## Bloc ÉLANCEMENT (visage long vs court) — scanToSliders_v6.js ✅ validé en jeu
- Problème résolu : crane_bas_haut ne mesurait qu'un segment de front (L10→L9), ne captait
  pas l'élancement. crane_arriere_bas_haut / crane_couronne_bas_haut étaient en preset.
- Signal : faceRatio = D_H / D_W (hauteur lisière→menton / largeur zygomatique).
  D_W = dist(L234,L454), D_H = dist(L10,L152). Élevé = visage long, bas = visage rond/court.
- Méthode : déviation autour des ancres P9 (P9 = ancre unique).
  const R_P9 = 1.070;   // MESURÉ sur 9.png (ne pas remettre 1.30 estimé)
  const K    = 45;      // sensibilité (180 puis 100 saturaient à 100 sur visages longs)
  const delta = (faceRatio - R_P9) * K;
  auto(S, 'crane_bas_haut',          softClampSlider(69 + delta));        // ancre P9 = 69
  auto(S, 'crane_arriere_bas_haut',  softClampSlider(75 + delta));        // ancre P9 = 75
  auto(S, 'crane_couronne_bas_haut', softClampSlider(14 + 1.4 * delta));  // ancre P9 = 14, ×1.4
- Couronne ×1.4 (PLUS sensible) : un visage long étire le crâne vers le sommet → couronne haute.
  (le facteur initial 0.5 plafonnait la couronne à ~34, trop bas — corrigé).
- Validé en jeu : Elon (faceRatio 1.477) → 87/93/40, tête visiblement plus longue. 9.png → 69/75/14.

## Bloc PLÉNITUDE / VOLUME (graisse mâchoire/joues) — scanToSliders_v6.js ✅ validé en jeu
- Contexte : volume_sliders de run3DDFA_mesh.js est VIDE (impossible de mesurer l'épaisseur de
  graisse en 3D sans mesh de référence lean vs observé). Proxy 2D mis en place à la place.
- Signal : taper = jawW / cheekW (effilement du visage).
  cheekW = dist(L116,L345) (pommettes), jawW = dist(L172,L397) (mâchoire). Mêmes landmarks que
  joues_reduire_elargir / machoire_reduire_elargir. Élevé = visage plein, bas = maigre/effilé.
- Méthode : pente INDIVIDUELLE par slider, ancrée sur P9.
  const TAPER_P9 = 0.879;   // MESURÉ sur 9.png
  const dT = taper - TAPER_P9;
  auto(C, 'machoire_moins_plus', softClampSlider(39 + 730 * dT)); // ancre P9 39, dominant
  auto(C, 'joues_moins_plus',    softClampSlider(29 + 670 * dT)); // ancre P9 29
  auto(G, 'bajoue_moins_plus',   softClampSlider(50 + 720 * dT)); // ancre P9 50
- Tout le reste des _moins_plus → preset() = P9 (voir "ce qui ne marche pas" ci-dessous).
- Validé en jeu : Elon plein (taper 0.953) → joufflu net ; Cumberbatch (0.817) → anguleux ;
  les deux visiblement distincts ; PAS de jitter entre 2 scans (signal stable).

### 3 visages de calibration (pour recalibrer plus tard)
| Visage             | taper  | machoireC | jouesC | bajoue | machoireG | joues_sup | joues_inf |
|--------------------|--------|-----------|--------|--------|-----------|-----------|-----------|
| Cumberbatch maigre | 0.822  | 0         | 0      | 0      | 0         | 66        | 17        |
| P9 (ancre)         | 0.879  | 39        | 29     | 50     | 48        | 26        | 53        |
| Elon plein         | 0.953  | ~92-100   | 88     | 94     | 64→47*    | 70        | 16        |
(*machoireG : 64 jugé à l'œil mais 84 calculé donnait un "visage d'obèse" → repassé en P9)
Valeurs jugées à l'œil dans FC26 (perceptuelles, non absolues), pas des mesures exactes.

### Ce qui NE marche PAS avec le taper (leçon clé — ne pas re-tenter sans nouveau signal)
- joues_sup_moins_plus / joues_inf_moins_plus : NON-MONOTONES. sup haut chez maigre ET plein,
  bas chez P9 ; inf fait l'inverse. C'est une BASCULE VERTICALE (le volume de joue se déplace
  haut↔bas, la quantité ne change pas : sup+inf ≈ constant). Un signal de largeur (taper) ne peut
  pas le capter. → laissés en P9. À reprendre avec un signal de POSITION VERTICALE de la joue ou 3DDFA.
- machoire_moins_plus GRAISSE : ne suit pas le taper de façon exploitable (pente quasi nulle/négative),
  une pente forte donnait un visage trop gras. → laissé en P9.
- menton_moins_plus / sous_menton_moins_plus : IMPACT NUL en jeu (0 vs 100 ≈ pas de différence
  visible). → laissés en P9, ne pas calculer.

## Fichiers supprimés (ne pas recréer)
- PRESETS_DB_v3.js (remplacé par P9 dans script_spa.js)
- script.js (ancienne version, remplacé par script_spa.js) — contenait extractMorphRatios,
  computePresetScore, selectBestPreset (disparus)
- PERFECT_RECIPE_ALGORITHM.js, PERFECT_RECIPE_DEMO.js
- ruvector.db, agentdb.rvf

## Ressemblance — état actuel et plafonds

### AUDIT RÉEL scanToSliders_v6.js (mai 2026) — corrige l'ancien décompte erroné "256/47"
L'ancien CLAUDE.md affirmait "256/303 calculés, 47 bloqués, famille C quasi-complète". FAUX.
Décompte réel issu du code :
- Sliders MESURÉS via auto() : ~117 → ~122 après ajout des blocs élancement (+2) et volume (+3)
- Sliders NON mesurés (preset → fallback P9, ou placeholder 3DDFA) : ~185

| Famille | auto (mesurés) | preset (→ P9) | presetZ | presetA | total |
|---------|----------------|---------------|---------|---------|-------|
| S       | ~52            | ~26           | 20      | 6       | 104   |
| C       | ~52            | ~99           | 14      | 0       | 165   |
| G       | ~18            | ~19           | 0       | 0       | 37    |

- La famille C n'est PAS "quasi-complète" : la majorité de ses _moins_plus / _arriere_avant /
  _plus_petite sont en preset → valeur P9, pas le visage scanné.
- presetZ (~34) + presetA (~6) = placeholders en attente de 3DDFA V2 (tombent à 50 en V6).

### Cause racine : l'axe Z
Tout ce qui dépend du VOLUME / PROFONDEUR (Z) est non mesurable sur photo 2D unique.
Les proxys 2D (élancement, taper) débloquent une partie en s'ancrant sur P9, mais restent
approximatifs. Le gold standard reste 3DDFA (mesh XYZ).

### Ressemblance perçue (cas test Elon, mai 2026)
- Scan brut V6 initial : ~30-35% (dominé par le Preset 9 sous-jacent)
- Après ajustement manuel du volume + pilosité : ~50-55%
- Après blocs élancement + volume calibrés (auto) : à re-mesurer, mais le volume mâchoire/joues
  et la longueur du visage sortent maintenant corrects sans intervention manuelle.

### Roadmap ressemblance (par ordre d'impact)
1. PRIORITÉ 1 — 3DDFA V2 ONNX in-browser (+15-20%)
   - Modèle ONNX (~30MB) via onnxruntime-web, 100% client, cacheable SW
   - Output : 40 shape + 12 pose + 10 expression. Pipeline Promise.all(MediaPipe, 3DDFA) ~80ms
   - Débloquerait les sliders de volume/profondeur (les ~185 P9), y compris joues_sup/inf
     (besoin d'un signal vertical 3D) et machoire_moins_plus
   - Cible : 75-82%. Approche Option B (vertices mesh XYZ). P9 = ancre unique (β N(0,1))
2. Alternative axe Z (+20%) → 2 photos (face + 3/4 à 45°), MediaPipe sur les 2 angles
3. MICA sur Azure (+8% sur 3DDFA) → β FLAME[300] → mapping complet (V3)
- Plafond absolu FC26 : ~90% (limite moteur Frostbite ; EA atteint 85-92% en studio multi-cam)

### Décisions architecturales actées (mai 2026)
- ❌ CelebA + Azure Custom Vision : écarté (attributs binaires vs continus, dataset biaisé)
- ❌ DepthAnything V2 / MiDaS : remplacé par 3DDFA V2 (précision face-specific)
- ✅ 3DDFA V2 ONNX : approche principale V2
- ✅ MICA (Azure) : approche V3
- ✅ Proxys 2D ancrés P9 (élancement, taper) : méthode validée pour débloquer du volume avant 3DDFA

## Positionnement marché — insights clés
- ScanMyFace est LA solution unique sur FC26 : aucun outil équivalent (vérifié mai 2026)
- NBA 2K a un face scan natif MAIS unanimement jugé catastrophique → opportunité réelle
- Marché prouvé : créateurs YouTube/TikTok font des vues avec tutos de sliders manuels
- Référence plafond : FUTBin = 32-40M visites/mois (même communauté FC)
- Ready Player Me (techno comparable) : racheté par Netflix en 2025, 3.8M$/an de revenus

## Monétisation — modèle restructuré (mai 2026)
| Niveau | Prix | Ce que ça donne |
|--------|------|-----------------|
| Freemium | 0€ | Scan complet, sliders limités à 50%, watermark PNG |
| Pass Scan | €3.99 (permanent) | 100% sliders + Façonnage Avancé + PNG sans watermark |
| Pro mensuel | €7.99/mois ou €59.99/an | Scans illimités + tous jeux + historique + Précision Pro |
| Lifetime Deal | €24.99 (lancement, 30j) | Accès à vie, limité à 500 achats |
- Freemium = moteur d'acquisition viral (watermark = pub organique)
- Stripe en Test mode → passer en Live pour le lancement
- API B2B (6-12 mois) : €99-999/mois selon volume

## Roadmap jeux (ordre priorité)
1. FC26 ✅ (live)
2. UFC 6 (sortie 19 juin 2026) — sliders similaires à FC26
3. NBA 2K — opportunité forte (face scan natif 2K cassé)
4. WWE 2K
5. FC27 (sortie 25 septembre 2026) — mise à jour annuelle obligatoire

## Roadmap V2 technique

### PRIORITÉ — 3DDFA V2 ONNX (avant lancement UFC6 / 19 juin 2026)
- Étape 1 : session Python locale → exporter ONNX + extraire indices BFM des .npy
  (mesh 53 215 vertices ; indices déjà partiellement dans bfm_indices.js)
- Étape 2 : intégrer onnxruntime-web (v1.26+) en Vanilla JS, cache SW
- Étape 3 : mesures XYZ → débloquer les ~185 sliders P9 (prioriser volume + joues_sup/inf vertical)
- Étape 4 : correction pose (yaw) sur sliders C existants
- Calibration : P9 ancre unique (β gaussien N(0,1), plages ±2.5σ)

### Autres V2
- joues_sup/inf via signal vertical (bascule haut↔bas de la joue) — voir leçon bloc volume
- Affichage source slider : badge déjà là, ajouter compteur de synthèse + phrase d'aide
- 2 photos optionnelles (face + 3/4) pour Z sans modèle externe
- Export PDF zone par zone ; onboarding UFC6/FC27 ; bouton "Prochainement" + capture email
- Investiguer nez (raté au 1er test : trop fin/pointu) et menton (trop étroit)

### V3 (post-lancement)
- MICA sur Azure → β FLAME[300] → mapping FC26 total (+8% sur 3DDFA)
- 3DDFA V3 (CVPR 2024) : BFM 35 709 vertices + masques segmentation → indices directs
- Régression linéaire β → sliders FC26 (matrice W[40×303]) sur ~50 visages annotés
