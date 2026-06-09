# ScanMyFace.tech — FC26 PWA

# ════════════════════════════════════════════════════════════
# MONÉTISATION — DÉCISION ACTÉE (7 juin 2026)
# Remplace l'ancien bloc "⚠️ À REDÉFINIR". Issu de 3 analyses
# stratégiques convergentes. Seuls désaccords restants = à
# trancher par 30j de données live, pas par plus d'analyse.
# ════════════════════════════════════════════════════════════
#
# ▶ MODÈLE RETENU — Hybride "preuve gratuite → paiement sur l'intent"
#
#   Ni freemium large, ni hard paywall sec. On laisse circuler
#   gratuitement ce qui nourrit la preuve sociale (carburant viral,
#   seul canal d'acquisition sans budget marketing), on fait payer
#   le cas "moi dans le jeu" où l'intent est maximal.
#
#   PALIERS :
#     - Gratuit : avatars célébrités stylisés (PAS de likeness réel)
#       utilisables + export filigrané partageable ; aperçu 1 zone
#       (5/303 sliders) du scan custom.
#     - Scan custom : A/B 3,99€ vs 5,99€  (JAMAIS 2,99€, plancher trop bas)
#     - Pack 5 crédits : ~9,99€  (decoy qui rend le pack évident)
#     - Pass Saison FC26 : 19,99€  (ancre haute)
#     - Creator Pass : GRATUIT, seuil ~5-10K followers, contre crédit
#       visible (handle + filigrane non retiré + lien bio, post sous 14j)
#
#   Stripe web only, PWA installable. Pas d'IAP en phase 1.
#
# ▶ COUPERET J30 (métrique unique go/no-go)
#
#   Revenu par visiteur (RPV) = revenu total ÷ visiteurs uniques.
#     RPV ≥ 0,40€  → ça marche, scale acquisition (créateurs, SEO)
#     RPV < 0,20€  → pivot (B2B licence, ou repositionnement)
#     0,20-0,40€   → itère prix + copy avant de trancher
#   Garder conversion gate→achat en diagnostic à côté (le RPV dit SI
#   ça marche, la conversion dit POURQUOI quand ça ne marche pas).
#
# ▶ CIBLE TRAFIC RÉALISTE
#
#   ~10 000 visiteurs/mois pour atteindre l'objectif 2-5K€/mois.
#   PAS 100 000. Conversion one-shot web réaliste = 2-8% (hypothèse
#   de travail, pas benchmark prouvé). À 10k visiteurs × ~6% × ~7€
#   panier ≈ 4 200€/mois. Toute projection bâtie sur le "10,7%"
#   RevenueCat est gonflée 2-4× (c'est de l'abonnement mobile J35,
#   pas du one-shot web — NON transférable).
#
# ▶ CE QU'ON IGNORE (fausses certitudes à ne pas re-débattre)
#
#   - "12% / 10,7% conversion" comme cible → non transférable
#   - "3,99€ est le bon prix" → c'est un test, pas un optimum
#   - "PWA = zéro friction" → faux. Web checkout convertit MOINS bien
#     que l'IAP one-tap (18,1% vs 27,0%, test RevenueCat). On gagne la
#     marge et le contrôle, PAS la conversion.
#   - Pass 7j payant → pas de client réel. ABANDONNÉ.
#   - Débat IAP vs web → prématuré tant que < 10k scans/mois. Web-first.
#
# ▶ RISQUES À GARDER AU MUR
#
#   1. DROIT À L'IMAGE (France, commercial) : reproduire Pogba/CR7/
#      Zlatan = exposition réelle. Avatars stylisés non identifiables
#      AVANT toute ouverture publique des célébrités.
#   2. RISQUE PLATEFORME EA (existentiel) : si FC27 (~25 sept 2026)
#      livre nativement le "Face Code Sharing System" demandé sur les
#      forums EA, le produit est obsolète. La fenêtre FC26 est une
#      COURSE contre EA, pas une rampe tranquille.
#   → Le B2B (licence du moteur scan→sliders à FUTBin / fut.gg) est
#     une ASSURANCE contre ce risque, pas un simple upside.
#     Réf. : FUTBin racheté 105M€ par Better Collective (2022),
#     13M€ de revenu sur 12 mois, ~50M visiteurs/mois.
#
# ▶ 3 PROCHAINS PAS (14 jours) — n'est plus une analyse, c'est exécuter
#
#   1. Flipper Stripe Live + instrumenter le funnel à 3 events :
#      gate-view → checkout-start → purchase. (Sans ça, couperet J30
#      impossible.)
#   2. Ouvrir les avatars génériques en gratuit + export filigrané ;
#      DM-seeding 20-50 micro-créateurs FC (5-50K followers) avec
#      Creator Pass gratuit, calé sur UFC 6 (19 juin).
#   3. Lancer l'A/B prix (3,99€ vs 5,99€ + pack 5 à 9,99€) sur le
#      funnel live et figer le couperet RPV à 30 jours.
#
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (7 juin 2026, soir) — DIAG 31 PRESETS (Phase 3.0 prep) 🔬
# Outillage de diagnostic pour mesurer l'erreur du moteur de scan
# (chaîne landmark→directScan) sur photos canoniques, AVANT de décider
# Chantier B (normalisation) vs recalibration ciblée.
# ════════════════════════════════════════════════════════════
#
# ▶ POURQUOI : Phase 2.5 round-trip (Δ=0) ne valide QUE la plomberie DNA.
#   En jeu, KEITA Mode B → crane_reduire_elargir = 90 calculé par directScan
#   a cassé le visage. Hypothèse : la conversion landmark→slider dérive sur
#   certains sliders même en pose canonique. Le diag décide la priorité suivante.
#
# ▶ FICHIERS CRÉÉS :
#   - app/scanToSliders_v6.js                       (modif minimale : 1 hook debug)
#   - app/admin/smf_batch_diagnostic_presets.js     (script console pur, jamais en cache)
#   - app/admin/analyze_diagnostic_batch.py         (3 CSV via stdlib uniquement)
#   - app/admin/diag_output/README.md               (protocole de relance + lecture)
#
# ▶ HOOK DEBUG (scanToSliders_v6.js L1120 environ) :
#   Bloc no-op total en prod sauf si `window.__SMF_DEBUG_CAPTURE_PRE_DNA__ = true`
#   est posé AVANT l'appel. Capture S/C/G + leurs _sources juste avant la 2e
#   passe DNA → permet de récupérer les valeurs PRE-DNA via S.sliders._pre_dna_snapshot.
#   Aucun changement de source_counts en mode prod normal.
#
# ▶ PROTOCOLE (Alex en DevTools) :
#   1. Ouvrir prod, scanner une photo normale (charge MediaPipe).
#   2. Coller smf_batch_diagnostic_presets.js → smfBatchDiagnosticPresets()
#      → sélectionner les 31 fichiers de app/assets/presets/ (9.png, 116.png, …).
#   3. smfExportDiagnosticResults() → coller dans app/admin/diag_results_ALL.json.
#   4. /usr/bin/python3 app/admin/analyze_diagnostic_batch.py
#   5. Partager les 3 CSV pour interprétation et décision Chantier B vs recalibration.
#
# ▶ DÉCISION ATTENDUE DES CSV :
#   - csv_1 mean_delta_pre_dna_directScan > 15 sur la majorité des presets →
#     Chantier B (normalisation) prioritaire.
#   - csv_1 mean_delta < 10 sur > 80% → scan OK sur canoniques, le bug KEITA
#     vient d'ailleurs (pose, normalisation conditionnelle, etc.).
#   - csv_2 top 20 = TODO recalibration ciblée si scan globalement OK.
#
# ▶ SW NON BUMPÉ : la logique de scan en prod normale est strictement identique.
#   Cache reste v127. Aucun fichier prod chargé modifié hormis le hook minimal.
#
# ▶ FONCTIONS PROTÉGÉES : aucune touchée. softClampSlider, extractMorphRatios,
#   computePresetScore, calculateMixAttributes, augmentAttributesWithCustomMetrics,
#   et la signature de selectBestPreset sont intactes. PRESETS_DB_v4.js,
#   presetMatch.js et calibration_v7_slim.js sont intacts.
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (7 juin 2026) — PHASE 2.5 : INJECTION DNA CHAIR/GRAISSE DÉPLOYÉE ✅
# 31 officiels EA reçoivent enfin une DNA chair (163) + graisse (37) flat,
# format identique aux 10 célébrités, lue directement par lookupPresetDNAByFamily.
# ════════════════════════════════════════════════════════════
#
# ▶ CE QUI A ÉTÉ FAIT :
#   - Le snapshot Notion (Phase 2.4, 6 200 valeurs : 31 presets × 200 sliders C+G)
#     a été injecté dans les 31 officiels EA via `app/admin/inject_v4.py`.
#   - `PRESETS_DB_v3.js` → `PRESETS_DB_v4.js`. Chaque officiel a maintenant
#     `faconner.chair` (163 clés flat) + `faconner.graisse` (37 clés flat),
#     format identique aux 10 célébrités, lu directement par
#     `lookupPresetDNAByFamily` (presetMatch.js).
#   - Option A retenue : `faconner.chair`/`graisse` ajoutés dans le bloc
#     `faconner` existant, à côté du façonnage de base (`crane`, `nez`, etc.).
#     Un seul usage de `.faconner` dans tout le prod (`presetMatch.js:835`),
#     rien ne l'énumère → zéro collision, zéro modif JS du lookup nécessaire.
#   - Anciens fichiers gardés en backup : `app/PRESETS_DB_v3.js.bak`
#     (rollback express possible, supprimer une fois Mode B KEITA validé in-game).
#
# ▶ FICHIERS DÉPOSÉS / MODIFIÉS :
#   - app/PRESETS_DB_v4.js                                 (drop-in, 414 KB)
#   - app/admin/inject_v4.py                               (script régénération)
#   - app/admin/notion_chair_graisse_31presets.json        (snapshot Notion, 247 KB)
#   - app/admin/roundtrip_test.js                          (test console DevTools)
#   - app/index.html                                       (v3 → v4, ordre de chargement intact)
#   - app/sw.js                                            (CACHE_VERSION v126 → v127)
#
# ▶ TEST STATIQUE DE COMPLÉTUDE :
#   Les seeds littéraux de `scanToSliders_v6.js` couvrent EXACTEMENT
#   163 chair + 37 graisse. La 2e passe DNA (L1135) `for (key in C/G)`
#   applique donc 100% des clés DNA, sans aucune ratée.
#   → Le « bug Phase 1.5 » que la session précédente craignait (post-process
#   borné à V7_SLIM) ne concerne que la boucle directScan (L1077), de toute
#   façon écrasée par la 2e passe. Aucune boucle à élargir, la DNA fraîche
#   se propage telle quelle.
#
# ▶ FIX DES 6 SUFFIXES PAUPIÈRES (build_v7_slim.py) :
#   Défaut trouvé pendant l'analyse : 6 sliders paupières
#   (`pli_paupieres_{central,ext,int}` et `paupiere_inf_{centrale,ext,int}`)
#   avaient un suffixe `_plus_grande_petite` côté V7_SLIM/directScan, alors
#   que la DNA canonique (lue par l'UI) utilise `_plus_petite`. Conséquence
#   AVANT fix : ces 6 clés directScan étaient calculées mais orphelines
#   (l'UI lit `_plus_petite` donc la DNA gagne, pas de bug fonctionnel).
#
#   Fix appliqué : ajout d'un dict `KEY_RENAME` dans `build_v7_slim.py` qui
#   réécrit ces 6 clés en sortie. `calibration_table.json` source INTACTE.
#   Vérification post-build :
#     grep -c "_plus_grande_petite" calibration_v7_slim.js → 2
#       (les 2 restants = `orbites_plus_grande_petite` + `yeux_plus_grande_petite`,
#        canoniques en SQUELETTE — règle CLAUDE.md "orbites & yeux → plus_grande_petite,
#        tout le reste Chair → plus_petite", à conserver).
#     6 renames effectués (`stats['renamed'] = 6 / 6`).
#
# ▶ VÉRIFICATIONS POST-DÉPLOIEMENT (à exécuter par Alex en DevTools) :
#   1. Hard reload (Cmd+Shift+R), Application → Service Workers → sw.js actif
#      doit être en v127. Cache Storage → ancien cache v126 supprimé.
#   2. Console :
#        window.PRESETS_DB.length                            // 41 (31 + 10 célébs)
#        const p = window.PRESETS_DB.find(x=>x.preset_id===116)
#        Object.keys(p.faconner.chair).length                // 163
#        Object.keys(p.faconner.graisse).length               // 37
#        p.faconner.chair.tempes_moins_plus                  // 22 (validé)
#   3. Round-trip plomberie : scanner une photo, coller
#      `app/admin/roundtrip_test.js` dans la console.
#      Attendu : strict Δ≤10 sur CHAIR et GRAISSE ≥ 99% (idéalement 100%).
#   4. Si vert : test in-game KEITA Mode B (sans `forcePresetId`).
#      Cible : ressemblance visuelle ~80-85% (vs ~50-55% avant Phase 2.5),
#      proche du ceiling Frostbite ~90%.
#
# ▶ DÉCISIONS ACTÉES (cumul) :
#   - PRESETS_DB_v4 déployée, DNA Chair/Graisse 31 officiels propagée
#     par la 2e passe (Phase 2.5, 7 juin).
#   - Fix 6 suffixes paupières `_plus_grande_petite` → `_plus_petite`
#     dans build_v7_slim.py (KEY_RENAME, 7 juin).
#
# ▶ SOURCE NOTION :
#   `notion_chair_graisse_31presets.json` est dérivé de la DB Notion v2
#   (data_source_id 6d724705-34f3-4af5-9f48-b86054a9748f). En cas de retouche
#   Notion : ré-exporter le CSV → relancer `inject_v4.py`.
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (5 juin 2026) — PHASE 3 : CALIBRATION EMPIRIQUE SLIDER-PAR-SLIDER 🚧
# Pipeline calibrate_fc26.py validé. Bloc 1 fini (262→267 sliders).
# Bloc 2 en cours : 67 captures, 20 traitées via inspection visuelle Claude.
# ════════════════════════════════════════════════════════════
#
# ▶ POURQUOI CETTE SESSION (passage de Phase 2 à Phase 3) :
#
#   Phase 2 (10 célébrités via Gemini OCR) terminée le 3 juin.
#   Phase 3 = améliorer la PRÉCISION des sliders mesurés en in-game testing.
#   Au lieu d'inférer slider→landmark depuis la théorie, on capture
#   les val0/val100 réels du jeu pour CHAQUE slider et on mesure l'amplitude
#   Δlandmarks effective. Calibration = source de vérité du pipeline.
#
# ▶ NOUVEAU PIPELINE — calibrate_fc26.py (3 passes) :
#
#   Pass 1 : OCR de la valeur du slider (0/50/100) + zone affichée
#            → pass1/<timestamp>.json
#   Pass 2 : MediaPipe Face Mesh landmarks sur l'image
#            → pass2/<timestamp>.json
#   Pass 3 : Agrégation Δlandmarks entre val0 et val100 par slider
#            → calibration_table.json (avec amp, axis, separation)
#
#   Local : /Users/loriekeita/Desktop/FC26/app/admin/calibrate_fc26.py
#   Pas dans le repo Git (gitignored — ne pas commit, contient infos crédit Gemini).
#
# ▶ INNOVATION MÉTHODOLOGIQUE — INSPECTION VISUELLE CLAUDE :
#
#   Gemini Flash a halluciné sur certains screens FC26 (notamment confusion
#   "Neutre/Avant" vs "Neutre/Moins" car "Avant" sur-représenté dans le
#   vocabulaire FC26). Patches successifs sur le prompt contraint ont aidé
#   mais ça reste cher (~$0.50/visage) et imparfait.
#
#   MÉTHODE ACTUELLE pour calibration : Claude lit directement les screens
#   uploadés via `view`, identifie sub_zone + valeurs + présence HL, et
#   génère les pass1 JSONs propres au format exact attendu par calibrate_fc26.py.
#
#   Avantages :
#   - Coût $0 (pas d'appel Gemini)
#   - Précision 100% sur la lecture des valeurs (Claude lit les chiffres
#     parfaitement et ne confond pas les sliders bipolaires)
#   - Pas de retry, pas de 503, pas de timeout
#
#   Limite : Alex doit envoyer les screens en upload (max ~20 par message
#   pour pas saturer la mémoire conv), Claude génère, puis ZIP final livré
#   à intégrer dans calibration/pass1/.
#
# ▶ SCHÉMA EXACT DU PASS1 JSON (à respecter au caractère près) :
#
#   {
#     "timestamp": "20260605033359",
#     "filename": "EA_SPORTS_FC_26_20260605033359.jpg",
#     "family": "chair",                          // squelette/chair/graisse
#     "group": "Yeux",                            // 1er bouton de nav
#     "sub_zone": "Paupière supérieure : partie ext.",  // 2e bouton actif
#     "zone_key": "paupiere_sup_ext",             // clé technique
#     "zone_unknown": false,
#     "slider_key": "paupiere_sup_ext_bas_haut",  // zone_key + "_" + suffix
#     "primary_suffix": "bas_haut",
#     "primary_value": 100,                       // 0 / 50 / 100
#     "sliders": [                                // TOUS les sliders visibles
#       {"label": "Réduire / Élargir", "value": 50, "suffix": "reduire_elargir"},
#       {"label": "Bas / Haut", "value": 100, "suffix": "bas_haut"},
#       {"label": "Plus grande / Plus petite", "value": 50, "suffix": "plus_petite"}
#     ],
#     "type": "TYPE_VAL_FACE",
#     "view": "face",
#     "has_highlight": false,                     // zone colorée sur visage ?
#     "highlight_bbox_norm": null,
#     "highlight_color": null                     // "red" / "green" / "pink"
#   }
#
# ▶ TRIPLETTES POUR CALIBRER 1 SLIDER (3 frames minimum) :
#
#   1. HL frame : tous sliders à 50, zone colorée sur le visage
#      → has_highlight: true, primary_value: 50
#   2. val0 frame : ce slider à 0, autres à 50
#      → has_highlight: false, primary_value: 0
#   3. val100 frame : ce slider à 100, autres à 50
#      → has_highlight: false, primary_value: 100
#
#   Amplitude mesurée entre val0 et val100 = sensibilité du slider sur
#   landmarks MediaPipe.
#
# ▶ NOUVELLE MÉTHODE ALEX — DOUBLE CAPTURE (val + HL bonus) :
#
#   Depuis le 5 juin, Alex prend 2 captures par valeur :
#   - 1 sans HL (zone propre, lecture slider parfaite)
#   - 1 avec HL (zone colorée affichée, mesure HSV bonus en Pass 2)
#
#   Les 2 JSONs sont créés, calibrate_fc26.py les utilise en complémentarité.
#   Le frame sans HL fixe la valeur, le frame avec HL fixe la zone HSV.
#
# ▶ ÉTAT CALIBRATION AU 5 JUIN 2026 (calibration v6 → v7 en cours) :
#
#   - Avant cette session : v6 = 262 sliders (231 complets, 26 partiels)
#     Distribution : chair 137 / squelette 96 / graisse 29
#
#   - Bloc 1 (5 sliders Neutre/X bipolaires, calibrés en début de session) :
#     ✅ crane_couronne_neutre_arrondi (amp=0.0309 axis=y)
#     ✅ joues_ext_inf_neutre_moins (amp=0.0069 axis=x)
#     ✅ joues_int_inf_neutre_moins (amp=0.0221 axis=x)
#     ✅ menton_cotes_neutre_moins (amp=0.0216 axis=z)
#     ✅ plis_coin_bouche_neutre_moins (amp=0.0174 axis=x)
#
#   - Bloc 2 (67 captures total, batches de 20+20+27) :
#     Batch 1 traité (20 images du 2026-06-05, timestamps 032858 → 033359)
#     → 35 JSONs livrés (15 du 03/06 + 20 du 05/06) dans
#        calibration_fc26_handoff.md
#     Batch 2 + Batch 3 (47 images restantes) à venir.
#
#   - Sliders projetés après Bloc 2 complet :
#     262 (v6) + 5 (Bloc 1) + ~11 (Bloc 2) = ~278 sliders (~94% des 295)
#
# ▶ ZONES TRAITÉES DANS BLOC 1 + BATCH 1 BLOC 2 (cumul) :
#
#   Bloc 1 obligatoire (15 images du 03/06) :
#   - espace_sourcils (bas_haut, moins_plus) — chair ✅
#   - fossette_mentonniere (bas_haut, deplacement_gd) — chair ✅
#   - HL acquis (sans val0/100) : front_cotes, paupiere_inf_int,
#     paupiere_sup_centrale, paupiere_sup_ext, cernes_inf
#
#   Batch 1 du Bloc 2 (20 images du 05/06) :
#   - front_cotes (bas_haut, moins_plus) — graisse ✅
#   - paupiere_sup_centrale (bas_haut, reduire_elargir) — chair ✅
#   - paupiere_sup_ext (bas_haut val100 only) — chair ⚠️ partiel
#
# ▶ RESTE À CAPTURER (Batch 2 + Batch 3, 47 images attendues) :
#
#   Priorité 1 (sliders incomplets) :
#   - paupiere_sup_centrale_neutre_avant (val0 + val100)
#   - paupiere_sup_ext_bas_haut (val0)
#   - paupiere_sup_ext_reduire_elargir (val0 + val100)
#   - paupiere_inf_int_plus_petite (val0 + val100)
#   - cernes_inf_bas_haut (val0 + val100)
#   - cernes_inf_moins_plus (val0 + val100)
#
#   Bonus (zones jamais touchées) :
#   - coin_oeil_ext (Bas/Haut + Réduire/Élargir)
#   - coin_oeil_int (Bas/Haut + Réduire/Élargir)
#   - paupiere_sup_int (Bas/Haut + Réduire/Élargir)
#
# ▶ SLIDERS NON-CALIBRABLES (à laisser tels quels) :
#
#   - 5 sliders crâne arrière : hors champ MediaPipe Face Mesh (face uniquement)
#   - 5 sliders `plus_petite` paupières : zones trop fines pour la précision
#     mesh MediaPipe (variance bruit > variance signal)
#
#   → Plafond technique de la calibration empirique = ~290/295 sliders.
#
# ▶ FICHIER DE HANDOFF GÉNÉRÉ (5 juin) :
#
#   /Users/loriekeita/Desktop/FC26/calibration_fc26_handoff.md (44 KB, 1346 lignes)
#
#   Contient :
#   - Méthode d'inspection visuelle Claude (étape par étape)
#   - Schéma exact des pass1 JSONs (tous champs documentés)
#   - Mapping zones (35+ sub_zone → zone_key) + suffixes (12 labels)
#   - Comment classifier HL vs val0/val100 (checklist + couleurs)
#   - 35 JSONs déjà générés (15 Bloc 1 ancien + 20 Batch 1 Bloc 2)
#   - Plan des batches 2 et 3 + commande Claude Code pour re-run pipeline
#
#   Permet de reprendre dans une nouvelle conversation Claude sans perdre
#   le contexte ni les JSONs déjà produits.
#
# ▶ COMMANDE POUR RE-LANCER LE PIPELINE (Claude Code, post-Bloc 2) :
#
#   cd /Users/loriekeita/Desktop/FC26/app/admin
#   python3 calibrate_fc26.py --skip-ocr  # utilise pass1 existants
#
#   → Lance Pass 2 (MediaPipe sur chaque image)
#   → Lance Pass 3 (agrégation Δlandmarks)
#   → Écrit calibration_table.json (v7)
#
#   Vérifier la diff avec v6 :
#     diff <(jq -S . calibration_table.json.v6.bak) \
#          <(jq -S . calibration_table.json)
#
# ▶ DÉCISIONS À PRENDRE APRÈS BLOC 2 COMPLET :
#
#   Option A — STOP à 278 sliders (94.2%) : assez pour production, focus
#              sur reste de la roadmap (Stripe Live, TikTok, FC27 prep)
#   Option B — Capturer les bonus zones œil (+6 sliders) → 284 (96.3%)
#   Option C — Tout sauf crâne arrière (impossible techniquement) → ~290 max
#
#   Recommandation : Option A. Le vrai goulot d'étranglement reste
#   l'homogénéité des presets stock (31 presets), pas le nombre de sliders.
#
# ▶ FICHIERS LOCAUX IMPORTANTS (Mac Alex, hors repo) :
#
#   /Users/loriekeita/Desktop/FC26/app/admin/
#   ├── calibrate_fc26.py           # pipeline 3 passes (gitignored)
#   ├── extract_sliders.py          # OCR Gemini (committed)
#   ├── calibration/
#   │   ├── pass1/<timestamp>.json  # OCR results (manuel ou Gemini)
#   │   ├── pass2/<timestamp>.json  # MediaPipe landmarks
#   │   ├── calibration_table.json  # final (v6 actuelle, v7 en cours)
#   │   └── suffix_rejected.txt     # logs post-validation
#   └── EA SPORTS FC 26/            # dataset screens (929+ images)
#
#   /Users/loriekeita/Desktop/FC26/calibration_fc26_handoff.md
#   (généré le 5 juin pour transfert vers nouvelle conv Claude)
#
# ════════════════════════════════════════════════════════════
# FIN SESSION 5 JUIN 2026
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (3 juin 2026) — 10 VISAGES CÉLÈBRES BOUCLÉS ✅
# Phase 2 (extension bank) presque terminée. Plan freeze FC26 au 7 juin.
# ════════════════════════════════════════════════════════════
#
# ▶ ÉTAT FINAL — 10 célébrités intégrables dans PRESETS_DB_v3 :
#
#   #  | Joueur            | Carnation       | Forme    | Source YouTube
#   ---|-------------------|-----------------|----------|------------------
#   1  | Neymar            | Métis           | Ovale    | PAO.FACES
#   2  | Zlatan            | Claire          | Allongé  | JAXSTASH
#   3  | Pogba             | Foncée          | Ovale    | ESEC CREATIVE
#   4  | Henry             | Métis           | Allongé  | F.P.Fifa20VPL
#   5  | Evra              | Foncée          | Carré    | F.P.Fifa20VPL
#   6  | CR7               | Claire-bronzée  | Carré    | (manuel, antérieur)
#   7  | Abidal            | Foncée          | Allongé  | F.P.Fifa20VPL
#   8  | Gerrard           | Claire          | Carré    | F.P.Fifa20VPL
#   9  | Makelele          | Très foncée     | Rond     | F.P.Fifa20VPL
#   10 | Drogba            | Foncée          | Allongé  | F.P.Fifa20VPL
#
#   Diversité carnations : Très foncée(1), Foncée(4), Métis(2), Claire-bronzée(1), Claire(2)
#   Diversité formes : Allongé(4), Carré(3), Ovale(2), Rond(1)
#   Manque : Triangle (rare), 2e Très foncée, 2e Rond
#
#   Coût Gemini cumulé : ~$0.50 sur les 10€ de crédit initial.
#
# ▶ BUG #1 RÉSOLU — Zone "Temples" présente dans 3 familles différentes :
#   - squelette/tempes (groupe Head : 4 sliders reduire_elargir, bas_haut,
#     arriere_avant, arrondi_angulaire)
#   - chair/tempes (groupe Head : 1 slider moins_plus)
#   - graisse/tempes (groupe CHEEKS : 2 sliders bas_haut, moins_plus)
#
#   Gemini lit "Temples" comme zone mais ne sait pas la désambiguïser par
#   groupe parent → un slider Chair/Tempes peut être classé en Squelette/Tempes
#   ou inversement. Pattern observé sur Gerrard, Makelele, Drogba.
#
#   FIX MANUEL (en attendant patch script) : après chaque run, vérifier
#   non_canonical_keys et déplacer manuellement les sliders mal classés via
#   un petit script Python data['faconner'][src].pop(k) puis dst[k] = v.
#
#   FIX SCRIPT À FAIRE (post-freeze) : modifier extract_sliders.py pour
#   utiliser group_label_en + zone_label_en pour désambiguïser. Quand zone =
#   "Temples" et group = "Cheeks" → forcer famille=graisse. Quand zone =
#   "Temples" et group = "Head" → laisser la famille détectée par le crop.
#
# ▶ BUG #2 RÉSOLU — Popup musique EA cache les tabs Skeletal/Flesh/Fat :
#   FC26 affiche périodiquement un popup "Peace of Mind / Wesley Joseph" ou
#   "Last Chance / Mild Minds" (musique EA Sports) en bas-droite, exactement
#   où sont les tabs famille. Le crop tombe sur le popup, Gemini hallucine
#   la famille.
#
#   WORKAROUND ALEX : pour ces screenshots, renommer le fichier en
#   "skeletal.png" / "flesh.png" / "fat.png" selon la famille connue par Alex
#   (qui se souvient de la vidéo). Mais le script ne lit pas le nom de fichier
#   pour déduire la famille — il faut le traitement par dossier séparé +
#   merge manuel (voir bug #4 plus bas).
#
#   FIX SCRIPT À FAIRE (post-freeze) : ajouter une option --force-family pour
#   un run où Alex sait que toutes les images sont d'une seule famille.
#
# ▶ BUG #3 RÉSOLU — 503 Gemini "high demand" sur runs longs :
#   Les runs sur 100 screenshots × 2 appels (image complète + crop) = 200
#   appels en série. Gemini renvoie parfois 503 sur certains, surtout en fin
#   de run. Le script avait un retry sur l'appel principal (call_gemini_with_retry)
#   mais PAS sur detect_family_from_crop.
#
#   FIX APPLIQUÉ : ajout d'une boucle try/except avec sleep(5, 25, 60) dans
#   detect_family_from_crop. Sur le run final Zlatan : 6 erreurs 503 absorbées
#   sans plantage. Sur Drogba : 3 screenshots quand même failed → traitement
#   par dossier retry (voir procédure ci-dessous).
#
# ▶ PROCÉDURE STANDARD POUR LES VISAGES NON COMPLETS (formalisée) :
#
#   Quand un visage termine avec moins de 303/303 OU avec des non-canonical :
#
#   1. Diagnostic des manquants :
#      /usr/bin/python3 << 'EOF'
#      import json
#      data = json.loads(open('<path>/<nom>_v1.json').read())
#      canonical = json.loads(open('<path>/slider_ui_order.json').read())
#      for fam in ['squelette', 'chair', 'graisse']:
#          canon = set()
#          for g in canonical[fam]:
#              for z in g.get('zones', []):
#                  for s in z['sliders']:
#                      canon.add(f"{z['key']}_{s}")
#          got = set(data['faconner'][fam].keys())
#          missing = canon - got
#          if missing:
#              print(f"\n{fam.upper()} manquants ({len(missing)}):")
#              for k in sorted(missing): print(f"  {k}")
#      EOF
#
#   2. Cas A — Sliders mal classés (présents dans une autre famille) :
#      Déplacer en Python :
#      v = data['faconner'][src_fam].pop(k)
#      data['faconner'][dst_fam][k] = v
#
#   3. Cas B — Screenshots failed (3 max par run) :
#      Récupérer dans failed_screenshots.txt, copier dans <nom>_retry/,
#      relancer le script sur ce dossier seul, puis merger :
#      for fam in ['squelette','chair','graisse']:
#          for k, v in retry['faconner'][fam].items():
#              main['faconner'][fam][k] = v
#
#   4. Cas C — Zones non screenshotées (visibles via diagnostic missing) :
#      Retourner sur la vidéo source, faire les captures des zones manquantes,
#      relancer en mode retry puis merger.
#
#   5. Toujours vider _meta.non_canonical_keys après les corrections manuelles
#      pour avoir un fichier propre.
#
# ▶ PROCHAIN PLAN (4-7 juin) :
#
#   ÉTAPE A — Intégration en 1 jour (4 juin) :
#   - Conversion des 10 *_v1.json au format PRESETS_DB_v3.js (entry_type=celebrity)
#   - PAS BESOIN de calculer nearest_official_preset_id : les YouTubers le donnent
#     directement dans leurs vidéos (zone_presets aussi).
#   - Scan scanned_stats via app PWA pour chaque visage
#   - Activation Stripe Live mode
#   - Système free scan (à concevoir le 5-6 juin)
#
#   ÉTAPE B — Option B (calibration empirique) sur 2-3 jours :
#   PROTOCOLE ALEX :
#   1. Mettre TOUS les sliders à 50 → screenshot tête neutre
#   2. Mettre TOUS les sliders à 0 → screenshot tête min
#   3. Mettre TOUS les sliders à 100 → screenshot tête max
#   → 3 captures de référence pour calibrer le baseline
#   4. POUR CHAQUE SLIDER individuellement :
#      - Mettre uniquement ce slider à 0 → screenshot
#      - Mettre uniquement ce slider à 100 → screenshot
#      → mesurer via MediaPipe quels landmarks ont bougé entre 0 et 100
#   5. POUR CHAQUE SOUS-ZONE FC26 affichée à l'écran (zone surlignée vert/bleu
#      quand on sélectionne un slider) : screenshot et noter quels landmarks
#      MediaPipe correspondent à cette région anatomique.
#   → Documente une table slider → landmarks MediaPipe utilisée pour mieux
#     piloter les sliders depuis les mesures user.
#
#   Estimation Option B : 303 sliders × 2 captures = 606 captures min,
#   plus ~75 zones surlignées. Soit ~15-25h de travail si méthodique.
#   But long terme : améliorer la précision du modèle de matching actuel
#   et préparer le terrain pour V3 (modèle inverse).
#
#   ÉTAPE C — Freeze FC26 (7 juin) : tag git v1.0-FC26, pivot UFC 6.
#
# ▶ DÉCISION ALEX — Pas de pivot prématuré sur Option B :
#   Alex a confirmé qu'il poursuit A en 1 jour PUIS Option B en 2-3 jours,
#   tient la deadline 7 juin sans souci. Aucune raison de couper l'Option B
#   du plan, l'intégration A est rapide grâce aux nearest_official_preset_id /
#   zone_presets déjà fournis par les YouTubers.
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (31 mai 2026 - 2/2) — ZLATAN 303/303 ✅ + LEÇONS PIPELINE
# Deuxième visage célèbre. Validation que le pipeline gère plusieurs chaînes
# YouTube différentes. 3 bugs majeurs résolus en cours de route.
# ════════════════════════════════════════════════════════════
#
# ▶ RÉSULTAT FINAL ZLATAN (101 screenshots de la chaîne JAXSTASH, fusionnés
#   après retry du screenshot 14.34.16 planté en 503) :
#   - Squelette: 103/103 ✅
#   - Chair: 163/163 ✅
#   - Graisse: 37/37 ✅
#   - TOTAL: 303/303 — ZÉRO non-canonical
#   - Fichier livré : app/admin/zlatan_v1.json
#   - Métadonnées : couleur_peau=Claire, forme_visage=Allongé
#
# ▶ BUG #1 (FATAL) — FAMILY_KEYS POLLUÉ : un patch précédent a accidentellement
#   injecté 3 zones (skull back, temples, nose tip under) dans FAMILY_KEYS au
#   lieu de MAPPING_ZONE. Conséquence : le check `crop_family in FAMILY_KEYS`
#   acceptait n'importe quel nom de zone comme famille, polluant tout le
#   classement Squelette/Chair/Graisse. Fix : nettoyage manuel de FAMILY_KEYS
#   pour ne garder QUE les 3 vraies familles.
#   LEÇON : ne jamais écrire de patch en aveugle. Toujours faire `grep -n` de
#   la clé qu'on patche AVANT pour vérifier qu'on insère au bon endroit.
#
# ▶ BUG #2 (FATAL) — PROMPT POLLUÉ : le même patch a injecté du code Python
#   À L'INTÉRIEUR de la string du PROMPT envoyé à Gemini, juste après le JSON
#   d'exemple (lignes "skull back": "crane_arriere" entre la fin du JSON et
#   la section Rules). Conséquence : Gemini recevait un prompt cassé et
#   hallucinait les familles. Fix : nettoyage manuel du PROMPT pour retirer
#   les 3 lignes parasites.
#
# ▶ BUG #3 (CRITIQUE) — CROP COORDONNÉES OBSOLÈTES :
#   Le crop bas-droite était fixé à (70%, 88%, 100%, 100%) — calibré pour les
#   screenshots Neymar/PAO.FACES (résolution ~1440×770). Sur les screenshots
#   Zlatan/JAXSTASH (résolution 2880×1800 = écran Retina complet), ce crop
#   tombe SUR LA BANDE NOIRE / ICÔNES AUDIENCE en bas de vidéo, PAS sur les
#   tabs Skeletal/Flesh/Fat. Gemini lit alors des indices visuels aléatoires
#   et hallucine la famille.
#   Fix : crop élargi et remonté à (65%, 80%, 100%, 92%) qui fonctionne pour
#   les 2 styles testés (PAO.FACES + JAXSTASH).
#   LEÇON : les coordonnées de crop en POURCENTAGE de l'image dépendent du
#   layout vidéo du YouTuber (letterbox, overlay, watermarks). Surveiller
#   ce point sur chaque nouvelle source vidéo.
#
# ▶ BUG #4 (BLOQUANT) — detect_family_from_crop SANS RETRY :
#   La fonction de détection famille par crop n'avait pas de mécanisme de
#   retry sur erreurs transientes (503 Gemini "high demand"). Une seule erreur
#   crashait tout le run et perdait toute la progression.
#   Fix : ajout d'une boucle de retry avec backoff (5s, 25s, 60s) identique
#   à call_gemini_with_retry. Sur le run final, 6 erreurs 503 ont été
#   absorbées sans plantage (sauf une, qu'on a relancé manuellement).
#
# ▶ MÉTHODE DE FUSION PARTIELLE (pour visages où 1-2 screenshots failent) :
#   Si N screenshots ont planté en 503 Gemini malgré le retry, créer un
#   dossier ~/Desktop/<nom>_retry/, y copier les screenshots failed, relancer
#   le script avec un --output /tmp/X.json, puis merger en Python :
#   ```
#   main['faconner'][family][key] = retry['faconner'][family][key]
#   ```
#   Cette méthode a permis de récupérer les 2 derniers sliders graisse de
#   Zlatan (paupiere_inf_bas_haut, paupiere_inf_moins_plus).
#
# ▶ COMPATIBILITÉ MULTI-MAC :
#   Alex a 2 Mac (Host-008 et Air-de-Lorie). Sur Air-de-Lorie, Python 3.14
#   Homebrew est installé après yt-dlp et ne trouve plus Pillow (installé
#   sur Python 3.9 système). Toujours utiliser `/usr/bin/python3` pour
#   garantir l'usage du Python système qui a les bonnes deps.
#
# ▶ ABANDON DE LA PISTE VIDÉO AUTOMATIQUE (video_to_frames.py) :
#   Le script video_to_frames.py qui télécharge une vidéo YouTube via yt-dlp,
#   extrait des frames via ffmpeg et déduplique par phash a été testé sur la
#   vidéo Neymar. Résultats décevants :
#   - 264 frames uniques (vs 100 screenshots manuels) = 2.6× plus à analyser
#   - Beaucoup de frames de transition entre tabs → bruit
#   - Le YouTuber couvre les oreilles (hors-scope ScanMyFace car MediaPipe ne
#     les couvre pas) → spam d'unmapped résolu par IGNORED_ZONES_NORM
#   - Le run plantait par 503 Gemini en série sur 264 appels
#   Décision : RESTER SUR LE WORKFLOW MANUEL (~30 min de screenshots par
#   visage + 5 min de run script = 35 min/visage, fiable et reproductible).
#   Le script video_to_frames.py reste dans le repo mais n'est pas la voie
#   principale.
#
# ▶ NOUVELLE FONCTIONNALITÉ — IGNORED_ZONES_NORM :
#   Set en tête de extract_sliders.py listant les zones à exclure volontairement
#   du scope (actuellement : toutes les variantes "Ears", "Earlobe", "Ear Outside
#   Top/Middle/Bottom", "Ear Inside Top/Middle/Bottom"). Ces zones sont loggées
#   dans unmapped_zones.txt avec préfixe [IGNORED] sans spammer stderr.
#   Raison : MediaPipe Face Mesh (478 landmarks) ne couvre pas les oreilles,
#   donc l'app ScanMyFace ne peut pas matcher → on n'écrit pas ces sliders en
#   jeu pour préserver le preset de base. Alex confirme : décision long terme.
#
# ▶ PROCHAIN VISAGE (suggestion mise à jour) :
#   Maintenant qu'on a Neymar (Métis ovale) + Zlatan (Claire allongé), les
#   priorités de diversification sont :
#   1. Carnation Très foncée (priorité absolue) : Osimhen, Mendy, Salah,
#      Koulibaly, Sadio Mané
#   2. Anchor morpho mâchoire carrée : Lewandowski, Vidal
#   3. Anchor morpho pommettes saillantes : Benzema, Modrić
#   4. Diversité usage TikTok (notoriété marketing) : Mbappé, Vinicius
#
# ▶ COÛT ZLATAN : ~$0.05 (3 runs full + retry partiel). Budget Gemini restant
#   sur 10€ initiaux : ~9.90€. Suffisant pour 17 visages restants × $0.05 = $0.85.
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (31 mai 2026) — NEYMAR 303/303 ✅ — PIPELINE STABILISÉ PROD
# Premier visage célèbre complet de la PHASE 2. Pipeline maintenant prêt
# pour les 18 autres visages.
# ════════════════════════════════════════════════════════════
#
# ▶ RÉSULTAT FINAL NEYMAR (100 screenshots, run propre) :
#   - Squelette: 103/103 ✅
#   - Chair: 163/163 ✅
#   - Graisse: 37/37 ✅
#   - TOTAL: 303/303 — ZÉRO non-canonical, ZÉRO unmapped
#   - 3 corrections famille auto par le crop (skeletal→flesh ×2, unknown→flesh ×1)
#   - Fichier livré : app/admin/neymar_v1.json
#
# ▶ MAPPING_ZONE COMPLÉTÉ (49 entrées ajoutées en une passe) :
#   Couvre maintenant tous les labels EN du menu Sculpt FC26. Catégories
#   ajoutées dans cette session :
#   - Paupières / sous-yeux (graisse) : Eyelid Upper/Lower, Under-Eye Lower
#   - Nez / narines (chair) : Nostril Upper/Lower + variantes Center/Outer
#   - Joues (chair + graisse) : Upper/Lower × Inside/Outside Cheeks, Jowl
#   - Bouche / lèvres (chair) : Mouth Corners, Upper Lip Top/Bottom × Center/Sides,
#     Lower Lip Top/Bottom × Center/Sides, Upper/Lower Lip Fullness, Mouth Corner Grooves
#   - Menton (squelette + chair) : Upper Chin → menton_sup, Chin Cleft → fossette_mentonniere
#   - Mâchoire (squelette) : Inside Jaw Top → maxillaire, Inside Jaw Bottom → mandibule
#   - Crâne / tempes : Skull Back → crane_arriere, Temples → tempes, Nose Tip Under
#     → pointe_nez_sous_jacente
#
# ▶ CORRECTION RÈGLE LARGER/SMALLER : la fonction resolve_suffix avait une règle
#   trop restrictive : "plus_grande_petite" SEULEMENT pour orbites, "plus_petite"
#   pour tout le reste. Le canonique veut "plus_grande_petite" pour orbites ET
#   yeux (Squelette), et "plus_petite" pour tout le Chair (paupières, plis, coins).
#   Fix : "plus_grande_petite" if zone_key in ("orbites", "yeux") else "plus_petite".
#
# ▶ DEUXIÈME CORRECTION slider_ui_order.json :
#   - zone "yeux" (Squelette) : sliders["arrondi_angulaire"] → ["plus_grande_petite"].
#     Le 4e slider de Yeux en jeu est "Larger/Smaller" (vu en screenshot direct),
#     pas "Round/Angular". Confirmé visuellement par Alex.
#
# ▶ BUG DOUBLON slider_ui_order.json : il existe DEUX copies du fichier :
#   - app/admin/slider_ui_order.json (utilisé manuellement pour les inspections)
#   - slider_ui_order.json (à la racine, utilisé par défaut par extract_sliders.py
#     via Path(__file__).resolve().parents[2] / "slider_ui_order.json")
#   Les corrections doivent être appliquées AUX DEUX FICHIERS, sinon le script
#   valide contre la version racine non corrigée. À unifier (lien symbolique
#   ou suppression d'une copie) dans une prochaine passe de cleanup.
#
# ▶ DÉDUPLICATION MAPPING_ZONE : des exécutions répétées des patches Python
#   avaient créé 5 doublons "skull back" / "nose tip under". Script de dédup
#   appliqué : reconstruit le dict en gardant l'ordre des 1ères occurrences.
#   À noter pour les futurs patches : utiliser des `if key not in content`
#   avant insertion.
#
# ▶ COÛT NEYMAR : ~$0.04 pour les 3 runs cumulés (1er debug + 2 runs complets).
#   Budget Gemini restant sur les 10€ initiaux : ~9.95€.
#
# ▶ WORKFLOW VALIDÉ POUR LES 18 AUTRES VISAGES :
#   1. mkdir -p ~/Desktop/<nom>/
#   2. Screenshot le menu Sculpt (Skeletal → Flesh → Fat, zone par zone, ~100 captures)
#   3. python3 extract_sliders.py --screenshots ~/Desktop/<nom>/ \
#        --metadata entry_id=<nom>_v1 display_name=<Nom> couleur_peau=<X> \
#        forme_visage=<Y> source_video_url=<URL> \
#        --output <nom>_v1.json
#   4. Vérifier 303/303 + 0 warning. Si nouveaux unmapped → enrichir MAPPING_ZONE.
#   5. Coût attendu par visage : ~$0.03. Durée par visage : ~30 min capture + 7 min run.
#
# ▶ PROCHAIN VISAGE (suggestion) : Osimhen
#   - Carnation Très foncée (sous-représentée : 2 actuellement → 3)
#   - Morpho extrême (front haut, tempes étroites)
#   - Star montante, beaucoup de tutos YouTube récents
#   Alternatives : Mbappé (notoriété + buzz mais carnation Métis redondante avec
#   Neymar), Zlatan (lèvres fines + visage carré, anchor morpho fort),
#   Lewandowski (mâchoire carrée).
#
# ▶ INSIGHT TECHNIQUE — couche "presets de base par sous-zone" :
#   Découverte lors d'un screenshot Neymar : il existe un écran "HEAD / FACE"
#   qui montre 11 IDs numériques par sous-zone (Forehead: 43, Jaw: 299, Ears: 1002,
#   Cheeks: 99, Chin: 1003, Neck: 43, Eyes: 99, Eyebrows: 43, Nose: 43, Mouth: 304,
#   Teeth: 3). Ce sont les PRESETS DE BASE sous chacune des 11 sous-zones, par-
#   dessus lesquels les 303 sliders s'appliquent.
#   DÉCISION ALEX : on n'en a pas besoin pour le moment. Cohérent avec le principe
#   modulaire FC26 (writing full vector overwrites preset DNA). Si la qualité de
#   ressemblance plafonne sur certains visages plus tard, on pourra y revenir.
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (29 mai 2026 - 3/3) — PIPELINE GEMINI OCR VALIDÉ ✅
# Outil d'extraction automatique des 303 sliders FC26 depuis screenshots du jeu.
# C'est la BRIQUE qui débloque la PHASE 2 de l'extension bank (sessions 2/2).
# ════════════════════════════════════════════════════════════
#
# ▶ POURQUOI : la PHASE 2 (ajouter ~19 visages célèbres à PRESETS_DB_v3.js)
#   demandait de saisir manuellement 303 sliders × 19 visages = 5757 valeurs.
#   Inhumain. Solution : pipeline OCR Gemini Vision sur les screenshots du
#   menu "Sculpt" du jeu (publiés par les YouTubers tutos sliders).
#
# ▶ OUTIL LIVRÉ : app/admin/extract_sliders.py
#   Lit un dossier de screenshots du menu Sculpt FC26 (anglais), interroge
#   Gemini 2.5 Flash, extrait { family, zone, sliders[] } par image, mappe
#   les labels EN→FR via MAPPING_ZONE + MAPPING_SUFFIX, valide contre le
#   canonique slider_ui_order.json, produit un JSON entrée célébrité prêt à
#   intégrer à PRESETS_DB_v3.
#
# ▶ CONFIG GEMINI (5 réglages critiques, tous nécessaires) :
#   1. model="gemini-2.5-flash" (pas 2.0-flash, déprécié pour nouveaux users)
#   2. thinking_config=ThinkingConfig(thinking_budget=0) — DÉSACTIVE le thinking.
#      Sans ça, le quota max_output_tokens est mangé par les tokens internes
#      et la réponse JSON est tronquée à "family": "skel...
#   3. max_output_tokens=8000 (500 et 2000 tronquaient quand même)
#   4. response_mime_type="application/json"
#   5. RETRY_DELAYS=(5.0, 25.0, 60.0) — Free Tier = 5 req/min, faut attendre 21s
#   FACTURATION OBLIGATOIRE pour la prod : Free Tier a un quota JOURNALIER
#   limit:0 qui crashe tout. 10€ de crédit Google AI Studio = des mois de prod
#   (28 images = $0.003, batch ~400 images = $0.04).
#
# ▶ DÉTECTION FAMILLE PAR CROP (fix essentiel) : Gemini sur l'image complète
#   se trompe régulièrement entre Skeletal/Flesh/Fat (ex: "tempes_moins_plus"
#   classé en Squelette alors qu'il est en Chair). Fix = fonction
#   detect_family_from_crop() qui crop la zone bas-droite (70%-100% largeur,
#   88%-100% hauteur) où sont les 3 tabs, et fait UN APPEL DÉDIÉ à Gemini :
#   "lequel des 3 tabs a le texte BLANC vs gris ?". Override systématique de
#   la famille extraite de l'image complète. Coût : 1 appel supplémentaire
#   par screenshot (~2s, $0.0001).
#
# ▶ PARSING ROBUSTE : parse_gemini_json() a été élargi pour extraire le
#   premier bloc {...} dans la réponse (au cas où du texte traînerait avant),
#   en plus du strip des markdown fences ```json. import re ajouté en tête.
#
# ▶ CORRECTIONS slider_ui_order.json :
#   - zone "crane" : sliders["arriere_avant"] → ["neutre_avant"]. Le slider
#     s'appelle "Neutre/Avant" en jeu (pas "Arrière/Avant"). Confirmé par
#     Alex. UNIQUEMENT pour crane (les autres zones gardent "arriere_avant").
#
# ▶ CORRECTIONS MAPPING_ZONE (extract_sliders.py) :
#   - Ajout "forehead": "front_sup" (Gemini envoie parfois juste "Forehead"
#     comme zone, en plus de "Upper Forehead", "Lower Forehead", etc.)
#
# ▶ TEST NEYMAR (28 screenshots, partiel — couvre ~1/3 des 303 sliders) :
#   Run final = 88 sliders extraits (Squelette 40/103, Chair 42/163, Graisse 6/37).
#   2 corrections famille appliquées par le crop (skeletal→flesh, unknown→flesh).
#   1 vrai non-canonical restant : "yeux_plus_petite" — Gemini a confondu une
#   capture d'Orbites avec Yeux (les deux sont sous le groupe "Eyes"). Edge case
#   à corriger manuellement ou via post-traitement (supprimer la clé incorrecte).
#   Validation valeurs Squelette vs saisie manuelle d'Alex : 9/9 correctes.
#   Coût total run = ~$0.01.
#
# ▶ FICHIERS DE LA SESSION :
#   - app/admin/extract_sliders.py (nouveau ; pipeline complet)
#   - app/admin/slider_ui_order.json (corrigé : crane → neutre_avant)
#   - app/admin/neymar_v1.json (premier livrable test)
#
# ▶ PROCHAIN CHANTIER PHASE 2 :
#   1. Compléter les screenshots Neymar manquants (~80 captures restantes
#      pour couvrir les 303 sliders). Actuellement 28/108 ≈ 26% couverture.
#   2. Choisir les ~18 autres visages célèbres prioritaires (carnations
#      sous-représentées Métis/Très foncée + morphos extrêmes).
#   3. Pour chaque visage : trouver vidéo YouTuber avec 303 sliders publiés,
#      screenshots du menu Sculpt complet → batch Gemini → JSON entrée.
#   4. Intégrer à PRESETS_DB_v3.js avec entry_type="celebrity" +
#      nearest_official_preset_id (calculé via Mahalanobis vs 31 officiels).
#   5. Pour chaque entrée célébrité, scanner le rendu jeu via l'app PWA
#      pour obtenir les scanned_stats (mesures MediaPipe + custom metrics).
#
# ▶ POINT OUVERT : faut-il un post-traitement automatique pour drop les
#   clés non-canoniques ? Actuellement loggées dans _meta.non_canonical_keys
#   mais GARDÉES dans le JSON. Si on intègre direct à PRESETS_DB, ça pollue.
#   Décision à prendre en phase d'intégration.
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (29 mai 2026 - 2/2) — PHASE 1 EXTENSION BANK (schéma)
# ════════════════════════════════════════════════════════════
#
# ▶ OBJECTIF GLOBAL : étendre PRESETS_DB_v3.js de 31 → ~50 entrées en ajoutant des
#   visages célèbres mesurés via l'app (Mbappé, Vinicius, Pogba, Zlatan, Osimhen, etc.).
#   But : combler les morphos hors-plage diagnostiquées le 26 mai (KEITA sortait
#   4 zones sur 5 "hors-plage", stock biaisé "ovale clair moyen partout").
#
# ▶ ARCHI DE LA BANK ÉTENDUE :
#   - 31 entrées officielles : entry_type="official", nearest_official_preset_id = preset_id
#   - ~19 entrées célébrités : entry_type="celebrity", nearest_official_preset_id =
#     preset officiel le plus proche (calculé via Mahalanobis vs les 31)
#   - Chaque entrée célébrité aura : scanned_stats (mesures via l'app sur screenshot
#     du visage rendu par un YouTubeur en jeu) + faconner (303 sliders publiés par
#     le YouTubeur)
#
# ▶ FLOW USER (inchangé conceptuellement) :
#   1. Scan user → mesures par zone
#   2. computeZoneMix Mahalanobis sur les ~50 entrées (au lieu de 31)
#   3. Pour chaque zone, l'app affiche le nearest_official_preset_id de l'entrée gagnante
#      (= preset officiel sélectionnable en jeu)
#   4. Étape 4 Façonnage Avancé : sliders de l'entrée gagnante poussés dans le jeu
#
# ▶ PHASE 1 FAIT :
#   - Ajout entry_type="official" aux 31 entrées de PRESETS_DB_v3.js
#   - Ajout nearest_official_preset_id = preset_id aux 31 entrées
#   - Bump sw.js v116 → v117
#   - Validation : 31 entries entry_type, 31 nearest_official_preset_id,
#     0 mismatch preset_id/nearest_official_preset_id, JS toujours valide
#
# ▶ LABELS MORPHO DEAD CODE (constatation, pas d'action) :
#   machoire_label, levres_label, nez_label, pommettes_label, front_label ne sont
#   référencés que dans OLD_script.js (pas chargé en prod). Laissés dormants dans
#   PRESETS_DB_v3.js pour ne pas faire de bruit cette session. À retirer plus tard
#   si nettoyage souhaité.
#
# ▶ PHASE 2 À VENIR : sélectionner les ~19 visages célèbres prioritaires (cibler
#   carnations sous-représentées : Métis 1→5, Très foncée 2→5, et morphos extrêmes :
#   lèvres fines, pommettes saillantes, front étroit), trouver vidéos YouTubers avec
#   303 sliders publiés, screenshot rendu jeu + mesure via l'app + intégration
#   PRESETS_DB_v3.js avec entry_type="celebrity".
#
# ▶ PHASE 3 À VENIR : valider en jeu sur 3-5 visages réels (Alex, KEITA, amis) que
#   les entrées célébrités sont effectivement piochées par computeZoneMix sur les
#   morphos extrêmes.
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# DERNIÈRE SESSION (26 mai 2026) — LIRE EN PREMIER.
# Refonte du MATCHING (z-score → Mahalanobis par zone) + mix Frankenstein affiché sur le site.
# (Les sessions 25/24/23 mai dessous restent valides pour le SOCLE bestPreset, les blocs calibrés
#  Squelette/bouche/nez, et la section 3DDFA. On n'a PAS touché à scanToSliders cette session.)
# ════════════════════════════════════════════════════════════
#
# ▶ CE QUI A ÉTÉ FAIT (tout commité sur GitHub) :
#   1. COHÉRENCE DES MESURES RÉPARÉE (bug latent en prod) : les scanned_stats des 31 presets dans
#      PRESETS_DB_v3.js avaient été générés par une ANCIENNE version du code → incohérents avec les
#      mesures actuelles. Le matcher comparait donc user-mesuré-par-code-actuel vs presets-mesurés-par-
#      ancien-code. RÉPARÉ en rescannant les 31 presets avec le code actuel (commande batch console
#      réutilisable : boucle sur PRESETS_DB, charge ./assets/presets/<id>.png, S.faceLandmarker.detect,
#      puis calculateMixAttributes + augmentAttributesWithCustomMetrics, copie le JSON au presse-papier).
#   2. MATCHING z-score PUIS Mahalanobis PAR ZONE : la distance par zone n'est plus une somme de
#      |z-score| (qui ignore les corrélations) mais une vraie distance de Mahalanobis : d²=(x−y)ᵀ Σ⁻¹ (x−y),
#      Σ = covariance des mesures de la zone sur les 31 presets, régularisée Ledoit-Wolf
#      (C_reg=(1−α)C+α·diag(C), α=0.2) pour garantir l'inversibilité. Inversion maison (k=1/2/3 analytique,
#      k≥4 Gauss-Jordan). ORDERED_KEYS définit l'ordre des mesures par zone. Score d'affichage recalibré
#      100·exp(−d/D0), D0=75 (l'ancien 100−d·25 saturait à 0). calculateCategoryDistance réécrite,
#      signatures inchangées. ⚠️ La zone SOURCILS tombe en FALLBACK DIAGONAL (covariance singulière) car
#      sourcils.width == front.width (MÊME formule = doublon) → seulement 2 infos indépendantes sur 3.
#   3. MESURES CASSÉES / REDONDANTES RETIRÉES :
#      - joues.height (variait d'un facteur ~4000×, pur bruit), base.height, base.volume → exclues du calcul.
#      - nez.volume RETIRÉ : corrélé 0.85 avec nez.width (mesurait la largeur en double). ORDERED_KEYS.nez
#        passé à [width, height, projection, narine, compacite_narines].
#   4. NOUVELLES MESURES DE FORME — testées, gardé ce qui discrimine ET est stable :
#      ✅ BOUCHE (gardées) : aire (shoelace contour lèvre externe), compacite (4πA/P²), excentricite
#         (valeurs propres covariance 2×2), ratio_levres (épaisseur sup/inf). Stables (0.3–2% sur 2 photos,
#         compacite la + bruitée à 9%). aire (ampli 3.6×) et compacite (2.0×) discriminent bien.
#         ⚠️ MAIS le matching bouche n'a PAS changé à l'œil (50/50) → la bouche était DÉJÀ bien matchée,
#         ajouter des mesures sur une zone déjà résolue n'aide pas. Gardées car inoffensives (Mahalanobis
#         les pondère). ORDERED_KEYS.bouche = [width, height, volume, aire, compacite, excentricite, ratio_levres].
#      ✅ NEZ (gardée) : compacite_narines (4πA/P² du contour narine gauche [75,79,237,238,97,2]).
#         Ampli 1.46× (correcte) mais bruitée 14%. A DÉSERRÉ le top nez : #299 passe de +4% à +30% d'avance.
#      ❌ MÂCHOIRE (testées puis ABANDONNÉES) : solidite (aire/enveloppe convexe) + courbure (écart-type
#         angles de virage) sur contour mandibulaire. solidite restait TOUJOURS = 1.000 (contour convexe
#         en 2D, même en remontant aux angles goniaques). CONCLUSION : la carrure de mâchoire (carré vs rond)
#         est de l'info de PROFONDEUR (Z), INVISIBLE en 2D de face. Retirées du code. Récupérable seulement
#         via 3/4 ou TrueDepth.
#      ❌ NEZ (testées puis ABANDONNÉES) : evasement (ailes/arête, ampli 1.13× = plate) et ratio_pointe_base
#         (1.08× = quasi plate). Retirées. Les presets ont tous des nez de FORME similaire.
#   5. MIX FRANKENSTEIN — calcul + affichage :
#      - computeZoneMix(userAttr, scoringPool) NOUVELLE fonction (presetMatch.js, exposée window) : pour
#        chaque zone, classe les presets par distance Mahalanobis SUR CETTE ZONE, retourne {best, distance,
#        separation, top3}. separation=(d2−d1)/d1 (>0.15 net, <0.05 indécis). selectBestPreset retourne
#        maintenant {bestPreset, ratios, scores, zoneMix} (le bestPreset GLOBAL est inchangé).
#      - AFFICHAGE étape 3 (script_spa.js) : le bloc "Familles · 3 groupes" (Squelette/Chair/Graisse repliés)
#        est REMPLACÉ par "Mix par zone · Frankenstein" — 8 lignes (Zone | Preset #X | pastille de confiance
#        FIABLE vert / CORRECT orange / APPROX. rouge selon separation). zoneMix stashé sur
#        S.sliders._meta.zoneMix (pas de recalcul). Carte du haut (tête réf + carnation) + Top 3 alternatives
#        + bouton "Passer au Façonnage Avancé" CONSERVÉS. Clé i18n mix_title ajoutée. Lignes NON cliquables.
#        Fix scroll : .mix passé de flex:1 à flex:0 0 auto + padding-bottom:90px sur .s3__main (sinon la 8e
#        ligne Mâchoire était clippée derrière le CTA).
#
# ▶ MIX RÉEL DE LA TÊTE TEST (KEITA) — preuve que le Frankenstein apporte de la valeur :
#   front→#226(net), sourcils→#116(net mais hors-plage), yeux→#116(indécis), nez→#299(net),
#   joues→#116(net), bouche→#116(ok), menton→#151(indécis), machoire→#116(ok, d4.39).
#   3 zones piochent ≠ du global #116 → l'assemblage par zone bat le preset unique.
#
# ▶ DIAGNOSTIC MAJEUR (oriente toute la suite) :
#   LE PLAFOND DE RESSEMBLANCE N'EST PAS LE NOMBRE DE MESURES — c'est l'HOMOGÉNÉITÉ DU STOCK de 31 presets.
#   Audit des 8 zones : 4 zones sur 5 testées sortent la morpho de KEITA "HORS-PLAGE" (sourcils hauts,
#   yeux grands/écartés, joues larges, menton). Les joues ont un CV de 1-2% (presets quasi identiques).
#   Le matching choisit "le moins pire". Les mesures 2D sont AU TAQUET. Deux vrais leviers restants :
#   (1) ENRICHIR LE STOCK, (2) PROFONDEUR (3/4 ou TrueDepth).
#
# ▶ PROCHAIN CHANTIER = IDÉE D'ALEX "pièces extrêmes par zone" (le bon usage du levier "enrichir le stock") :
#   Créer DANS LE JEU des zones extrêmes (yeux énormes, lèvres pleines, nez larges, sourcils hauts), NOTER
#   leurs valeurs de sliders, les SCANNER (même pipeline que les 31), les AJOUTER au stock comme PIÈCES
#   SPÉCIALISÉES PAR ZONE. Le Frankenstein piochera dedans pour les morphologies HORS-PLAGE actuelles.
#   100% LÉGAL (créations propres d'Alex, pas de mod/datamining). Compatible avec l'archi (= entrées de plus
#   dans PRESETS_DB avec scanned_stats + avance). Prévoir peut-être un flag zone_specialisee:"yeux".
#   ⚠️ Limite : reste 2D → matche la TAILLE/forme frontale, PAS la protrusion Z (yeux "globuleux" au sens
#   "qui ressortent" = profondeur, invisible). Cibler des critères mesurables en 2D.
#
# ▶ FICHIERS DE LA SESSION : presetMatch.js (Mahalanobis + computeZoneMix + nouvelles mesures bouche/nez),
#   PRESETS_DB_v3.js (scanned_stats des 31 RÉGÉNÉRÉS, incluent les mesures bouche/nez), script_spa.js
#   (affichage Mix par zone), scanToSliders_v6.js (stash zoneMix sur _meta), sw.js (v103 → v115), style.css
#   (fix scroll étape 3). ⚠️ .git/index corrompu par iCloud 2× cette session (fix rm -f .git/index && git reset).
#
# ▶ FONCTIONS PROTÉGÉES (NE JAMAIS modifier) : softClampSlider, extractMorphRatios, computePresetScore,
#   et la signature de selectBestPreset (son RETOUR a été étendu avec zoneMix, mais la signature est intacte).
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (25 mai 2026) — Le socle bestPreset est BRANCHÉ.
# (Les sessions 24 et 23 mai dessous restent valides pour les blocs calibrés Squelette/bouche/nez.)
# ════════════════════════════════════════════════════════════
#
# ▶ 3 INFOS DE L'ANCIEN DOC ÉTAIENT FAUSSES (corrigées cette session) :
#   1. "preset() ancre sur P9" → FAUX. preset() écrivait PRESET_NEUTRE = 50 PARTOUT, pas la DNA du
#      Preset 9. Prouvé par round-trip : sur le rescan du Preset 9, 22/25 sliders figés divergeaient
#      de la vraie DNA P9. Le "socle P9" n'a jamais existé — c'était du 50 neutre = visage générique.
#   2. "selectBestPreset / extractMorphRatios / computePresetScore N'EXISTENT PLUS" → FAUX. Ils sont
#      vivants et COMPLETS dans l'ancien script.js. On les a RÉHABILITÉS (voir ci-dessous).
#   3. "PRESETS_DB_v3.js supprimé, ne pas recréer" → FAUX. Présent, complet (scanned_stats + couleur_peau
#      + forme_visage + avance). C'est la base du matching. RÉHABILITÉ et CHARGÉ EN PROD.
#
# ▶ CE QUI A ÉTÉ FAIT (socle cohérent enfin branché — c'était la priorité #1 du 24 mai) :
#   - MATCHING réhabilité : selectBestPreset (filtre carnation + distance 9 zones pondérées
#     nez×2, mâchoire/menton/yeux×1.5) porté dans un nouveau fichier app/presetMatch.js, avec
#     calculateMixAttributes + augmentAttributesWithCustomMetrics + SEMANTIC_INDEX + helpers,
#     copiés EXACTEMENT depuis l'ancien script.js. Round-trip a validé : scanned_stats discriminants
#     (0 doublon, ratio distance ×5.2), self-match à 0.00.
#   - SOCLE : preset() pioche désormais la DNA Squelette du bestPreset choisi (via lookupPresetDNA +
#     DNA_KEY_MAP, table .avance→clé plate validée 3193/3193), au lieu de 50. Les ~52 mesures Squelette
#     FIABLES (élancement, nez/bouche largeur, taper) restent appliquées PAR-DESSUS.
#   - CHAIR/GRAISSE : AUCUNE mesure calculée (non fiable en 2D, confirmé). Preset/neutre, SAUF les 3
#     taper validés en jeu (machoire/joues/bajoue _moins_plus) qui restent en auto().
#   - CARNATION REFAITE : abandonné le 1-10 (induisait en erreur : "6"≠foncé intuitivement).
#     Passé à 5 CATÉGORIES nommées partout (Claire / Claire-bronzée / Métis / Foncée / Très foncée),
#     affichage + sélection + couleur. S.carnation SUPPRIMÉ. S.skinTone = la catégorie directe.
#     itaToCategory(ita) suggère au scan ; clic swatch = recalcul LIVE du bestPreset.
#   - couleur_peau de PRESETS_DB CORRIGÉE avec les vraies étiquettes en jeu d'Alex (la DB sur-classait
#     en Claire). Distribution réelle : Claire 16, Claire-bronzée 6, Foncée 6, Très foncée 2, Métis 1.
#     ⚠️ STOCK DÉSÉQUILIBRÉ : peu de presets foncés → variété de forme limitée pour visages très foncés.
#   - VOISINAGE carnation RESSERRÉ (déborde d'1 cran max, plus de saut) : Claire-bronzée → Claire/
#     Claire-bronzée/Métis (PLUS Foncée). Évite qu'un visage clair matche un preset foncé (ex. 151).
#   - UI : affiche l'image du bestPreset (./assets/presets/<preset_id>.png) au lieu du 9.png codé en dur,
#     + les 3 têtes alternatives (top 2-4) cliquables (switchToPreset → forcePresetId). Label = preset_id
#     (PAS la position : "PRESET 24" affichait en fait le preset_id 151 → confusion levée).
#
# ▶ FICHIERS DE LA SESSION : app/presetMatch.js (NOUVEAU), app/PRESETS_DB_v3.js (chargé, couleur_peau
#   corrigée), scanToSliders_v6.js (selectBestPreset auto + forcePresetId, preset()→DNA, signature
#   +skinTone +forcePresetId), script_spa.js (5 catégories, recalcul live, affichage têtes+alts),
#   presetMatch.js (carnationToCategory supprimée, neighborhoods resserrés). SW bumpé (~v98+).
#   ⚠️ PRESETS_DNA.js (créé en début de session) est OBSOLÈTE → remplacé par PRESETS_DB_v3.js. Ne plus charger.
#
# ▶ PLAN IMMÉDIAT — PROCHAINE CONVERSATION :
#   1. VALIDER À L'ŒIL : est-ce que la FORME du bestPreset ressemble au visage scanné ? (le teint
#      se règle en jeu — ne pas juger le matcher sur les étiquettes carnation du top-3). Cible : > 35%.
#   2. SI forme OK → ÉTAPE C "micro-fixes mesure" repérés par le round-trip :
#      - deplacement_gd INVERSÉS (corr ≈ -0.9 → signe à l'envers, fix d'1 ligne)
#      - bornes saturées sur les verticales (_bas_haut sortent trop bas)
#      Les largeurs /D_W sont PLATES (signal écrasé) → laisser au socle, ne pas s'acharner à les mesurer.
#   3. PUIS FREEZE FC26 (deadline ~7 juin) et bascule UFC 6 (sort 19 juin, early access 12 juin, +PC !).
#   ⚠️ Le round-trip MAE n'est PAS la métrique cible (faussé par confond Chair/Graisse : le rendu EA
#      inclut C+G, la vérité-terrain est Squelette-only). Le JUGE = ressemblance à l'œil en jeu.
#
# ▶ OUTIL CRÉÉ (réutilisable) : mode batch console round-trip (smfBatch/smfReport/smfReportCSV) pour
#   rescanner des presets et comparer vs vérité-terrain. Sert à détecter les biais par slider.
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (24 mai 2026) — décisions stratégiques (socle bestPreset MAINTENANT fait, cf. 25 mai).
# SESSION (24 mai 2026) — décisions stratégiques (historique, socle bestPreset fait depuis le 25 mai).
# (La session du 23 mai juste en dessous reste valide pour les blocs calibrés Squelette/bouche/nez.)
# ════════════════════════════════════════════════════════════
#
# ▶ CONSTAT CENTRAL DE LA SESSION (change la stratégie) :
#   La V2 "modulaire complète" (l'app écrit TOUT le vecteur, Chair + Graisse inclus) est PIRE
#   qu'une V1 "31 presets" (Chair/Graisse NON touchés). Test sur un VRAI visage : V2 < 35% de
#   ressemblance (visage creusé, vieilli, teint trop clair) alors que la version 31-presets du
#   MÊME projet ressemblait nettement mieux. Cause racine : les valeurs Chair/Graisse calculées
#   sont du BRUIT (ex. joues_moins_plus=17, pli_paupieres_ext=0, arrondis=100 un peu partout) et
#   CASSENT le visage. → LEÇON : la COHÉRENCE du vecteur entier compte plus que la précision
#   d'un slider isolé. Un vrai preset EA (vecteur cohérent) bat un vecteur calculé-mais-bricolé.
#
# ▶ MOTEUR 100% MODULAIRE — MAINTENANT PROUVÉ EN JEU (plus une hypothèse) :
#   Alex a pris 2 têtes de base DIFFÉRENTES + mêmes params Tête/Front/Joues/Mâchoire → MÊME visage.
#   Donc dès qu'on écrit le vecteur complet, la DNA du preset de base NE SURVIT PAS. Le visage =
#   le vecteur de sliders, point. Corollaire : "laisser la DNA du preset" n'est PAS automatique —
#   l'app doit RÉÉMETTRE explicitement les valeurs du preset pour les sliders non fiables.
#
# ▶ STRATÉGIE DÉCIDÉE (2 idées d'Alex, complémentaires PAS concurrentes) :
#   IDÉE 2 = ARCHITECTURE (le socle) : remettre les 31 presets + système bestPreset → sortir un
#     VECTEUR COHÉRENT shippable (= la V1 qui ressemblait mieux). ⚠️ Ancrer les sliders non mesurés
#     sur la DNA du MEILLEUR preset, PAS sur P9 neutre comme aujourd'hui (P9 = générique = casse la ressemblance).
#   IDÉE 1 = INSTRUMENT (validation supervisée / "round-trip") : rendre les 31 presets dans FC26,
#     les RESCANNER avec l'app, comparer la sortie app vs la VÉRITÉ-TERRAIN (valeurs connues des presets).
#     C'est un jeu de test ÉTIQUETÉ (on connaît la réponse à l'avance, contrairement aux célébrités
#     qui sont des choix d'artiste subjectifs). Sert à : (a) prouver que la chaîne mesure→slider est juste,
#     (b) détecter les BIAIS SYSTÉMATIQUES pour calibrer ("sous-estime toujours la largeur de X de 12"),
#     (c) TRANCHER Chair/Graisse : si le round-trip reproduit leurs valeurs → fiable, sinon → on n'écrit pas.
#   SYNTHÈSE : idée 2 = sur quoi on construit ; idée 1 = ce qu'on a le droit d'overrider par-dessus.
#
# ▶ PLAN IMMÉDIAT — PROCHAINE CONVERSATION COMMENCE ICI (Squelette d'abord) :
#   1. SQUELETTE EN PREMIER (vérité-terrain dispo). Alex A les valeurs Squelette des 31 dans
#      PRESETS_DB_v3.js (⚠️ v3, PAS v4 ; et NB : ce fichier est listé "supprimé" plus bas ligne ~218
#      = info PÉRIMÉE, il est bien présent et c'est la vérité-terrain Squelette).
#   2. Alex A les 31 images de presets (dossier assets sur son Mac).
#   3. LE SCAN SE FAIT CHEZ ALEX, dans son navigateur. MediaPipe NE tourne PAS dans le sandbox Claude
#      NI dans Cowork/Claude-in-Chrome (pas de pipeline vision hors navigateur). Claude ne peut PAS
#      scanner les images lui-même. (Claude in Chrome PEUT cliquer/uploader via file_upload SI l'app
#      utilise un <input type=file> standard ET si les résultats sortent en console — sinon non.)
#   4. RÔLE DE CLAUDE (prochaine conv) : (a) lire PRESETS_DB_v3.js → confirmer format/noms de sliders,
#      (b) coder un MODE BATCH console (scanner les 31 d'affilée → dump tableau propre),
#      (c) croiser dump-app vs PRESETS_DB_v3 → RAPPORT D'ÉCART par slider Squelette : fiable / biais
#      systématique (→ corriger) / bruit (→ ne pas écrire). Commencer par 3-4 presets extrêmes (rond,
#      long, mâchoire carrée) en fail-fast AVANT de scaler à 31.
#   5. CHAIR PLUS TARD : vérité-terrain Chair pas encore relevée. Il faut LIRE les valeurs à l'écran FC26
#      (≈ celles que l'app calcule, ~15-25 sliders, pas les 100+). Claude doit fournir la liste exacte
#      des sliders Chair que scanToSliders calcule → Alex relève seulement ceux-là.
#
# ▶ MÉTHODE REJETÉE (ne pas reproposer) : DATAMINER les fichiers du jeu FC26 pour récupérer les
#   valeurs des presets. NON : (1) Frostbite = archives chiffrées .toc/.sb/.cas, pas d'outil fiable
#   FC26 ; (2) viole le CLUF EA → risque DMCA/cease-and-desist sur un PRODUIT COMMERCIAL (Stripe,
#   lancement Reddit). La vérité-terrain se lit À L'ÉCRAN du jeu, pas dans les fichiers.
#
# ▶ FIXES CODE DE LA SESSION (à conserver / vérifier déployés) :
#   - menton_reduire_elargir : BUG corrigé. Mesurait une distance VERTICALE (L175/L152) sur un slider
#     de LARGEUR → menton toujours étroit. FIX : _norm(_dist(L149,L378)/D_W, 0.42, 0.53). À VALIDER EN JEU.
#   - philtrum_reduire_elargir : même bug. Mesurait L164/L0 (vertical=longueur) → FIX : largeur de l'arc
#     de cupidon _norm(_dist(L37,L267)/D_W, 0.04, 0.12). Bornes provisoires. À VALIDER EN JEU.
#   - CONVENTION ARRONDI = BIPOLAIRE À NEUTRE CENTRAL (voir section dédiée plus bas, MISE À JOUR).
#   - nez/yeux/sourcils _arrondi_angulaire : confirmés FIGÉS P9 (signal plat 2D). Ne pas recalibrer en 2D.
# ════════════════════════════════════════════════════════════

