# ScanMyFace.tech — FC26 PWA

## Stack
- Vanilla JS + HTML/CSS pur, SPA 4 steps (100dvh par step)
- Fichiers principaux : script_spa.js, scanToSliders_v6.js, index.html, style.css, sw.js
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
- Service Worker : incrémenter CACHE_VERSION dans sw.js à CHAQUE modif de script_spa.js,
  scanToSliders_v6.js ou style.css
- SW actuel : fc26-cranium-v84 (à incrémenter)
- Mobile-first : tester à 375px avant tout commit
- Chemins fichiers : tous avec ./ prefix (ex: ./style.css, ./9.png, ./sw.js)

## ⚠️ Fonctions — état réel (correction d'une ancienne erreur de doc)
L'ancien CLAUDE.md listait 4 "fonctions protégées" : softClampSlider, extractMorphRatios,
computePresetScore, selectBestPreset. Vérif dans le code (mai 2026) :
- softClampSlider() : EXISTE (créée dans scanToSliders_v6.js, clamp 0-100 + arrondi).
  Utilisée par les blocs élancement et volume. Réutiliser, ne pas dupliquer.
- extractMorphRatios / computePresetScore / selectBestPreset : N'EXISTENT PLUS.
  Vestiges de l'ancienne archi (script.js + PRESETS_DB). La règle "ne jamais modifier" est obsolète.

## Architecture sliders FC26
- 303 sliders en 3 familles : S (Squelette 103), C (Chair 163), G (Graisse 37)
- Table P9 dans script_spa.js : P9 = { S:{...}, C:{...}, G:{...} } — Preset 9 = ancre de référence (9.png)
- getVal(key, aiVal, fam) : si aiVal === 50 (= non mesuré) → substitue la valeur P9 de la famille.
  src:'ai' (mesuré, badge 🎯 cyan) / src:'p9' (badge P9 gris) / src:'neutral' (grisé). Affiché à l'UI.
- scanToSliders_v6.js : auto() pour les sliders calculables, preset() pour les autres
- _dist = distance 3D (inclut .z) ; _norm(ratio, min, max) = clamp puis 0-100

## ⚠️ OUTILS CONSOLE DEV (à coller dans la console navigateur, script classique → S accessible)
Diagnostic ratios bruts (calibration) :
  smf()  // après scan → table de tous les ratios (faceRatio, taper, nez, bouche) + bornes
Voir des sliders FINAUX filtrés par mot-clé :
  smfShow("epaisseur_levre")        // tous les sliders contenant ce mot, avec valeur FC26 finale
  smfShow("machoire", "joues")      // plusieurs mots
Copier toute la recette FC26 : window.onCopyRecipe()  (déjà dans le code, copie le presse-papier)
Mesure Y brut d'un point : S.landmarks[i].y  (S = état global, S.sliders = dernier scan)

## Moteur FC26 — règles critiques
- Moteur 100% MODULAIRE : copier tous les attributs écrase complètement le DNA de base
- Sous-menus R2 = familles Graisse et Squelette. PAS de logique "relative au DNA" — tout est absolu

## Traductions
- TR = { fr:{...}, en:{...} } dans script_spa.js ; appel via t('clé') ; setLanguage() re-render
- en.json / fr.json à la racine pour la landing page (système séparé)

## Flow analyse
1. Upload photo ou caméra → 2. Cropper.js dans le viewport → 3. confirmCrop → showPhoto → runAnalysis
4. runAnalysis : Azure quality check (non-bloquant si no_face) + MediaPipe en parallèle
5. Azure bloquant pour : too_blurry, bad_angle, bad_light. no_face → continue avec MediaPipe
6. runMP → scanToSliders_v6.js → S.sliders → rendu étape 3 puis 4

## Carnations
- 10 carnations, FC26_CARNATIONS dans script_spa.js. ITA (CIELAB), biasFix 0.6.

## Azure
- Resource scanmyface-face-api (Germany West Central, F0). Endpoint backend azurewebsites.net
- Image POST body JSON { image: dataUrl }. shrinkForAzure() : 512px max, JPEG 75%. CORS prod à gérer.

