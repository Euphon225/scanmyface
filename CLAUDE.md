# ScanMyFace.tech — FC26 PWA

## Stack
- Vanilla JS + HTML/CSS pur, SPA 4 steps (100dvh par step)
- Fichiers principaux : script_spa.js, scanToSliders_v6.js, app_index_v2.html (= index.html dans app/), style.css, sw.js
- Backend : Node.js/Express (server.js) sur Azure App Service (Germany West Central)
- Deploy : Vercel (auto-deploy depuis GitHub main) | Secrets : Doppler
- Domain : scanmyface.tech | Repo : github.com/Euphon225/scanmyface
- Dossier local : /Users/loriekeita/Desktop/FC26/app/

## Règles absolues
- Zéro framework JS (pas de React, Vue, etc.)
- Azure Face API → uniquement via server.js (endpoint /api/matchFace), jamais côté client
- Service Worker : incrémenter CACHE_VERSION dans sw.js à CHAQUE modification de script_spa.js, scanToSliders_v6.js ou style.css
- SW actuel : fc26-cranium-v60 (à incrémenter)
- Fonctions protégées à ne JAMAIS modifier : softClampSlider(), extractMorphRatios(), computePresetScore(), selectBestPreset()
- Mobile-first : tester à 375px avant tout commit
- Chemins fichiers : tous avec ./ prefix (ex: ./style.css, ./9.png, ./sw.js)

## Architecture sliders FC26
- 303 sliders organisés en 3 familles : S (Squelette 103), C (Chair 163), G (Graisse 37)
- Table P9 dans script_spa.js organisée par famille : P9 = { S: {...}, C: {...}, G: {...} }
- getVal(key, aiVal, fam) — toujours passer la famille ('S', 'C', ou 'G')
- Preset de référence : Preset 9 (image 9.png à la racine de app/)
- Source des valeurs P9 : fichier FAÇONNAGE AVANCÉ COMPLET.md
- scanToSliders_v6.js : auto() pour les sliders calculables, preset() pour les autres

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

## Déploiement
- Vercel connecté à GitHub (auto-deploy sur push main)
- Commandes git standard :
  cd '/Users/loriekeita/Desktop/FC26'
  git add -A
  git commit -m "description"
  git push origin main
- Vérifier build Vercel sur vercel.com avant de tester en prod

## Fichiers supprimés (ne pas recréer)
- PRESETS_DB_v3.js (remplacé par P9 dans script_spa.js)
- script.js (ancienne version, remplacé par script_spa.js)
- PERFECT_RECIPE_ALGORITHM.js, PERFECT_RECIPE_DEMO.js
- Tous les fichiers .py (scripts de dev obsolètes)
- ruvector.db, agentdb.rvf

## Roadmap V2
- Calibration des plages _norm() dans scanToSliders_v6.js (impact ressemblance)
- Détection Graisse via analyse contour visage (MediaPipe)
- Support UFC6 (sortie 19 juin 2026)
- Support FC27 (sortie 25 septembre 2026)
- Export PDF zone par zone
- Onboarding UFC6/FC27 spécifique
- Bouton UFC6/NBA2K "Prochainement" avec bottom sheet + capture email
- Modèle ML sur célébrités pour améliorer précision
- Pass Pro €3.99/mois (analyses illimitées + export PDF + sans pub)
- Pass Scan €1.99 (10 analyses supplémentaires)
- Pub Google AdSense sur page résultats

## Monétisation actuelle
- App gratuite au lancement
- Pass Retouches 24h à €2.49 via Stripe (Test mode)
- Stripe : mode Test en dev (sk_test_...), webhooks validés server-side dans server.js