# ════════════════════════════════════════════════════════════
# SESSION (23 mai 2026) — état antérieur, blocs calibrés toujours valides
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
- Fichiers principaux : script_spa.js, scanToSliders_v6.js, PRESETS_DB_v4.js (31 officiels avec
  faconner.chair + graisse flat injectés depuis Notion le 7 juin), celebrities_to_inject.js
  (10 célébs fusionnées au runtime), presetMatch.js, calibration_v7_slim.js, index.html, style.css,
  sw.js (CACHE v127)
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
- SW actuel : fc26-cranium-v127 (à incrémenter) — mis à jour 7 juin (Phase 2.5 DNA Chair/Graisse)
- Mobile-first : tester à 375px avant tout commit
- Chemins fichiers : tous avec ./ prefix (ex: ./style.css, ./9.png, ./sw.js)

## ⚠️ Fonctions — état réel (CORRIGÉ 25 mai — l'entrée précédente était fausse)
- softClampSlider() : EXISTE (scanToSliders_v6.js, clamp 0-100 + arrondi). Réutiliser, ne pas dupliquer.
- selectBestPreset / calculateMixAttributes / augmentAttributesWithCustomMetrics / computeGlobalDistance :
  RÉHABILITÉES le 25 mai (portées de l'ancien script.js vers app/presetMatch.js), ACTIVES (cœur du matching).
  ⚠️ MISE À JOUR 26 mai : la distance par zone (calculateCategoryDistance) tourne maintenant en MAHALANOBIS
  par zone (covariances régularisées Ledoit-Wolf, fallback diagonal sur sourcils=doublon), plus la simple
  somme de z-scores. computeZoneMix ajoutée (mix Frankenstein par zone). Voir bloc SESSION 26 mai en tête.
- extractMorphRatios / computePresetScore : existent dans l'ancien script.js mais NON portées (pas
  nécessaires au matching ; extractMorphRatios ne servait qu'à classifyFaceShape pour l'affichage).