# ════════════════════════════════════════════════════════════
# BLOCS ALGO CALIBRÉS (mai 2026) — valeurs à NE PAS reperdre
# Méthode validée : log/smf() → scanner visages variés aux extrêmes → garder ce qui a du
# signal, repasser en P9 ce qui est plat/non-monotone → valider EN JEU (pas juste les chiffres).
# ════════════════════════════════════════════════════════════

## Bloc ÉLANCEMENT (visage long vs court) ✅ validé en jeu
- Signal : faceRatio = D_H / D_W. D_W=dist(L234,L454), D_H=dist(L10,L152). Haut=long, bas=rond/court.
- Déviation autour des ancres P9 :
  const R_P9 = 1.070;   // MESURÉ sur 9.png (ne pas remettre 1.30 estimé)
  const K    = 45;      // 180 puis 100 saturaient à 100 sur visages longs
  const delta = (faceRatio - R_P9) * K;
  auto(S,'crane_bas_haut',          softClampSlider(69 + delta));        // ancre 69
  auto(S,'crane_arriere_bas_haut',  softClampSlider(75 + delta));        // ancre 75
  auto(S,'crane_couronne_bas_haut', softClampSlider(14 + 1.4 * delta));  // ancre 14, ×1.4
- Couronne ×1.4 (PLUS sensible) : visage long → crâne étiré vers le sommet → couronne haute.
- Validé : Elon (faceRatio 1.477) → 87/93/40 ; 9.png → 69/75/14.

## Bloc PLÉNITUDE / VOLUME (graisse mâchoire/joues) ✅ validé en jeu
- volume_sliders de run3DDFA_mesh.js VIDE (épaisseur graisse non mesurable en 3D sans mesh ref).
  Proxy 2D mis en place.
- Signal : taper = jawW / cheekW. cheekW=dist(L116,L345), jawW=dist(L172,L397). Haut=plein, bas=maigre.
- Pente INDIVIDUELLE par slider, ancrée P9 :
  const TAPER_P9 = 0.879;   // MESURÉ sur 9.png
  const dT = taper - TAPER_P9;
  auto(C,'machoire_moins_plus', softClampSlider(39 + 730 * dT)); // ancre 39, dominant
  auto(C,'joues_moins_plus',    softClampSlider(29 + 670 * dT)); // ancre 29
  auto(G,'bajoue_moins_plus',   softClampSlider(50 + 720 * dT)); // ancre 50
- Reste des _moins_plus → preset() = P9 (voir "ne marche pas" ci-dessous).
- Validé : Elon plein (0.953) joufflu net ; Cumberbatch (0.817) anguleux ; pas de jitter.

### 3 visages de calibration volume
| Visage             | taper  | machoireC | jouesC | bajoue |
|--------------------|--------|-----------|--------|--------|
| Cumberbatch maigre | 0.822  | 0         | 0      | 0      |
| P9 (ancre)         | 0.879  | 39        | 29     | 50     |
| Elon plein         | 0.953  | ~96       | 88     | 94     |

### Volume — ce qui NE marche PAS avec le taper (ne pas re-tenter sans nouveau signal)
- joues_sup / joues_inf _moins_plus : NON-MONOTONES = bascule verticale (sup+inf ≈ constant).
  Un signal de largeur ne peut pas le capter. → P9. À reprendre avec signal vertical ou 3DDFA.
- machoire_moins_plus GRAISSE : pente quasi nulle, forte pente → "visage d'obèse". → P9.
- menton / sous_menton _moins_plus : IMPACT NUL en jeu (0 vs 100 ≈ identique). → P9, ne pas calculer.

## Bloc NEZ ✅ validé en jeu (largeur), reste P9 pour la 3D
- Largeur narines (nez_reduire_elargir) : signal exploitable, bornes resserrées.
  auto(S,'nez_reduire_elargir', _norm(dist(L129,L358)/D_W, 0.24, 0.36)); // était 0.14-0.42 (trop large)
  Validé en jeu : Ariana (0.275)→narines fines vs Lebron (0.323)→narines prononcées.
