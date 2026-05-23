# ScanMyFace.tech — FC26 PWA

# ════════════════════════════════════════════════════════════
# DERNIÈRE SESSION (23 mai 2026) — état actuel, lire en premier
# ════════════════════════════════════════════════════════════
# SW = v88. Méthode de calibration rodée : outils console smf()/smfShow() (voir section dédiée)
# → scanner 2-3 visages aux extrêmes → garder ce qui a du signal, P9 le reste → VALIDER EN JEU.
#
# ZONES CALIBRÉES & VALIDÉES EN JEU (détails dans "BLOCS ALGO CALIBRÉS") :
#   ✅ Élancement visage long/court (crane_*_bas_haut, R_P9=1.070, K=45, couronne ×1.4)
#   ✅ Volume mâchoire/joues (taper, TAPER_P9=0.879, pentes 730/670/720 sur machoireC/jouesC/bajoue)
#   ✅ Nez largeur narines (bornes 0.24-0.36 ; pointe = P9 car signal plat 2D)
#   ✅ Bouche/lèvres (largeur + épaisseur sup/inf + position bas_haut ; inf SANS "100-", sens opposé à sup)
#
# DÉCOUVERTE MAJEURE : 3DDFA V2 ONNX est DÉJÀ ACTIF en prod (S.tddfa renvoie un objet).
#   - _arriere_avant (profondeur) : ~35 pilotés par 3DDFA ✅ / ~16 figés P9
#   - _arrondi_angulaire (arrondi) : seulement ~6 pilotés / ~25 FIGÉS P9 (en preset() simple)
#   → mécanisme : presetZ/presetA reçoivent 3DDFA ; preset() simple l'ignore (figé P9)
#
# FIXES UI : regroupement + ordre canonique des sliders (étape 4) ; cropper upload en cover/iPhone.
#
# PROCHAIN GROS CHANTIER : débloquer les ~25 arrondis figés (preset()→presetA() + étendre
# angle_sliders dans run3DDFA_mesh.js) = nez rond, lèvres ourlées. Puis zones 2D : menton, yeux, sourcils.
# À NE PAS reperdre : git non sauvegardé = risque iCloud (voir Stack). Committer régulièrement.
# ════════════════════════════════════════════════════════════

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
- SW actuel : fc26-cranium-v88 (à incrémenter)
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