## Architecture sliders FC26
- 303 sliders en 3 familles : S (Squelette 103), C (Chair 163), G (Graisse 37)
- ⚠️ CORRIGÉ 25 mai : preset() ne met PLUS 50/P9. Pour la famille S, preset() pioche la DNA du
  bestPreset (lookupPresetDNA via PRESETS_DB_v3 .avance). Pour C/G : neutre 50 (sauf 3 taper en auto()).
  L'ancienne "table P9 dans script_spa.js" existe encore mais n'est plus le socle de scanToSliders.
- scanToSliders_v6.js : auto() pour les sliders mesurés fiables, preset() = socle DNA du bestPreset.
- _dist = distance 3D (inclut .z) ; _norm(ratio, min, max) = clamp puis 0-100
- Signature : scanToSliders(landmarks, tddfaResult, skinTone, forcePresetId). skinTone = catégorie
  (Claire/.../Très foncée). forcePresetId = override manuel quand l'user clique une tête alternative.

## ⚠️ OUTILS CONSOLE DEV (à coller dans la console navigateur, script classique → S accessible)
Diagnostic ratios bruts (calibration) :
  smf()  // après scan → table de tous les ratios (faceRatio, taper, nez, bouche) + bornes
Voir des sliders FINAUX filtrés par mot-clé :
  smfShow("epaisseur_levre")        // tous les sliders contenant ce mot, avec valeur FC26 finale
  smfShow("machoire", "joues")      // plusieurs mots