- Largeur de POINTE (pointe_nez_sup/inf_reduire_elargir) : SIGNAL PLAT en 2D (étendue ~0.01,
  dans le bruit MediaPipe — la pointe est une structure de profondeur). → preset() = P9. NE PAS recalibrer.
- Arrondi pointe / évasement ailes (ext_narine_*) / profondeur (_arriere_avant) : axe Z → P9 (attend 3DDFA).
- Diagnostic 6 visages (ratios narines /D_W) : Ariana 0.276, Elon 0.273, Zlatan 0.283,
  Haaland 0.284, P9 0.295, Lebron 0.320. (pointe : 0.075-0.10 pour tous = plat, confirmé).

## Bloc BOUCHE / LÈVRES ✅ validé en jeu (largeur + épaisseur + position)
Bonne nouvelle : l'épaisseur des lèvres est une distance verticale FRONTALE → mesurable en 2D
(contrairement à la pointe du nez). Vrai signal sur les 3 mesures clés.
- Largeur bouche : auto(S,'bouche_reduire_elargir', _norm(dist(L61,L291)/D_W, 0.28, 0.46)); // était 0.22-0.55
- Épaisseur lèvre SUP : auto(C,'epaisseur_levre_sup_reduire_elargir', _norm(dist(L0,L13)/D_H, 0.042, 0.072));
- Épaisseur lèvre INF : auto(C,'epaisseur_levre_inf_reduire_elargir', _norm(dist(L14,L17)/D_H, 0.038, 0.092));
- Position verticale lèvre SUP (garde le "100 -", sens correct) :
  auto(C,'epaisseur_levre_sup_bas_haut', 100 - _norm((L0.y+L13.y)/2, 0.529, 0.753)); // Kim→75, Zlatan→0
- Position verticale lèvre INF (⚠️ "100 -" RETIRÉ — était inversé : inf pleine = valeur BASSE) :
  auto(C,'epaisseur_levre_inf_bas_haut', _norm((L14.y+L17.y)/2, 0.570, 0.793)); // Kim→23, Zlatan→93
- ⚠️ LEÇON : sup et inf bas_haut ont des SENS OPPOSÉS. Sup pleine = valeur haute (100-).
  Inf pleine = valeur basse (pas de 100-). Vérifié en jeu, ne pas re-uniformiser.
- Arrondi arc de cupidon (_arrondi_angulaire) + projection (_arriere_avant) + volume (_moins_plus) → P9 (Z, 3DDFA).