## UI/UX — fixes actés (mai 2026)
### Cropper upload (façon iPhone) — flux UPLOAD uniquement, NE PAS toucher caméra live
- Init Cropper.js (~ligne 663, dans img.onload) : viewMode:3 (image COUVRE le viewport, plus de
  bandes), dragMode:'move' (on déplace l'image derrière), autoCropArea:1, cropBoxMovable:false,
  cropBoxResizable:false, toggleDragModeOnDblclick:false, aspectRatio:NaN.
- ready() force la box de crop = conteneur entier (sinon box centrée invisible → zoom au Confirmer) :
    ready(){ const cd=S.cropper.getContainerData(); S.cropper.setCropBoxData({left:0,top:0,width:cd.width,height:cd.height}); }
- État accepté : léger zoom résiduel au Confirmer toléré par le user (ne pas sur-régler).
- Déplacement vertical limité = normal (cover ne permet le pan que dans l'axe qui dépasse).
  Option future si besoin : cadre carré/4:5 centré (marges assombries) → pan vertical garanti sur photo portrait.

### Rendu des sliders (étape 4, renderGroup dans script_spa.js)
- Sliders REGROUPÉS par sous-zone via bucketing (getSubTab) — chaque titre de sous-zone une seule fois.
- Ordre DANS chaque sous-zone = ordre canonique FC26 via SUFFIX_ORDER + suffixRank() :
  reduire_elargir → bas_haut → neutre_haut → arriere_avant → arrondi_angulaire → neutre_arrondi
  → plus_petite → plus_grande_petite → deplacement_gd → neutre_avant → neutre_moins → moins_plus
- getSubTab : longest-prefix match (SLIDER_SUBTAB trié) + EXCEPTIONS (crane_arriere_avant/arrondi/deplacement → 'Crane').

## Azure
- Resource scanmyface-face-api (Germany West Central, F0). Endpoint backend azurewebsites.net
- Image POST body JSON { image: dataUrl }. shrinkForAzure() : 512px max, JPEG 75%. CORS prod à gérer.

## ⚠️ 3DDFA — ÉTAT RÉEL (mai 2026) : DÉJÀ ACTIF EN PROD (corrige une erreur de doc)
Le pipeline 3DDFA V2 ONNX n'est PAS "à faire" : il TOURNE déjà.
- onnxruntime-web@1.26 chargé (index.html), run3DDFA.js charge ./3ddfa_mb1.onnx (12 Mo)
- Flow : Promise.all([runMP(img), run3DDFA(img)]) ; computeFC26from3DDFA() mappe vers sliders
- Vérif runtime : après un scan, `S.tddfa` renvoie {pose, shape[40], expr[10], raw[62]} = ACTIF ✅
  (si null → fallback P9, voir le .catch ligne ~776 ; vérifier que 3ddfa_mb1.onnx est déployé)

### Couverture réelle 3DDFA (diagnostic 2 visages Cumberbatch vs Elon)
- `_arriere_avant` (PROFONDEUR) : ~35 sliders RÉELLEMENT pilotés par 3DDFA ✅ (valeurs varient entre visages :
  crâne, front, sourcils, menton, mâchoire, mandibule, lèvres...). ~16 encore figés P9
  (orbites, narines, paupières, pointe nez, espacement lèvres).
- `_arrondi_angulaire` (ARRONDI) : seulement ~6 pilotés (crâne, front_sup, joues, menton, mâchoire, mandibule).
  ~25 encore FIGÉS sur P9 (nez, toutes les lèvres, sourcils, yeux, tempes, narines).

### MÉCANISME (clé du débogage) — pourquoi certains sont figés alors que 3DDFA tourne
- presetZ(obj,key) / presetA(obj,key) : REÇOIVENT la valeur 3DDFA si fournie (sinon P9). → alimentés ✅
- preset(obj,key) simple : IGNORE 3DDFA, retombe toujours en P9. → figés ❌
Donc un slider peut être "calculé par 3DDFA mais jeté" s'il est en preset() au lieu de presetZ/presetA.

### CHANTIER 3DDFA RESTANT (ce n'est plus "intégrer", c'est "étendre le mapping")
1. Étendre angle_sliders dans run3DDFA_mesh.js : calculer l'arrondi de plus de zones depuis le mesh
   (nez, lèvres, sourcils, yeux) — gros potentiel ressemblance (nez rond vs pointu, lèvres ourlées).
2. Basculer les preset() figés → presetZ()/presetA() là où 3DDFA fournit déjà une valeur ignorée.
3. volume_sliders reste vide (épaisseur graisse non triviale même via mesh, voir bloc VOLUME).

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
- Profondeur nez (nez_arriere_avant) : pilotée par 3DDFA ✅. MAIS arrondi (_arrondi_angulaire) et
  évasement ailes (ext_narine_*) encore FIGÉS P9 (en preset() simple → 3DDFA ignoré). À débloquer
  via le chantier 3DDFA (presetA + angle_sliders étendus). C'est ce qui ferait "nez rond vs pointu".
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
- Projection lèvres (_arriere_avant) : pilotée par 3DDFA ✅. Arrondi arc de cupidon (_arrondi_angulaire)
  encore FIGÉ P9 (preset() simple). Volume (_moins_plus) → P9. Arrondi à débloquer via chantier 3DDFA.

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
- Sliders NON mesurés (preset → P9) : ~155. ⚠️ + ~40 _arriere_avant/_arrondi pilotés par 3DDFA (voir section 3DDFA).
- La famille C n'est PAS "quasi-complète" : beaucoup de _moins_plus / _plus_petite / arrondis encore en P9.
- Cause racine : tout ce qui dépend du VOLUME / PROFONDEUR (Z) est non mesurable en 2D unique.
  Les proxys 2D (élancement, taper, largeurs) débloquent une partie via ancrage P9, mais restent approximatifs.

### Ressemblance perçue (cas test, mai 2026)
- Scan brut V6 initial : ~30-35% (dominé par P9)
- Après blocs calibrés (élancement + volume + nez largeur + lèvres) : nettement mieux, volume/longueur/
  lèvres sortent corrects sans intervention manuelle. À re-mesurer globalement.

### Roadmap ressemblance (par impact)
1. PRIORITÉ — ÉTENDRE le mapping 3DDFA (déjà actif, pas à intégrer). Débloquer les ~25 arrondis figés
   (nez, lèvres, sourcils, yeux) en preset()→presetA() + étendre angle_sliders du mesh. Gros gain
   (nez rond vs pointu, lèvres ourlées). Puis les ~16 _arriere_avant encore figés.
2. Zones 2D faciles restantes (menton trop étroit, yeux/paupières, sourcils) via méthode log→scan→calibrer.
3. Alternative 2 photos (face + 3/4) pour affiner Z (+20%).
4. MICA Azure (+8% sur 3DDFA) → β FLAME[300] (V3).
- Plafond absolu FC26 ~90% (moteur Frostbite ; EA atteint 85-92% en studio multi-cam).
- joues_sup/inf (_moins_plus) : bascule verticale, à reprendre via mesh 3DDFA (signal de position vertical).

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
### 3DDFA V2 ONNX : INTÉGRÉ ET ACTIF ✅ (voir section "3DDFA — état réel" en haut)
Reste à ÉTENDRE le mapping (run3DDFA_mesh.js), pas à intégrer :
- Étendre angle_sliders : arrondi de nez/lèvres/sourcils/yeux depuis le mesh BFM
- Basculer les preset() figés → presetZ()/presetA() (sliders calculés mais ignorés)
- Vérifier que 3ddfa_mb1.onnx est bien déployé en prod (sinon fallback P9 silencieux)
- Étape future : correction pose (yaw) sur sliders C ; volume_sliders depuis épaisseur mesh
### Autres V2
- joues_sup/inf via signal vertical (bascule haut↔bas) ; affichage compteur mesuré/P9 ; export PDF zone
- Investiguer : menton (trop étroit), arrondis de toutes les zones
### V3
- MICA Azure → β FLAME[300] → mapping total ; 3DDFA V3 (35 709 vertices, masques segmentation)
- Régression β → sliders FC26 (matrice W[40×303]) sur ~50 visages annotés