Copier toute la recette FC26 : window.onCopyRecipe()  (déjà dans le code, copie le presse-papier)
Mesure Y brut d'un point : S.landmarks[i].y  (S = état global, S.sliders = dernier scan)

## Moteur FC26 — règles critiques
- Moteur 100% MODULAIRE : copier tous les attributs écrase complètement le DNA de base.
  PROUVÉ EN JEU (24 mai) : 2 têtes de base ≠ + mêmes params → même visage. La DNA du preset ne survit pas.
- Sous-menus R2 = familles Graisse et Squelette. PAS de logique "relative au DNA" — tout est absolu.

## ⚠️ CONVENTION ARRONDI (_arrondi_angulaire) — BIPOLAIRE À NEUTRE CENTRAL (mise à jour 24 mai)
- L'échelle interne qui compte : 0 = ROND extrême | 50 = NEUTRE | 100 = ANGULAIRE extrême.
- En jeu l'affichage est DIRECTION + INTENSITÉ ("Round 45", "Angular 100"). "Angular 0" = "Round 0" = NEUTRE (=50 interne).
  Preuve : le menu écrit "Round 45/50" à côté de "Angular 100" → impossible si 0 était l'extrême rond.
- Validation visuelle (rendus JaxStash) : Zlatan jaw "Angular 100" = mâchoire dure/taillée ✅ ;
  CR7 jaw "Angular 0" = NEUTRE (pas ronde, juste normale) — sa définition vient du Forward + volume, pas de l'angulaire.