### Visages de calibration bouche (ratios bruts + Y position)
| Visage | larg /D_W | ép_sup /D_H | ép_inf /D_H | sup Y | inf Y |
|--------|-----------|-------------|-------------|-------|-------|
| Zlatan (fines)   | 0.354 | 0.048 | 0.046 | 0.753 | 0.777 |
| 9.png (P9)       | 0.343 | 0.059 | 0.061 | -     | -     |
| Elon             | 0.363 | 0.059 | 0.060 | -     | -     |
| Ariana           | 0.403 | 0.063 | 0.075 | -     | -     |
| Kim (pulpeuses)  | 0.398 | 0.068 | 0.087 | 0.585 | 0.621 |
⚠️ Scanner bouche FERMÉE, neutre (bouche ouverte fausse l'épaisseur via landmarks 13/14).

## Fichiers supprimés (ne pas recréer)
- PRESETS_DB_v3.js, script.js (ancienne archi : extractMorphRatios/computePresetScore/selectBestPreset),
  PERFECT_RECIPE_*.js, ruvector.db, agentdb.rvf

## Ressemblance — état actuel et plafonds

### AUDIT RÉEL scanToSliders_v6.js (mai 2026) — corrige l'ancien "256/47" erroné
- Sliders MESURÉS via auto() : ~117 → ~125 après blocs élancement/volume/nez/bouche
- Sliders NON mesurés (preset → P9, ou placeholder 3DDFA) : ~180
- La famille C n'est PAS "quasi-complète" : majorité de ses _moins_plus / _arriere_avant / _plus_petite en P9.
- Cause racine : tout ce qui dépend du VOLUME / PROFONDEUR (Z) est non mesurable en 2D unique.
  Les proxys 2D (élancement, taper, largeurs) débloquent une partie via ancrage P9, mais restent approximatifs.

### Ressemblance perçue (cas test, mai 2026)
- Scan brut V6 initial : ~30-35% (dominé par P9)
- Après blocs calibrés (élancement + volume + nez largeur + lèvres) : nettement mieux, volume/longueur/
  lèvres sortent corrects sans intervention manuelle. À re-mesurer globalement.

### Roadmap ressemblance (par impact)
1. PRIORITÉ — 3DDFA V2 ONNX in-browser (+15-20%). ONNX ~30MB via onnxruntime-web, 100% client, cache SW.
   Débloquerait les sliders Z/volume restants (~180 P9) : pointe nez, évasement narines, arrondis,
   projection lèvres, joues_sup/inf (signal vertical). Option B (vertices mesh XYZ). P9 = ancre unique.
2. Alternative 2 photos (face + 3/4) pour Z sans modèle externe (+20%).
3. MICA Azure (+8% sur 3DDFA) → β FLAME[300] (V3).
- Plafond absolu FC26 ~90% (moteur Frostbite ; EA atteint 85-92% en studio multi-cam).

### Décisions actées
- ❌ CelebA + Azure Custom Vision (binaire vs continu, dataset biaisé)
- ❌ DepthAnything V2 / MiDaS → remplacé par 3DDFA V2
- ✅ 3DDFA V2 ONNX (V2) ; ✅ MICA Azure (V3)
- ✅ Proxys 2D ancrés P9 (élancement, taper, largeurs) : méthode validée pour débloquer du signal avant 3DDFA

## Positionnement marché
- ScanMyFace = solution unique sur FC26 (vérifié mai 2026). NBA 2K natif jugé catastrophique → opportunité.
- Marché prouvé (tutos sliders manuels YouTube/TikTok). FUTBin = 32-40M visites/mois. RPM racheté Netflix 2025.

## Monétisation (mai 2026)
| Niveau | Prix | Contenu |
|--------|------|---------|
| Freemium | 0€ | Scan complet, sliders limités à 50%, watermark |
| Pass Scan | €3.99 permanent | 100% sliders + Façonnage Avancé + PNG sans watermark |
| Pro | €7.99/mois ou €59.99/an | Illimité + tous jeux + historique + Précision Pro |
| Lifetime | €24.99 (lancement, 30j, 500 max) | Accès à vie |
- Stripe en Test mode → passer en Live. API B2B (6-12 mois) €99-999/mois.

## Roadmap jeux
1. FC26 ✅ (live) — 2. UFC 6 (19 juin 2026) — 3. NBA 2K — 4. WWE 2K — 5. FC27 (25 sept 2026)

## Roadmap V2 technique
### PRIORITÉ 3DDFA V2 ONNX (avant UFC6 / 19 juin 2026)
- Étape 1 : session Python → ONNX + extraire indices BFM des .npy (cf. bfm_indices.js)
- Étape 2 : onnxruntime-web (v1.26+) Vanilla JS, cache SW, Promise.all(MediaPipe, 3DDFA)
- Étape 3 : mesures XYZ → débloquer les ~180 sliders P9 (prioriser volume + joues_sup/inf vertical + pointe nez)
- Étape 4 : correction pose (yaw) sur sliders C existants. P9 = ancre unique.
### Autres V2
- joues_sup/inf via signal vertical (bascule haut↔bas) ; affichage compteur mesuré/P9 ; export PDF zone
- Investiguer : menton (trop étroit), arrondis de toutes les zones
### V3
- MICA Azure → β FLAME[300] → mapping total ; 3DDFA V3 (35 709 vertices, masques segmentation)
- Régression β → sliders FC26 (matrice W[40×303]) sur ~50 visages annotés