- Ancres de calibration (sortie attendue de machoire_arrondi) : CR7 ≈ 50 (neutre) | Zlatan nettement > 50 (~65-85).
- toSlider est centré sur 50 → un visage neutre sort ~50, un visage dur monte vers 100. Centrage CORRECT, ne pas re-déplacer.
- ⚠️ Les chiffres JaxStash sont des CHOIX D'ARTISTE (souvent poussés à 100 par style), pas une vérité anatomique.
  Cible finale = le visage À L'ŒIL, pas le chiffre. Et les leçons "il faut + d'angulaire" viennent de visages DURS
  (Zlatan, CR7, MJ) → NE PAS généraliser aux visages jeunes/ronds (ça les rend creusés/étrangers, cf. constat 24 mai).

## Traductions
- TR = { fr:{...}, en:{...} } dans script_spa.js ; appel via t('clé') ; setLanguage() re-render
- en.json / fr.json à la racine pour la landing page (système séparé)

## Flow analyse
1. Upload photo ou caméra → 2. Cropper.js dans le viewport → 3. confirmCrop → showPhoto → runAnalysis
4. runAnalysis : Azure quality check (non-bloquant si no_face) + MediaPipe en parallèle
5. Azure bloquant pour : too_blurry, bad_angle, bad_light. no_face → continue avec MediaPipe
6. runMP → scanToSliders_v6.js → S.sliders → rendu étape 3 puis 4

## Carnations (⚠️ REFAIT 25 mai)
- 5 CATÉGORIES (plus de 1-10) : Claire / Claire-bronzée / Métis / Foncée / Très foncée.
  FC26_SKIN_CATEGORIES dans script_spa.js (key+color). S.skinTone = la catégorie. S.carnation SUPPRIMÉ.
- itaToCategory(ita) : ITA CIELAB → catégorie suggérée au scan (≥41 Claire, ≥28 Claire-bronzée,
  ≥10 Métis, ≥-30 Foncée, sinon Très foncée). L'user confirme/corrige via 5 boutons (recalcul live).
- Le matcher filtre via neighborhoods (presetMatch.js, resserré : déborde d'1 cran). Le teint FINAL
  est réglé par l'user en jeu (FC26 a 10 carnations) — l'app ne fait que choisir une tête de base proche.

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

## ✅ BFM RETIRÉ (licence) — 29 mai 2026 — corrige le diagnostic du 26 mai
Le 26 mai j'avais flaggé "3DDFA = BFM = problème licence commerciale, à retirer". Après audit fin
ce 29 mai, le diagnostic était trop large. État réel après nettoyage :
- ❌ SUPPRIMÉ : `app/bfm_indices.js` — c'était la VRAIE dette licence (indices de vertex + Z de
  référence pris littéralement dans le mesh BFM moyen, 53215 vertices). Fichier orphelin de toute
  façon (chargé dans index.html mais `window.BFM` jamais lu ailleurs → grep le confirme), donc
  suppression zéro impact runtime. Retiré aussi de `index.html` et du cache `sw.js`. SW v115→v116.
- ✅ GARDÉ : `app/3ddfa_mb1.onnx` (12 Mo) — poids `mb1_120x120.onnx` de cleardusk/3DDFA_V2, repo MIT
  (LICENSE vérifiée 29 mai : Copyright 2017-2020 deGroot/Brown/Wong/Zhang/Guo, MIT pur). Pas de
  licence séparée pour les poids (`weights/readme.md` du repo). Commercial OK.
- ✅ GARDÉ : `app/3ddfa_params.json` — mean[62]/std[62] pour dénormaliser la sortie réseau. Ce ne
  sont PAS des données BFM : ce sont les statistiques de centrage/réduction calculées sur le
  dataset d'entraînement 300W-LP, redistribuées par cleardusk sous MIT. Nécessaires pour
  reconstruire la matrice caméra 3×4 → `pose.R` (les 12 premiers floats). Sans elles, R sort
  cassée (diagonales ~0 au lieu de ~1) et les ~35 sliders `_arriere_avant` retombent en bruit.
  Le fallback ligne ~55 (mean=0/std=1) n'est qu'un garde-fou si fichier absent, PAS un mode "OK
  sans BFM" — le neutraliser casserait pose.R.
- Commentaire d'en-tête `run3DDFA.js` mis à jour : recette pickle BFM retirée, remplacée par note
  d'origine 300W-LP/MIT + traçabilité du nettoyage 29 mai.

→ Le chantier "remplacer 3DDFA par FLAME" est ANNULÉ. Le pipeline 3DDFA actuel est commercialement
clair. La doc technique ci-dessous reste valide.

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

## Fichiers supprimés / obsolètes (⚠️ liste CORRIGÉE 25 mai)
- PERFECT_RECIPE_*.js, ruvector.db, agentdb.rvf : supprimés, ne pas recréer.
- PRESETS_DNA.js : créé puis ABANDONNÉ le 25 mai (remplacé par PRESETS_DB_v3.js). Ne plus charger.
- ⚠️ CORRECTION : PRESETS_DB_v3.js et script.js NE SONT PAS supprimés (ancienne note FAUSSE).
  PRESETS_DB_v3.js = base vivante du matching (chargée en prod). script.js = ancienne app, source des
  fonctions de matching réhabilitées (gardée comme référence, pas chargée en prod).

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

### Roadmap ressemblance (par impact) — RÉVISÉE 25 mai
0. ✅ FAIT (25 mai) : ARCHITECTURE VECTEUR COHÉRENT. bestPreset (matching 9 zones + carnation) branché,
   socle = DNA Squelette du preset choisi (plus 50/P9), mesures fiables par-dessus. C'ÉTAIT la priorité #1.
   → RESTE À VALIDER À L'ŒIL EN JEU (cible > 35%) puis micro-fixes ci-dessous.
1. ÉTAPE C — micro-fixes mesure (round-trip) : deplacement_gd inversés (signe), bornes verticales
   saturées. Largeurs /D_W = plates (laisser au socle). ⚠️ APRÈS validation œil du socle.
2. Étendre le mapping 3DDFA (déjà actif) : débloquer arrondis figés (nez, lèvres) preset()→presetA().
3. Zones 2D restantes (menton ✅, yeux/paupières, sourcils) via round-trip.
4. Alternative 2 photos (face + 3/4) pour Z (+20%). 5. MICA Azure → FLAME (V3).
- Plafond absolu FC26 ~90% (Frostbite ; EA atteint 85-92% en studio multi-cam).
- ⚠️ Enrichir le stock de presets FONCÉS (seulement 2 Très foncée, 1 Métis → peu de variété de forme).

### Décisions actées
- ❌ CelebA + Azure Custom Vision (binaire vs continu, dataset biaisé)
- ❌ DepthAnything V2 / MiDaS → remplacé par 3DDFA V2
- ✅ 3DDFA V2 ONNX (V2) ; ✅ MICA Azure (V3)
- ✅ Proxys 2D ancrés P9 (élancement, taper, largeurs) : méthode validée pour débloquer du signal avant 3DDFA

## Positionnement marché
- ScanMyFace = solution unique sur FC26 (vérifié mai 2026). NBA 2K natif jugé catastrophique → opportunité.
- Marché prouvé (tutos sliders manuels YouTube/TikTok). FUTBin = 32-40M visites/mois. RPM racheté Netflix 2025.

## Monétisation (⚠️ À RETRAVAILLER — mis à jour 26 mai)
- ⚠️ Le modèle de prix est À REDÉFINIR. L'ancien tableau (Pass Scan €3.99 / Pro €7.99-59.99 / Lifetime
  €24.99) n'est plus la référence — à retravailler entièrement (niveaux, prix, contenu de chaque palier).
- Acquis stable : Stripe en Test mode → à passer en Live. Piste B2B (6-12 mois) à explorer.

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
