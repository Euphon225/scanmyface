const PRESETS_DB = [
  {
    position: 1,
    preset_id: 23,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Carré",
    peau_detail: "Claire",
    forme_detail: "Carré",
    machoire_label: "Large",
    levres_label: "Fines",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 34, bas_haut: 70,
        neutre_avant: 44, arrondi_angulaire: 92,
        gauche_droite: 52
      },
      front_superieur: {
        reduire_elargir: 67, arriere_avant: 51,
        neutre_haut: 40, arrondi_angulaire: 74,
        gauche_droite: 60
      },
      sourcils: {
        reduire_elargir: 58, bas_haut: 39,
        arriere_avant: 64, arrondi_angulaire: 59
      },
      orbites: {
        reduire_elargir: 35, bas_haut: 37,
        arriere_avant: 55, plus_grande_petite: 98
      },
      oreilles: {
        reduire_elargir: 53, bas_haut: 87,
        arriere_avant: 64, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 32, bas_haut: 66,
        arriere_avant: 39, arrondi_angulaire: 69,
        gauche_droite: 45
      },
      joues: {
        reduire_elargir: 34, bas_haut: 31,
        arriere_avant: 74, arrondi_angulaire: 38
      },
      bouche: {
        reduire_elargir: 58, bas_haut: 87,
        arriere_avant: 15, arrondi_angulaire: 90,
        gauche_droite: 22
      },
      menton: {
        reduire_elargir: 35, bas_haut: 88,
        arriere_avant: 74, arrondi_angulaire: 15,
        gauche_droite: 34
      },
      machoire: {
        reduire_elargir: 13, bas_haut: 0,
        arriere_avant: 100, arrondi_angulaire: 0
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 34, bh: 70, na: 44, aa: 92, gd: 52 },
      couronne: { re: 65, bh: 20, aa: 32, nr: 0, gd: 50 },
      arriere_crane: { re: 92, bh: 54, aa: 46, ang: 81, gd: 54 },
      tempes: { re: 62, bh: 50, aa: 50, ang: 37 },
      front_sup: { re: 67, aa: 51, nh: 40, ang: 74, gd: 60 },
      front_inf: { re: 30, bh: 18, aa: 58, ang: 19 },
      sourcils: { re: 58, bh: 39, aa: 64, ang: 59 },
      sourcils_ctr: { re: 67, bh: 10, aa: 32, ang: 32, gd: 63 },
      sourcils_ext: { re: 45, bh: 13, aa: 40, ang: 38 },
      yeux: { re: 37, bh: 43, aa: 49, ang: 50 },
      orbites: { re: 35, bh: 10, aa: 50, gp: 98 },
      nez_adv: { re: 32, bh: 66, aa: 39, ang: 69, gd: 45 },
      arete_cotes: { re: 44, bh: 32, aa: 38, ang: 34 },
      arete_centrale: { re: 33, bh: 58, aa: 49, ang: 37, gd: 54 },
      arete_sup: { re: 43, bh: 37, aa: 51, ang: 41, gd: 65 },
      joues_adv: { re: 34, bh: 31, aa: 74, ang: 38 },
      bouche_adv: { re: 58, bh: 87, aa: 15, ang: 90, gd: 22 },
      bouche_ext: { re: 40, bh: 55, aa: 70, ang: 58 },
      menton_adv: { re: 35, bh: 88, aa: 74, ang: 15, gd: 34 },
      menton_sup: { re: 38, bh: 57, aa: 55, ang: 49, gd: 33 },
      machoire_adv: { re: 13, bh: 0, aa: 100, ang: 0 },
      maxillaire: { re: 8, bh: 35, aa: 57, ang: 57 },
      mandibule: { re: 46, bh: 56, aa: 38, ang: 26 },
    },
    ratios_cibles: { nez: 0.455, machoire: 0.817, joues: 0.881, bouche: 0.343, yeux: 0.068, sourcils: 0.129, eyebrowGap: 0.19, lipFullness: 0.101, noseFlare: 11.081, philtrum: 0.087, cheekProminence: 1.026, eyeHeightPos: 0.47 },
    notes: ''
  },
  {
    position: 2,
    preset_id: 175,
    // ── Labels morpho ──
    couleur_peau: "Métis",
    forme_visage: "Ovale",
    peau_detail: "Métis foncée",
    forme_detail: "Rond",
    machoire_label: "Moyenne",
    levres_label: "Pleines",
    nez_label: "Large",
    pommettes_label: "Hautes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 45, bas_haut: 68,
        neutre_avant: 100, arrondi_angulaire: 100,
        gauche_droite: 0
      },
      front_superieur: {
        reduire_elargir: 65, arriere_avant: 61,
        neutre_haut: 0, arrondi_angulaire: 51,
        gauche_droite: 100
      },
      sourcils: {
        reduire_elargir: 99, bas_haut: 48,
        arriere_avant: 44, arrondi_angulaire: 71
      },
      orbites: {
        reduire_elargir: 79, bas_haut: 25,
        arriere_avant: 70, plus_grande_petite: 0
      },
      oreilles: {
        reduire_elargir: 71, bas_haut: 72,
        arriere_avant: 8, plus_grande_petite: 36,
        gauche_droite: 100
      },
      nez: {
        reduire_elargir: 69, bas_haut: 0,
        arriere_avant: 31, arrondi_angulaire: 54,
        gauche_droite: 82
      },
      joues: {
        reduire_elargir: 46, bas_haut: 36,
        arriere_avant: 82, arrondi_angulaire: 0
      },
      bouche: {
        reduire_elargir: 17, bas_haut: 0,
        arriere_avant: 49, arrondi_angulaire: 13,
        gauche_droite: 77
      },
      menton: {
        reduire_elargir: 35, bas_haut: 38,
        arriere_avant: 77, arrondi_angulaire: 39,
        gauche_droite: 100
      },
      machoire: {
        reduire_elargir: 49, bas_haut: 6,
        arriere_avant: 83, arrondi_angulaire: 65
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 45, bh: 68, na: 100, aa: 100, gd: 0 },
      couronne: { re: 83, bh: 25, aa: 76, nr: 57, gd: 92 },
      arriere_crane: { re: 40, bh: 70, aa: 89, ang: 1, gd: 0 },
      tempes: { re: 28, bh: 68, aa: 55, ang: 2 },
      front_sup: { re: 65, aa: 61, nh: 0, ang: 51, gd: 100 },
      front_inf: { re: 59, bh: 98, aa: 46, ang: 63 },
      sourcils: { re: 99, bh: 48, aa: 44, ang: 71 },
      sourcils_ctr: { re: 71, bh: 20, aa: 56, ang: 93, gd: 62 },
      sourcils_ext: { re: 79, bh: 92, aa: 41, ang: 100 },
      yeux: { re: 30, bh: 53, aa: 57, ang: 78 },
      orbites: { re: 79, bh: 25, aa: 70, gp: 0 },
      nez_adv: { re: 69, bh: 0, aa: 31, ang: 54, gd: 82 },
      arete_cotes: { re: 59, bh: 13, aa: 25, ang: 95 },
      arete_centrale: { re: 22, bh: 3, aa: 7, ang: 43, gd: 89 },
      arete_sup: { re: 76, bh: 7, aa: 27, ang: 14, gd: 68 },
      joues_adv: { re: 46, bh: 36, aa: 82, ang: 0 },
      bouche_adv: { re: 17, bh: 0, aa: 49, ang: 13, gd: 77 },
      bouche_ext: { re: 66, bh: 38, aa: 39, ang: 35 },
      menton_adv: { re: 35, bh: 38, aa: 77, ang: 39, gd: 100 },
      menton_sup: { re: 27, bh: 26, aa: 32, ang: 33, gd: 65 },
      machoire_adv: { re: 49, bh: 6, aa: 83, ang: 65 },
      maxillaire: { re: 73, bh: 35, aa: 20, ang: 20 },
      mandibule: { re: 16, bh: 0, aa: 49, ang: 35 },
    },
    ratios_cibles: { nez: 0.485, machoire: 0.825, joues: 0.902, bouche: 0.378, yeux: 0.052, sourcils: 0.141, eyebrowGap: 0.179, lipFullness: 0.144, noseFlare: 10.546, philtrum: 0.075, cheekProminence: 1.063, eyeHeightPos: 0.435 },
    notes: 'visage asiatique avec nez gros nez (nez de cochon)'
  },
  {
    position: 3,
    preset_id: 170,
    // ── Labels morpho ──
    couleur_peau: "Claire-bronzée",
    forme_visage: "Rond",
    peau_detail: "Claire",
    forme_detail: "Rond",
    machoire_label: "Fine",
    levres_label: "Moyennes",
    nez_label: "Fin",
    pommettes_label: "Hautes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 38, bas_haut: 38,
        neutre_avant: 29, arrondi_angulaire: 60,
        gauche_droite: 13
      },
      front_superieur: {
        reduire_elargir: 40, arriere_avant: 45,
        neutre_haut: 20, arrondi_angulaire: 58,
        gauche_droite: 24
      },
      sourcils: {
        reduire_elargir: 33, bas_haut: 61,
        arriere_avant: 65, arrondi_angulaire: 38
      },
      orbites: {
        reduire_elargir: 12, bas_haut: 47,
        arriere_avant: 86, plus_grande_petite: 100
      },
      oreilles: {
        reduire_elargir: 24, bas_haut: 58,
        arriere_avant: 55, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 44, bas_haut: 26,
        arriere_avant: 49, arrondi_angulaire: 60,
        gauche_droite: 53
      },
      joues: {
        reduire_elargir: 43, bas_haut: 100,
        arriere_avant: 80, arrondi_angulaire: 36
      },
      bouche: {
        reduire_elargir: 45, bas_haut: 7,
        arriere_avant: 52, arrondi_angulaire: 100,
        gauche_droite: 45
      },
      menton: {
        reduire_elargir: 50, bas_haut: 33,
        arriere_avant: 42, arrondi_angulaire: 28,
        gauche_droite: 63
      },
      machoire: {
        reduire_elargir: 56, bas_haut: 29,
        arriere_avant: 84, arrondi_angulaire: 25
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 38, bh: 38, na: 29, aa: 60, gd: 13 },
      couronne: { re: 40, bh: 48, aa: 66, nr: 0, gd: 34 },
      arriere_crane: { re: 28, bh: 63, aa: 68, ang: 61, gd: 45 },
      tempes: { re: 26, bh: 51, aa: 75, ang: 77 },
      front_sup: { re: 40, aa: 45, nh: 20, ang: 58, gd: 24 },
      front_inf: { re: 29, bh: 40, aa: 62, ang: 59 },
      sourcils: { re: 33, bh: 61, aa: 65, ang: 38 },
      sourcils_ctr: { re: 43, bh: 46, aa: 37, ang: 56, gd: 40 },
      sourcils_ext: { re: 42, bh: 41, aa: 64, ang: 45 },
      yeux: { re: 19, bh: 47, aa: 86, ang: 50 },
      orbites: { re: 12, bh: 47, aa: 86, gp: 100 },
      nez_adv: { re: 44, bh: 26, aa: 49, ang: 60, gd: 53 },
      arete_cotes: { re: 47, bh: 32, aa: 31, ang: 56 },
      arete_centrale: { re: 12, bh: 28, aa: 30, ang: 100, gd: 37 },
      arete_sup: { re: 58, bh: 34, aa: 33, ang: 21, gd: 30 },
      joues_adv: { re: 43, bh: 100, aa: 80, ang: 36 },
      bouche_adv: { re: 45, bh: 7, aa: 52, ang: 100, gd: 45 },
      bouche_ext: { re: 47, bh: 49, aa: 63, ang: 37 },
      menton_adv: { re: 50, bh: 33, aa: 42, ang: 28, gd: 63 },
      menton_sup: { re: 59, bh: 77, aa: 75, ang: 50, gd: 33 },
      machoire_adv: { re: 56, bh: 29, aa: 84, ang: 25 },
      maxillaire: { re: 26, bh: 49, aa: 78, ang: 48 },
      mandibule: { re: 29, bh: 36, aa: 42, ang: 60 },
    },
    ratios_cibles: { nez: 0.464, machoire: 0.79, joues: 0.889, bouche: 0.351, yeux: 0.061, sourcils: 0.126, eyebrowGap: 0.174, lipFullness: 0.101, noseFlare: 9.427, philtrum: 0.092, cheekProminence: 1.051, eyeHeightPos: 0.439 },
    notes: 'visage asiatique'
  },
  {
    position: 4,
    preset_id: 17,
    // ── Labels morpho ──
    couleur_peau: "Claire-bronzée",
    forme_visage: "Ovale",
    peau_detail: "Métis claire",
    forme_detail: "Long",
    machoire_label: "Fine",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Hautes",
    front_label: "Étroit",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 53, bas_haut: 37,
        neutre_avant: 42, arrondi_angulaire: 100,
        gauche_droite: 69
      },
      front_superieur: {
        reduire_elargir: 41, arriere_avant: 47,
        neutre_haut: 37, arrondi_angulaire: 71,
        gauche_droite: 55
      },
      sourcils: {
        reduire_elargir: 65, bas_haut: 35,
        arriere_avant: 50, arrondi_angulaire: 27
      },
      orbites: {
        reduire_elargir: 34, bas_haut: 47,
        arriere_avant: 55, plus_grande_petite: 17
      },
      oreilles: {
        reduire_elargir: 25, bas_haut: 41,
        arriere_avant: 27, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 29, bas_haut: 75,
        arriere_avant: 26, arrondi_angulaire: 32,
        gauche_droite: 48
      },
      joues: {
        reduire_elargir: 45, bas_haut: 42,
        arriere_avant: 61, arrondi_angulaire: 49
      },
      bouche: {
        reduire_elargir: 74, bas_haut: 56,
        arriere_avant: 42, arrondi_angulaire: 73,
        gauche_droite: 34
      },
      menton: {
        reduire_elargir: 30, bas_haut: 67,
        arriere_avant: 40, arrondi_angulaire: 23,
        gauche_droite: 41
      },
      machoire: {
        reduire_elargir: 19, bas_haut: 21,
        arriere_avant: 97, arrondi_angulaire: 27
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 53, bh: 37, na: 42, aa: 100, gd: 69 },
      couronne: { re: 31, bh: 41, aa: 49, nr: 0, gd: 42 },
      arriere_crane: { re: 40, bh: 41, aa: 68, ang: 50, gd: 39 },
      tempes: { re: 33, bh: 51, aa: 59, ang: 68 },
      front_sup: { re: 41, aa: 47, nh: 37, ang: 71, gd: 55 },
      front_inf: { re: 58, bh: 35, aa: 96, ang: 33 },
      sourcils: { re: 65, bh: 35, aa: 50, ang: 27 },
      sourcils_ctr: { re: 44, bh: 49, aa: 40, ang: 80, gd: 56 },
      sourcils_ext: { re: 69, bh: 59, aa: 44, ang: 50 },
      yeux: { re: 49, bh: 47, aa: 63, ang: 50 },
      orbites: { re: 34, bh: 47, aa: 55, gp: 17 },
      nez_adv: { re: 29, bh: 75, aa: 26, ang: 32, gd: 48 },
      arete_cotes: { re: 51, bh: 65, aa: 37, ang: 67 },
      arete_centrale: { re: 38, bh: 52, aa: 18, ang: 76, gd: 52 },
      arete_sup: { re: 27, bh: 59, aa: 37, ang: 49, gd: 59 },
      joues_adv: { re: 45, bh: 42, aa: 61, ang: 49 },
      bouche_adv: { re: 74, bh: 56, aa: 42, ang: 73, gd: 34 },
      bouche_ext: { re: 36, bh: 67, aa: 44, ang: 17 },
      menton_adv: { re: 30, bh: 67, aa: 40, ang: 23, gd: 41 },
      menton_sup: { re: 36, bh: 43, aa: 50, ang: 72, gd: 49 },
      machoire_adv: { re: 19, bh: 21, aa: 97, ang: 27 },
      maxillaire: { re: 20, bh: 45, aa: 53, ang: 59 },
      mandibule: { re: 35, bh: 50, aa: 50, ang: 72 },
    },
    ratios_cibles: { nez: 0.455, machoire: 0.797, joues: 0.896, bouche: 0.348, yeux: 0.061, sourcils: 0.138, eyebrowGap: 0.185, lipFullness: 0.112, noseFlare: 10.434, philtrum: 0.092, cheekProminence: 1.072, eyeHeightPos: 0.449 },
    notes: 'joue creuse'
  },
  {
    position: 5,
    preset_id: 260,
    // ── Labels morpho ──
    couleur_peau: "Métis",
    forme_visage: "Ovale",
    peau_detail: "Claire-bronzée",
    forme_detail: "Ovale",
    machoire_label: "Moyenne",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Saillantes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 21, bas_haut: 31,
        neutre_avant: 51, arrondi_angulaire: 68,
        gauche_droite: 25
      },
      front_superieur: {
        reduire_elargir: 90, arriere_avant: 48,
        neutre_haut: 39, arrondi_angulaire: 72,
        gauche_droite: 63
      },
      sourcils: {
        reduire_elargir: 46, bas_haut: 36,
        arriere_avant: 65, arrondi_angulaire: 24
      },
      orbites: {
        reduire_elargir: 32, bas_haut: 45,
        arriere_avant: 61, plus_grande_petite: 77
      },
      oreilles: {
        reduire_elargir: 94, bas_haut: 47,
        arriere_avant: 90, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 38, bas_haut: 19,
        arriere_avant: 63, arrondi_angulaire: 60,
        gauche_droite: 65
      },
      joues: {
        reduire_elargir: 44, bas_haut: 56,
        arriere_avant: 56, arrondi_angulaire: 96
      },
      bouche: {
        reduire_elargir: 51, bas_haut: 63,
        arriere_avant: 36, arrondi_angulaire: 72,
        gauche_droite: 1
      },
      menton: {
        reduire_elargir: 52, bas_haut: 72,
        arriere_avant: 41, arrondi_angulaire: 18,
        gauche_droite: 2
      },
      machoire: {
        reduire_elargir: 12, bas_haut: 24,
        arriere_avant: 100, arrondi_angulaire: 0
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 21, bh: 31, na: 51, aa: 68, gd: 25 },
      couronne: { re: 100, bh: 52, aa: 46, nr: 0, gd: 55 },
      arriere_crane: { re: 72, bh: 44, aa: 79, ang: 46, gd: 43 },
      tempes: { re: 74, bh: 36, aa: 66, ang: 19 },
      front_sup: { re: 90, aa: 48, nh: 39, ang: 72, gd: 63 },
      front_inf: { re: 50, bh: 34, aa: 40, ang: 55 },
      sourcils: { re: 46, bh: 36, aa: 65, ang: 24 },
      sourcils_ctr: { re: 67, bh: 28, aa: 41, ang: 35, gd: 63 },
      sourcils_ext: { re: 33, bh: 40, aa: 26, ang: 56 },
      yeux: { re: 32, bh: 56, aa: 65, ang: 50 },
      orbites: { re: 32, bh: 45, aa: 61, gp: 77 },
      nez_adv: { re: 38, bh: 19, aa: 63, ang: 60, gd: 65 },
      arete_cotes: { re: 35, bh: 56, aa: 30, ang: 70 },
      arete_centrale: { re: 29, bh: 95, aa: 81, ang: 50, gd: 60 },
      arete_sup: { re: 39, bh: 41, aa: 59, ang: 78, gd: 61 },
      joues_adv: { re: 44, bh: 56, aa: 56, ang: 96 },
      bouche_adv: { re: 51, bh: 63, aa: 36, ang: 72, gd: 1 },
      bouche_ext: { re: 79, bh: 24, aa: 42, ang: 49 },
      menton_adv: { re: 52, bh: 72, aa: 41, ang: 18, gd: 2 },
      menton_sup: { re: 55, bh: 29, aa: 50, ang: 67, gd: 30 },
      machoire_adv: { re: 12, bh: 24, aa: 100, ang: 0 },
      maxillaire: { re: 19, bh: 33, aa: 58, ang: 41 },
      mandibule: { re: 31, bh: 40, aa: 41, ang: 75 },
    },
    ratios_cibles: { nez: 0.483, machoire: 0.819, joues: 0.899, bouche: 0.388, yeux: 0.071, sourcils: 0.126, eyebrowGap: 0.175, lipFullness: 0.115, noseFlare: 10.137, philtrum: 0.078, cheekProminence: 1.043, eyeHeightPos: 0.455 },
    notes: ''
  },
  {
    position: 6,
    preset_id: 116,
    // ── Labels morpho ──
    couleur_peau: "Foncée",
    forme_visage: "Ovale",
    peau_detail: "Foncée",
    forme_detail: "Ovale plein",
    machoire_label: "Moyenne",
    levres_label: "Pleines",
    nez_label: "Large",
    pommettes_label: "Hautes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 13, bas_haut: 47,
        neutre_avant: 100, arrondi_angulaire: 59,
        gauche_droite: 97
      },
      front_superieur: {
        reduire_elargir: 51, arriere_avant: 26,
        neutre_haut: 4, arrondi_angulaire: 74,
        gauche_droite: 62
      },
      sourcils: {
        reduire_elargir: 52, bas_haut: 81,
        arriere_avant: 30, arrondi_angulaire: 79
      },
      orbites: {
        reduire_elargir: 52, bas_haut: 41,
        arriere_avant: 57, plus_grande_petite: 13
      },
      oreilles: {
        reduire_elargir: 33, bas_haut: 71,
        arriere_avant: 50, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 85, bas_haut: 77,
        arriere_avant: 50, arrondi_angulaire: 50,
        gauche_droite: 67
      },
      joues: {
        reduire_elargir: 37, bas_haut: 54,
        arriere_avant: 50, arrondi_angulaire: 88
      },
      bouche: {
        reduire_elargir: 0, bas_haut: 13,
        arriere_avant: 100, arrondi_angulaire: 42,
        gauche_droite: 55
      },
      menton: {
        reduire_elargir: 41, bas_haut: 54,
        arriere_avant: 43, arrondi_angulaire: 88,
        gauche_droite: 21
      },
      machoire: {
        reduire_elargir: 29, bas_haut: 66,
        arriere_avant: 71, arrondi_angulaire: 100
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 13, bh: 47, na: 100, aa: 59, gd: 97 },
      couronne: { re: 7, bh: 0, aa: 92, nr: 0, gd: 45 },
      arriere_crane: { re: 36, bh: 74, aa: 49, ang: 28, gd: 23 },
      tempes: { re: 16, bh: 50, aa: 78, ang: 38 },
      front_sup: { re: 51, aa: 26, nh: 4, ang: 74, gd: 62 },
      front_inf: { re: 27, bh: 26, aa: 64, ang: 82 },
      sourcils: { re: 52, bh: 81, aa: 30, ang: 79 },
      sourcils_ctr: { re: 57, bh: 38, aa: 37, ang: 87, gd: 61 },
      sourcils_ext: { re: 65, bh: 61, aa: 43, ang: 25 },
      yeux: { re: 75, bh: 56, aa: 69, ang: 50 },
      orbites: { re: 52, bh: 41, aa: 57, gp: 13 },
      nez_adv: { re: 85, bh: 77, aa: 50, ang: 50, gd: 67 },
      arete_cotes: { re: 52, bh: 66, aa: 52, ang: 67 },
      arete_centrale: { re: 47, bh: 37, aa: 68, ang: 46, gd: 64 },
      arete_sup: { re: 32, bh: 33, aa: 24, ang: 0, gd: 50 },
      joues_adv: { re: 37, bh: 54, aa: 50, ang: 88 },
      bouche_adv: { re: 0, bh: 13, aa: 100, ang: 42, gd: 55 },
      bouche_ext: { re: 75, bh: 55, aa: 50, ang: 26 },
      menton_adv: { re: 41, bh: 54, aa: 43, ang: 88, gd: 21 },
      menton_sup: { re: 13, bh: 48, aa: 69, ang: 51, gd: 40 },
      machoire_adv: { re: 29, bh: 66, aa: 71, ang: 100 },
      maxillaire: { re: 76, bh: 16, aa: 57, ang: 45 },
      mandibule: { re: 31, bh: 30, aa: 74, ang: 23 },
    },
    ratios_cibles: { nez: 0.492, machoire: 0.798, joues: 0.909, bouche: 0.382, yeux: 0.059, sourcils: 0.151, eyebrowGap: 0.194, lipFullness: 0.143, noseFlare: 11.566, philtrum: 0.081, cheekProminence: 1.053, eyeHeightPos: 0.453 },
    notes: 'enorme narrine'
  },
  {
    position: 7,
    preset_id: 249,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Ovale",
    peau_detail: "Claire",
    forme_detail: "Ovale",
    machoire_label: "Fine",
    levres_label: "Pleines",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 47, bas_haut: 13,
        neutre_avant: 69, arrondi_angulaire: 48,
        gauche_droite: 100
      },
      front_superieur: {
        reduire_elargir: 68, arriere_avant: 0,
        neutre_haut: 83, arrondi_angulaire: 14,
        gauche_droite: 27
      },
      sourcils: {
        reduire_elargir: 30, bas_haut: 25,
        arriere_avant: 49, arrondi_angulaire: 30
      },
      orbites: {
        reduire_elargir: 26, bas_haut: 34,
        arriere_avant: 52, plus_grande_petite: 76
      },
      oreilles: {
        reduire_elargir: 44, bas_haut: 46,
        arriere_avant: 58, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 41, bas_haut: 36,
        arriere_avant: 55, arrondi_angulaire: 71,
        gauche_droite: 69
      },
      joues: {
        reduire_elargir: 43, bas_haut: 34,
        arriere_avant: 73, arrondi_angulaire: 43
      },
      bouche: {
        reduire_elargir: 83, bas_haut: 26,
        arriere_avant: 64, arrondi_angulaire: 92,
        gauche_droite: 51
      },
      menton: {
        reduire_elargir: 54, bas_haut: 12,
        arriere_avant: 95, arrondi_angulaire: 93,
        gauche_droite: 94
      },
      machoire: {
        reduire_elargir: 43, bas_haut: 22,
        arriere_avant: 100, arrondi_angulaire: 50
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 47, bh: 13, na: 69, aa: 48, gd: 100 },
      couronne: { re: 93, bh: 9, aa: 34, nr: 0, gd: 48 },
      arriere_crane: { re: 46, bh: 28, aa: 72, ang: 61, gd: 54 },
      tempes: { re: 0, bh: 0, aa: 50, ang: 13 },
      front_sup: { re: 68, aa: 0, nh: 83, ang: 14, gd: 27 },
      front_inf: { re: 35, bh: 76, aa: 47, ang: 63 },
      sourcils: { re: 30, bh: 25, aa: 49, ang: 30 },
      sourcils_ctr: { re: 49, bh: 40, aa: 13, ang: 28, gd: 59 },
      sourcils_ext: { re: 59, bh: 29, aa: 21, ang: 52 },
      yeux: { re: 31, bh: 37, aa: 52, ang: 50 },
      orbites: { re: 26, bh: 34, aa: 52, gp: 76 },
      nez_adv: { re: 41, bh: 36, aa: 55, ang: 71, gd: 69 },
      arete_cotes: { re: 30, bh: 26, aa: 57, ang: 59 },
      arete_centrale: { re: 34, bh: 67, aa: 55, ang: 57, gd: 56 },
      arete_sup: { re: 30, bh: 23, aa: 48, ang: 23, gd: 57 },
      joues_adv: { re: 43, bh: 34, aa: 73, ang: 43 },
      bouche_adv: { re: 83, bh: 26, aa: 64, ang: 92, gd: 51 },
      bouche_ext: { re: 41, bh: 58, aa: 68, ang: 50 },
      menton_adv: { re: 54, bh: 12, aa: 95, ang: 93, gd: 94 },
      menton_sup: { re: 40, bh: 73, aa: 50, ang: 59, gd: 62 },
      machoire_adv: { re: 43, bh: 22, aa: 100, ang: 50 },
      maxillaire: { re: 79, bh: 57, aa: 74, ang: 56 },
      mandibule: { re: 45, bh: 25, aa: 92, ang: 97 },
    },
    ratios_cibles: { nez: 0.488, machoire: 0.815, joues: 0.906, bouche: 0.419, yeux: 0.057, sourcils: 0.139, eyebrowGap: 0.185, lipFullness: 0.126, noseFlare: 11.319, philtrum: 0.071, cheekProminence: 1.075, eyeHeightPos: 0.438 },
    notes: ''
  },
  {
    position: 8,
    preset_id: 43,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Ovale",
    peau_detail: "Claire",
    forme_detail: "Ovale",
    machoire_label: "Moyenne",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 0, bas_haut: 32,
        neutre_avant: 100, arrondi_angulaire: 22,
        gauche_droite: 34
      },
      front_superieur: {
        reduire_elargir: 47, arriere_avant: 51,
        neutre_haut: 39, arrondi_angulaire: 25,
        gauche_droite: 51
      },
      sourcils: {
        reduire_elargir: 79, bas_haut: 0,
        arriere_avant: 50, arrondi_angulaire: 7
      },
      orbites: {
        reduire_elargir: 34, bas_haut: 43,
        arriere_avant: 33, plus_grande_petite: 95
      },
      oreilles: {
        reduire_elargir: 16, bas_haut: 17,
        arriere_avant: 73, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 38, bas_haut: 64,
        arriere_avant: 36, arrondi_angulaire: 43,
        gauche_droite: 46
      },
      joues: {
        reduire_elargir: 32, bas_haut: 53,
        arriere_avant: 60, arrondi_angulaire: 60
      },
      bouche: {
        reduire_elargir: 45, bas_haut: 70,
        arriere_avant: 41, arrondi_angulaire: 86,
        gauche_droite: 30
      },
      menton: {
        reduire_elargir: 36, bas_haut: 69,
        arriere_avant: 50, arrondi_angulaire: 69,
        gauche_droite: 36
      },
      machoire: {
        reduire_elargir: 0, bas_haut: 10,
        arriere_avant: 94, arrondi_angulaire: 0
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 0, bh: 32, na: 100, aa: 22, gd: 34 },
      couronne: { re: 93, bh: 48, aa: 0, nr: 0, gd: 66 },
      arriere_crane: { re: 48, bh: 27, aa: 76, ang: 45, gd: 56 },
      tempes: { re: 54, bh: 36, aa: 41, ang: 18 },
      front_sup: { re: 47, aa: 51, nh: 39, ang: 25, gd: 51 },
      front_inf: { re: 70, bh: 50, aa: 26, ang: 51 },
      sourcils: { re: 79, bh: 0, aa: 50, ang: 7 },
      sourcils_ctr: { re: 26, bh: 39, aa: 43, ang: 0, gd: 49 },
      sourcils_ext: { re: 40, bh: 38, aa: 31, ang: 49 },
      yeux: { re: 36, bh: 51, aa: 40, ang: 50 },
      orbites: { re: 34, bh: 43, aa: 33, gp: 95 },
      nez_adv: { re: 38, bh: 64, aa: 36, ang: 43, gd: 46 },
      arete_cotes: { re: 64, bh: 84, aa: 63, ang: 42 },
      arete_centrale: { re: 36, bh: 66, aa: 27, ang: 36, gd: 52 },
      arete_sup: { re: 30, bh: 39, aa: 51, ang: 53, gd: 60 },
      joues_adv: { re: 32, bh: 53, aa: 60, ang: 50 },
      bouche_adv: { re: 45, bh: 70, aa: 41, ang: 86, gd: 30 },
      bouche_ext: { re: 28, bh: 62, aa: 38, ang: 48 },
      menton_adv: { re: 36, bh: 69, aa: 50, ang: 69, gd: 36 },
      menton_sup: { re: 36, bh: 50, aa: 42, ang: 67, gd: 63 },
      machoire_adv: { re: 0, bh: 10, aa: 94, ang: 0 },
      maxillaire: { re: 10, bh: 39, aa: 63, ang: 77 },
      mandibule: { re: 35, bh: 62, aa: 39, ang: 97 },
    },
    ratios_cibles: { nez: 0.472, machoire: 0.793, joues: 0.887, bouche: 0.349, yeux: 0.053, sourcils: 0.142, eyebrowGap: 0.177, lipFullness: 0.093, noseFlare: 10.876, philtrum: 0.096, cheekProminence: 1.048, eyeHeightPos: 0.438 },
    notes: ''
  },
  {
    position: 9,
    preset_id: 52,
    // ── Labels morpho ──
    couleur_peau: "Claire-bronzée",
    forme_visage: "Ovale",
    peau_detail: "Claire",
    forme_detail: "Carré large",
    machoire_label: "Large",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 0, bas_haut: 27,
        neutre_avant: 59, arrondi_angulaire: 0,
        gauche_droite: 74
      },
      front_superieur: {
        reduire_elargir: 61, arriere_avant: 28,
        neutre_haut: 64, arrondi_angulaire: 50,
        gauche_droite: 29
      },
      sourcils: {
        reduire_elargir: 48, bas_haut: 52,
        arriere_avant: 54, arrondi_angulaire: 19
      },
      orbites: {
        reduire_elargir: 23, bas_haut: 56,
        arriere_avant: 39, plus_grande_petite: 17
      },
      oreilles: {
        reduire_elargir: 34, bas_haut: 22,
        arriere_avant: 82, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 18, bas_haut: 86,
        arriere_avant: 29, arrondi_angulaire: 22,
        gauche_droite: 41
      },
      joues: {
        reduire_elargir: 26, bas_haut: 44,
        arriere_avant: 74, arrondi_angulaire: 59
      },
      bouche: {
        reduire_elargir: 73, bas_haut: 47,
        arriere_avant: 31, arrondi_angulaire: 83,
        gauche_droite: 20
      },
      menton: {
        reduire_elargir: 33, bas_haut: 60,
        arriere_avant: 43, arrondi_angulaire: 73,
        gauche_droite: 69
      },
      machoire: {
        reduire_elargir: 12, bas_haut: 10,
        arriere_avant: 100, arrondi_angulaire: 9
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 0, bh: 27, na: 59, aa: 0, gd: 74 },
      couronne: { re: 61, bh: 36, aa: 10, nr: 0, gd: 62 },
      arriere_crane: { re: 56, bh: 27, aa: 66, ang: 69, gd: 60 },
      tempes: { re: 49, bh: 33, aa: 44, ang: 60 },
      front_sup: { re: 61, aa: 28, nh: 64, ang: 50, gd: 29 },
      front_inf: { re: 28, bh: 40, aa: 35, ang: 75 },
      sourcils: { re: 48, bh: 52, aa: 54, ang: 19 },
      sourcils_ctr: { re: 57, bh: 40, aa: 27, ang: 39, gd: 46 },
      sourcils_ext: { re: 47, bh: 29, aa: 31, ang: 49 },
      yeux: { re: 31, bh: 66, aa: 63, ang: 50 },
      orbites: { re: 23, bh: 56, aa: 39, gp: 17 },
      nez_adv: { re: 18, bh: 86, aa: 29, ang: 22, gd: 41 },
      arete_cotes: { re: 17, bh: 74, aa: 45, ang: 51 },
      arete_centrale: { re: 44, bh: 69, aa: 49, ang: 40, gd: 44 },
      arete_sup: { re: 18, bh: 81, aa: 40, ang: 50, gd: 36 },
      joues_adv: { re: 26, bh: 44, aa: 74, ang: 59 },
      bouche_adv: { re: 73, bh: 47, aa: 31, ang: 83, gd: 20 },
      bouche_ext: { re: 21, bh: 78, aa: 50, ang: 43 },
      menton_adv: { re: 33, bh: 60, aa: 43, ang: 73, gd: 69 },
      menton_sup: { re: 31, bh: 56, aa: 49, ang: 71, gd: 43 },
      machoire_adv: { re: 12, bh: 10, aa: 100, ang: 9 },
      maxillaire: { re: 19, bh: 50, aa: 58, ang: 48 },
      mandibule: { re: 30, bh: 52, aa: 50, ang: 75 },
    },
    ratios_cibles: { nez: 0.459, machoire: 0.783, joues: 0.894, bouche: 0.376, yeux: 0.059, sourcils: 0.132, eyebrowGap: 0.184, lipFullness: 0.105, noseFlare: 10.254, philtrum: 0.1, cheekProminence: 1.056, eyeHeightPos: 0.435 },
    notes: ''
  },
  {
    position: 10,
    preset_id: 236,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Ovale",
    peau_detail: "Claire",
    forme_detail: "Carré large",
    machoire_label: "Large",
    levres_label: "Fines",
    nez_label: "Fin",
    pommettes_label: "Moyennes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 1, bas_haut: 32,
        neutre_avant: 14, arrondi_angulaire: 94,
        gauche_droite: 89
      },
      front_superieur: {
        reduire_elargir: 99, arriere_avant: 53,
        neutre_haut: 0, arrondi_angulaire: 75,
        gauche_droite: 86
      },
      sourcils: {
        reduire_elargir: 76, bas_haut: 44,
        arriere_avant: 44, arrondi_angulaire: 34
      },
      orbites: {
        reduire_elargir: 43, bas_haut: 48,
        arriere_avant: 59, plus_grande_petite: 85
      },
      oreilles: {
        reduire_elargir: 23, bas_haut: 48,
        arriere_avant: 27, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 30, bas_haut: 25,
        arriere_avant: 45, arrondi_angulaire: 55,
        gauche_droite: 44
      },
      joues: {
        reduire_elargir: 14, bas_haut: 68,
        arriere_avant: 78, arrondi_angulaire: 63
      },
      bouche: {
        reduire_elargir: 67, bas_haut: 72,
        arriere_avant: 13, arrondi_angulaire: 100,
        gauche_droite: 27
      },
      menton: {
        reduire_elargir: 40, bas_haut: 65,
        arriere_avant: 28, arrondi_angulaire: 0,
        gauche_droite: 29
      },
      machoire: {
        reduire_elargir: 10, bas_haut: 47,
        arriere_avant: 63, arrondi_angulaire: 0
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 1, bh: 32, na: 14, aa: 94, gd: 89 },
      couronne: { re: 63, bh: 38, aa: 55, nr: 0, gd: 42 },
      arriere_crane: { re: 95, bh: 61, aa: 81, ang: 70, gd: 28 },
      tempes: { re: 7, bh: 35, aa: 74, ang: 53 },
      front_sup: { re: 99, aa: 53, nh: 0, ang: 75, gd: 86 },
      front_inf: { re: 40, bh: 31, aa: 73, ang: 23 },
      sourcils: { re: 76, bh: 44, aa: 44, ang: 34 },
      sourcils_ctr: { re: 43, bh: 13, aa: 40, ang: 67, gd: 49 },
      sourcils_ext: { re: 37, bh: 46, aa: 78, ang: 4 },
      yeux: { re: 60, bh: 45, aa: 71, ang: 50 },
      orbites: { re: 43, bh: 48, aa: 59, gp: 85 },
      nez_adv: { re: 30, bh: 25, aa: 45, ang: 55, gd: 44 },
      arete_cotes: { re: 36, bh: 28, aa: 48, ang: 30 },
      arete_centrale: { re: 68, bh: 23, aa: 77, ang: 33, gd: 55 },
      arete_sup: { re: 25, bh: 7, aa: 79, ang: 36, gd: 53 },
      joues_adv: { re: 14, bh: 68, aa: 78, ang: 63 },
      bouche_adv: { re: 67, bh: 72, aa: 13, ang: 100, gd: 27 },
      bouche_ext: { re: 20, bh: 32, aa: 68, ang: 50 },
      menton_adv: { re: 40, bh: 65, aa: 28, ang: 0, gd: 29 },
      menton_sup: { re: 2, bh: 83, aa: 25, ang: 33, gd: 64 },
      machoire_adv: { re: 10, bh: 47, aa: 63, ang: 0 },
      maxillaire: { re: 6, bh: 74, aa: 52, ang: 44 },
      mandibule: { re: 67, bh: 60, aa: 8, ang: 100 },
    },
    ratios_cibles: { nez: 0.457, machoire: 0.793, joues: 0.906, bouche: 0.346, yeux: 0.056, sourcils: 0.151, eyebrowGap: 0.211, lipFullness: 0.109, noseFlare: 10.522, philtrum: 0.089, cheekProminence: 1.035, eyeHeightPos: 0.456 },
    notes: 'visage avec une jawline remarquable'
  },
  {
    position: 11,
    preset_id: 93,
    // ── Labels morpho ──
    couleur_peau: "Très foncée",
    forme_visage: "Long",
    peau_detail: "Très foncée",
    forme_detail: "Long",
    machoire_label: "Fine",
    levres_label: "Pleines",
    nez_label: "Large",
    pommettes_label: "Saillantes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 5, bas_haut: 19,
        neutre_avant: 100, arrondi_angulaire: 100,
        gauche_droite: 70
      },
      front_superieur: {
        reduire_elargir: 39, arriere_avant: 57,
        neutre_haut: 13, arrondi_angulaire: 20,
        gauche_droite: 34
      },
      sourcils: {
        reduire_elargir: 27, bas_haut: 32,
        arriere_avant: 47, arrondi_angulaire: 7
      },
      orbites: {
        reduire_elargir: 40, bas_haut: 27,
        arriere_avant: 54, plus_grande_petite: 74
      },
      oreilles: {
        reduire_elargir: 59, bas_haut: 80,
        arriere_avant: 70, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 63, bas_haut: 53,
        arriere_avant: 28, arrondi_angulaire: 35,
        gauche_droite: 52
      },
      joues: {
        reduire_elargir: 32, bas_haut: 63,
        arriere_avant: 40, arrondi_angulaire: 86
      },
      bouche: {
        reduire_elargir: 100, bas_haut: 43,
        arriere_avant: 57, arrondi_angulaire: 55,
        gauche_droite: 49
      },
      menton: {
        reduire_elargir: 47, bas_haut: 35,
        arriere_avant: 33, arrondi_angulaire: 44,
        gauche_droite: 60
      },
      machoire: {
        reduire_elargir: 47, bas_haut: 68,
        arriere_avant: 56, arrondi_angulaire: 58
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 5, bh: 19, na: 100, aa: 100, gd: 70 },
      couronne: { re: 68, bh: 16, aa: 100, nr: 0, gd: 51 },
      arriere_crane: { re: 36, bh: 65, aa: 86, ang: 8, gd: 57 },
      tempes: { re: 38, bh: 64, aa: 92, ang: 69 },
      front_sup: { re: 39, aa: 57, nh: 13, ang: 20, gd: 34 },
      front_inf: { re: 32, bh: 36, aa: 93, ang: 22 },
      sourcils: { re: 27, bh: 32, aa: 47, ang: 7 },
      sourcils_ctr: { re: 40, bh: 23, aa: 38, ang: 27, gd: 42 },
      sourcils_ext: { re: 31, bh: 38, aa: 86, ang: 37 },
      yeux: { re: 56, bh: 0, aa: 58, ang: 50 },
      orbites: { re: 40, bh: 27, aa: 54, gp: 74 },
      nez_adv: { re: 63, bh: 53, aa: 28, ang: 35, gd: 52 },
      arete_cotes: { re: 75, bh: 91, aa: 20, ang: 83 },
      arete_centrale: { re: 20, bh: 34, aa: 4, ang: 60, gd: 35 },
      arete_sup: { re: 0, bh: 8, aa: 49, ang: 70, gd: 47 },
      joues_adv: { re: 32, bh: 63, aa: 40, ang: 86 },
      bouche_adv: { re: 100, bh: 43, aa: 57, ang: 55, gd: 49 },
      bouche_ext: { re: 34, bh: 47, aa: 37, ang: 16 },
      menton_adv: { re: 47, bh: 35, aa: 33, ang: 44, gd: 60 },
      menton_sup: { re: 38, bh: 13, aa: 80, ang: 98, gd: 58 },
      machoire_adv: { re: 47, bh: 68, aa: 56, ang: 58 },
      maxillaire: { re: 43, bh: 58, aa: 52, ang: 46 },
      mandibule: { re: 40, bh: 21, aa: 33, ang: 17 },
    },
    ratios_cibles: { nez: 0.488, machoire: 0.808, joues: 0.905, bouche: 0.437, yeux: 0.054, sourcils: 0.15, eyebrowGap: 0.194, lipFullness: 0.165, noseFlare: 12.157, philtrum: 0.068, cheekProminence: 1.044, eyeHeightPos: 0.474 },
    notes: ''
  },
  {
    position: 12,
    preset_id: 134,
    // ── Labels morpho ──
    couleur_peau: "Claire-bronzée",
    forme_visage: "Rond",
    peau_detail: "Claire",
    forme_detail: "Rond",
    machoire_label: "Fine",
    levres_label: "Moyennes",
    nez_label: "Fin",
    pommettes_label: "Moyennes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 68, bas_haut: 37,
        neutre_avant: 37, arrondi_angulaire: 85,
        gauche_droite: 51
      },
      front_superieur: {
        reduire_elargir: 47, arriere_avant: 49,
        neutre_haut: 2, arrondi_angulaire: 89,
        gauche_droite: 24
      },
      sourcils: {
        reduire_elargir: 41, bas_haut: 57,
        arriere_avant: 60, arrondi_angulaire: 60
      },
      orbites: {
        reduire_elargir: 39, bas_haut: 51,
        arriere_avant: 77, plus_grande_petite: 100
      },
      oreilles: {
        reduire_elargir: 81, bas_haut: 79,
        arriere_avant: 64, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 37, bas_haut: 52,
        arriere_avant: 27, arrondi_angulaire: 50,
        gauche_droite: 26
      },
      joues: {
        reduire_elargir: 72, bas_haut: 93,
        arriere_avant: 97, arrondi_angulaire: 100
      },
      bouche: {
        reduire_elargir: 73, bas_haut: 71,
        arriere_avant: 48, arrondi_angulaire: 100,
        gauche_droite: 20
      },
      menton: {
        reduire_elargir: 30, bas_haut: 47,
        arriere_avant: 46, arrondi_angulaire: 77,
        gauche_droite: 2
      },
      machoire: {
        reduire_elargir: 51, bas_haut: 15,
        arriere_avant: 90, arrondi_angulaire: 39
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 68, bh: 37, na: 37, aa: 85, gd: 51 },
      couronne: { re: 100, bh: 91, aa: 29, nr: 0, gd: 75 },
      arriere_crane: { re: 23, bh: 1, aa: 89, ang: 78, gd: 65 },
      tempes: { re: 61, bh: 100, aa: 61, ang: 99 },
      front_sup: { re: 47, aa: 49, nh: 2, ang: 89, gd: 24 },
      front_inf: { re: 26, bh: 58, aa: 100, ang: 55 },
      sourcils: { re: 41, bh: 57, aa: 60, ang: 60 },
      sourcils_ctr: { re: 55, bh: 0, aa: 29, ang: 20, gd: 45 },
      sourcils_ext: { re: 26, bh: 44, aa: 40, ang: 77 },
      yeux: { re: 39, bh: 51, aa: 77, ang: 100 },
      orbites: { re: 40, bh: 27, aa: 54, gp: 74 },
      nez_adv: { re: 37, bh: 52, aa: 27, ang: 50, gd: 26 },
      arete_cotes: { re: 15, bh: 81, aa: 8, ang: 63 },
      arete_centrale: { re: 19, bh: 50, aa: 6, ang: 100, gd: 37 },
      arete_sup: { re: 59, bh: 26, aa: 36, ang: 0, gd: 45 },
      joues_adv: { re: 72, bh: 93, aa: 97, ang: 100 },
      bouche_adv: { re: 73, bh: 71, aa: 48, ang: 100, gd: 20 },
      bouche_ext: { re: 39, bh: 30, aa: 44, ang: 34 },
      menton_adv: { re: 30, bh: 47, aa: 46, ang: 77, gd: 2 },
      menton_sup: { re: 44, bh: 11, aa: 32, ang: 68, gd: 60 },
      machoire_adv: { re: 51, bh: 15, aa: 90, ang: 39 },
      maxillaire: { re: 34, bh: 31, aa: 76, ang: 39 },
      mandibule: { re: 3, bh: 31, aa: 62, ang: 59 },
    },
    ratios_cibles: { nez: 0.488, machoire: 0.808, joues: 0.888, bouche: 0.34, yeux: 0.06, sourcils: 0.123, eyebrowGap: 0.178, lipFullness: 0.115, noseFlare: 10.462, philtrum: 0.107, cheekProminence: 1.071, eyeHeightPos: 0.425 },
    notes: 'visage rond asiatique'
  },
  {
    position: 13,
    preset_id: 33,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Carré",
    peau_detail: "Claire",
    forme_detail: "Carré",
    machoire_label: "Moyenne",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 41, bas_haut: 35,
        neutre_avant: 85, arrondi_angulaire: 100,
        gauche_droite: 23
      },
      front_superieur: {
        reduire_elargir: 84, arriere_avant: 47,
        neutre_haut: 16, arrondi_angulaire: 56,
        gauche_droite: 43
      },
      sourcils: {
        reduire_elargir: 75, bas_haut: 29,
        arriere_avant: 58, arrondi_angulaire: 30
      },
      orbites: {
        reduire_elargir: 37, bas_haut: 44,
        arriere_avant: 55, plus_grande_petite: 32
      },
      oreilles: {
        reduire_elargir: 34, bas_haut: 78,
        arriere_avant: 28, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 21, bas_haut: 21,
        arriere_avant: 36, arrondi_angulaire: 26,
        gauche_droite: 51
      },
      joues: {
        reduire_elargir: 43, bas_haut: 45,
        arriere_avant: 63, arrondi_angulaire: 0
      },
      bouche: {
        reduire_elargir: 78, bas_haut: 61,
        arriere_avant: 14, arrondi_angulaire: 81,
        gauche_droite: 24
      },
      menton: {
        reduire_elargir: 62, bas_haut: 30,
        arriere_avant: 49, arrondi_angulaire: 87,
        gauche_droite: 59
      },
      machoire: {
        reduire_elargir: 6, bas_haut: 8,
        arriere_avant: 71, arrondi_angulaire: 0
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 41, bh: 35, na: 85, aa: 100, gd: 23 },
      couronne: { re: 39, bh: 29, aa: 67, nr: 0, gd: 60 },
      arriere_crane: { re: 0, bh: 47, aa: 100, ang: 0, gd: 49 },
      tempes: { re: 39, bh: 54, aa: 27, ang: 6 },
      front_sup: { re: 84, aa: 47, nh: 16, ang: 56, gd: 43 },
      front_inf: { re: 81, bh: 23, aa: 64, ang: 58 },
      sourcils: { re: 75, bh: 29, aa: 58, ang: 50 },
      sourcils_ctr: { re: 90, bh: 18, aa: 43, ang: 38, gd: 58 },
      sourcils_ext: { re: 49, bh: 22, aa: 36, ang: 32 },
      yeux: { re: 57, bh: 38, aa: 44, ang: 50 },
      orbites: { re: 37, bh: 44, aa: 55, gp: 32 },
      nez_adv: { re: 21, bh: 21, aa: 36, ang: 26, gd: 51 },
      arete_cotes: { re: 43, bh: 23, aa: 39, ang: 58 },
      arete_centrale: { re: 23, bh: 2, aa: 30, ang: 47, gd: 47 },
      arete_sup: { re: 28, bh: 43, aa: 36, ang: 25, gd: 65 },
      joues_adv: { re: 43, bh: 45, aa: 63, ang: 0 },
      bouche_adv: { re: 78, bh: 61, aa: 14, ang: 81, gd: 24 },
      bouche_ext: { re: 41, bh: 43, aa: 53, ang: 51 },
      menton_adv: { re: 62, bh: 30, aa: 49, ang: 87, gd: 59 },
      menton_sup: { re: 0, bh: 78, aa: 52, ang: 33, gd: 33 },
      machoire_adv: { re: 6, bh: 8, aa: 71, ang: 0 },
      maxillaire: { re: 0, bh: 53, aa: 64, ang: 19 },
      mandibule: { re: 50, bh: 100, aa: 100, ang: 45 },
    },
    ratios_cibles: { nez: 0.453, machoire: 0.802, joues: 0.877, bouche: 0.336, yeux: 0.064, sourcils: 0.124, eyebrowGap: 0.179, lipFullness: 0.102, noseFlare: 9.663, philtrum: 0.087, cheekProminence: 1.015, eyeHeightPos: 0.436 },
    notes: ''
  },
  {
    position: 14,
    preset_id: 294,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Ovale",
    peau_detail: "Claire",
    forme_detail: "Long",
    machoire_label: "Fine",
    levres_label: "Moyennes",
    nez_label: "Fin",
    pommettes_label: "Moyennes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 42, bas_haut: 63,
        neutre_avant: 34, arrondi_angulaire: 76,
        gauche_droite: 42
      },
      front_superieur: {
        reduire_elargir: 26, arriere_avant: 40,
        neutre_haut: 15, arrondi_angulaire: 61,
        gauche_droite: 60
      },
      sourcils: {
        reduire_elargir: 46, bas_haut: 52,
        arriere_avant: 49, arrondi_angulaire: 32
      },
      orbites: {
        reduire_elargir: 42, bas_haut: 35,
        arriere_avant: 54, plus_grande_petite: 40
      },
      oreilles: {
        reduire_elargir: 24, bas_haut: 65,
        arriere_avant: 27, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 43, bas_haut: 23,
        arriere_avant: 45, arrondi_angulaire: 44,
        gauche_droite: 52
      },
      joues: {
        reduire_elargir: 81, bas_haut: 56,
        arriere_avant: 64, arrondi_angulaire: 69
      },
      bouche: {
        reduire_elargir: 67, bas_haut: 80,
        arriere_avant: 17, arrondi_angulaire: 100,
        gauche_droite: 47
      },
      menton: {
        reduire_elargir: 47, bas_haut: 74,
        arriere_avant: 59, arrondi_angulaire: 27,
        gauche_droite: 100
      },
      machoire: {
        reduire_elargir: 34, bas_haut: 14,
        arriere_avant: 76, arrondi_angulaire: 44
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 42, bh: 63, na: 34, aa: 76, gd: 42 },
      couronne: { re: 28, bh: 16, aa: 28, nr: 0, gd: 34 },
      arriere_crane: { re: 78, bh: 77, aa: 51, ang: 32, gd: 44 },
      tempes: { re: 27, bh: 90, aa: 54, ang: 34 },
      front_sup: { re: 26, aa: 40, nh: 15, ang: 61, gd: 60 },
      front_inf: { re: 33, bh: 4, aa: 56, ang: 92 },
      sourcils: { re: 46, bh: 52, aa: 49, ang: 32 },
      sourcils_ctr: { re: 8, bh: 41, aa: 61, ang: 57, gd: 52 },
      sourcils_ext: { re: 52, bh: 24, aa: 43, ang: 50 },
      yeux: { re: 50, bh: 44, aa: 53, ang: 50 },
      orbites: { re: 42, bh: 35, aa: 54, gp: 40 },
      nez_adv: { re: 43, bh: 23, aa: 45, ang: 44, gd: 52 },
      arete_cotes: { re: 32, bh: 25, aa: 60, ang: 36 },
      arete_centrale: { re: 54, bh: 27, aa: 78, ang: 53, gd: 36 },
      arete_sup: { re: 64, bh: 43, aa: 44, ang: 84, gd: 45 },
      joues_adv: { re: 81, bh: 56, aa: 64, ang: 69 },
      bouche_adv: { re: 67, bh: 80, aa: 17, ang: 100, gd: 47 },
      bouche_ext: { re: 70, bh: 0, aa: 33, ang: 17 },
      menton_adv: { re: 47, bh: 74, aa: 59, ang: 27, gd: 100 },
      menton_sup: { re: 48, bh: 72, aa: 50, ang: 87, gd: 58 },
      machoire_adv: { re: 34, bh: 14, aa: 76, ang: 46 },
      maxillaire: { re: 0, bh: 46, aa: 91, ang: 50 },
      mandibule: { re: 62, bh: 59, aa: 56, ang: 25 },
    },
    ratios_cibles: { nez: 0.459, machoire: 0.781, joues: 0.901, bouche: 0.35, yeux: 0.057, sourcils: 0.139, eyebrowGap: 0.189, lipFullness: 0.07, noseFlare: 10.211, philtrum: 0.099, cheekProminence: 1.029, eyeHeightPos: 0.477 },
    notes: ''
  },
  {
    position: 15,
    preset_id: 9,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Carré",
    peau_detail: "Claire-bronzée",
    forme_detail: "Carré",
    machoire_label: "Large",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Hautes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 30, bas_haut: 69,
        neutre_avant: 82, arrondi_angulaire: 100,
        gauche_droite: 29
      },
      front_superieur: {
        reduire_elargir: 50, arriere_avant: 52,
        neutre_haut: 0, arrondi_angulaire: 81,
        gauche_droite: 41
      },
      sourcils: {
        reduire_elargir: 43, bas_haut: 43,
        arriere_avant: 63, arrondi_angulaire: 33
      },
      orbites: {
        reduire_elargir: 26, bas_haut: 37,
        arriere_avant: 56, plus_grande_petite: 98
      },
      oreilles: {
        reduire_elargir: 30, bas_haut: 73,
        arriere_avant: 71, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 40, bas_haut: 23,
        arriere_avant: 51, arrondi_angulaire: 51,
        gauche_droite: 64
      },
      joues: {
        reduire_elargir: 50, bas_haut: 46,
        arriere_avant: 47, arrondi_angulaire: 50
      },
      bouche: {
        reduire_elargir: 64, bas_haut: 51,
        arriere_avant: 50, arrondi_angulaire: 100,
        gauche_droite: 43
      },
      menton: {
        reduire_elargir: 45, bas_haut: 63,
        arriere_avant: 49, arrondi_angulaire: 44,
        gauche_droite: 56
      },
      machoire: {
        reduire_elargir: 46, bas_haut: 38,
        arriere_avant: 81, arrondi_angulaire: 22
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 30, bh: 69, na: 82, aa: 100, gd: 29 },
      couronne: { re: 41, bh: 14, aa: 68, nr: 0, gd: 66 },
      arriere_crane: { re: 53, bh: 75, aa: 75, ang: 38, gd: 58 },
      tempes: { re: 68, bh: 53, aa: 76, ang: 44 },
      front_sup: { re: 50, aa: 52, nh: 0, ang: 81, gd: 41 },
      front_inf: { re: 23, bh: 31, aa: 30, ang: 64 },
      sourcils: { re: 43, bh: 43, aa: 63, ang: 33 },
      sourcils_ctr: { re: 64, bh: 25, aa: 39, ang: 22, gd: 48 },
      sourcils_ext: { re: 60, bh: 35, aa: 32, ang: 44 },
      yeux: { re: 31, bh: 47, aa: 64, ang: 50 },
      orbites: { re: 26, bh: 37, aa: 56, gp: 98 },
      nez_adv: { re: 40, bh: 23, aa: 51, ang: 51, gd: 64 },
      arete_cotes: { re: 25, bh: 25, aa: 31, ang: 75 },
      arete_centrale: { re: 49, bh: 25, aa: 36, ang: 100, gd: 58 },
      arete_sup: { re: 29, bh: 29, aa: 30, ang: 13, gd: 42 },
      joues_adv: { re: 50, bh: 46, aa: 47, ang: 50 },
      bouche_adv: { re: 64, bh: 51, aa: 50, ang: 100, gd: 43 },
      bouche_ext: { re: 38, bh: 50, aa: 39, ang: 64 },
      menton_adv: { re: 45, bh: 63, aa: 49, ang: 44, gd: 56 },
      menton_sup: { re: 47, bh: 54, aa: 42, ang: 89, gd: 56 },
      machoire_adv: { re: 46, bh: 38, aa: 81, ang: 22 },
      maxillaire: { re: 22, bh: 42, aa: 68, ang: 90 },
      mandibule: { re: 23, bh: 42, aa: 49, ang: 56 },
    },
    ratios_cibles: { nez: 0.467, machoire: 0.796, joues: 0.891, bouche: 0.348, yeux: 0.059, sourcils: 0.149, eyebrowGap: 0.193, lipFullness: 0.107, noseFlare: 9.99, philtrum: 0.093, cheekProminence: 1.019, eyeHeightPos: 0.463 },
    notes: 'Mono sourcils'
  },
  {
    position: 16,
    preset_id: 203,
    // ── Labels morpho ──
    couleur_peau: "Claire-bronzée",
    forme_visage: "Carré",
    peau_detail: "Claire",
    forme_detail: "Carré large",
    machoire_label: "Large",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 48, bas_haut: 66,
        neutre_avant: 38, arrondi_angulaire: 100,
        gauche_droite: 58
      },
      front_superieur: {
        reduire_elargir: 60, arriere_avant: 100,
        neutre_haut: 0, arrondi_angulaire: 68,
        gauche_droite: 36
      },
      sourcils: {
        reduire_elargir: 72, bas_haut: 6,
        arriere_avant: 49, arrondi_angulaire: 19
      },
      orbites: {
        reduire_elargir: 18, bas_haut: 43,
        arriere_avant: 71, plus_grande_petite: 76
      },
      oreilles: {
        reduire_elargir: 70, bas_haut: 42,
        arriere_avant: 84, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 35, bas_haut: 48,
        arriere_avant: 41, arrondi_angulaire: 52,
        gauche_droite: 24
      },
      joues: {
        reduire_elargir: 44, bas_haut: 18,
        arriere_avant: 67, arrondi_angulaire: 59
      },
      bouche: {
        reduire_elargir: 78, bas_haut: 59,
        arriere_avant: 27, arrondi_angulaire: 100,
        gauche_droite: 45
      },
      menton: {
        reduire_elargir: 33, bas_haut: 57,
        arriere_avant: 89, arrondi_angulaire: 34,
        gauche_droite: 72
      },
      machoire: {
        reduire_elargir: 69, bas_haut: 54,
        arriere_avant: 100, arrondi_angulaire: 24
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 48, bh: 66, na: 38, aa: 100, gd: 58 },
      couronne: { re: 33, bh: 48, aa: 62, nr: 0, gd: 42 },
      arriere_crane: { re: 56, bh: 72, aa: 70, ang: 47, gd: 38 },
      tempes: { re: 52, bh: 30, aa: 88, ang: 64 },
      front_sup: { re: 60, aa: 100, nh: 0, ang: 68, gd: 36 },
      front_inf: { re: 41, bh: 19, aa: 67, ang: 50 },
      sourcils: { re: 72, bh: 6, aa: 49, ang: 19 },
      sourcils_ctr: { re: 56, bh: 10, aa: 57, ang: 39, gd: 44 },
      sourcils_ext: { re: 45, bh: 30, aa: 66, ang: 53 },
      yeux: { re: 41, bh: 50, aa: 75, ang: 50 },
      orbites: { re: 18, bh: 43, aa: 71, gp: 76 },
      nez_adv: { re: 35, bh: 48, aa: 41, ang: 52, gd: 24 },
      arete_cotes: { re: 23, bh: 25, aa: 59, ang: 16 },
      arete_centrale: { re: 63, bh: 48, aa: 82, ang: 47, gd: 30 },
      arete_sup: { re: 42, bh: 39, aa: 58, ang: 97, gd: 34 },
      joues_adv: { re: 44, bh: 18, aa: 67, ang: 59 },
      bouche_adv: { re: 78, bh: 59, aa: 27, ang: 100, gd: 45 },
      bouche_ext: { re: 23, bh: 46, aa: 56, ang: 47 },
      menton_adv: { re: 33, bh: 57, aa: 89, ang: 34, gd: 72 },
      menton_sup: { re: 24, bh: 23, aa: 22, ang: 97, gd: 71 },
      machoire_adv: { re: 69, bh: 54, aa: 100, ang: 24 },
      maxillaire: { re: 24, bh: 47, aa: 53, ang: 56 },
      mandibule: { re: 31, bh: 24, aa: 48, ang: 36 },
    },
    ratios_cibles: { nez: 0.473, machoire: 0.809, joues: 0.89, bouche: 0.352, yeux: 0.067, sourcils: 0.125, eyebrowGap: 0.178, lipFullness: 0.113, noseFlare: 10.542, philtrum: 0.083, cheekProminence: 1.05, eyeHeightPos: 0.44 },
    notes: ''
  },
  {
    position: 17,
    preset_id: 241,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Ovale",
    peau_detail: "Claire",
    forme_detail: "Carré large",
    machoire_label: "Large",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 45, bas_haut: 37,
        neutre_avant: 100, arrondi_angulaire: 66,
        gauche_droite: 58
      },
      front_superieur: {
        reduire_elargir: 96, arriere_avant: 59,
        neutre_haut: 9, arrondi_angulaire: 68,
        gauche_droite: 35
      },
      sourcils: {
        reduire_elargir: 21, bas_haut: 35,
        arriere_avant: 47, arrondi_angulaire: 7
      },
      orbites: {
        reduire_elargir: 35, bas_haut: 26,
        arriere_avant: 65, plus_grande_petite: 75
      },
      oreilles: {
        reduire_elargir: 25, bas_haut: 90,
        arriere_avant: 67, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 43, bas_haut: 30,
        arriere_avant: 39, arrondi_angulaire: 71,
        gauche_droite: 45
      },
      joues: {
        reduire_elargir: 46, bas_haut: 50,
        arriere_avant: 81, arrondi_angulaire: 71
      },
      bouche: {
        reduire_elargir: 65, bas_haut: 59,
        arriere_avant: 31, arrondi_angulaire: 63,
        gauche_droite: 31
      },
      menton: {
        reduire_elargir: 42, bas_haut: 74,
        arriere_avant: 100, arrondi_angulaire: 99,
        gauche_droite: 71
      },
      machoire: {
        reduire_elargir: 24, bas_haut: 83,
        arriere_avant: 65, arrondi_angulaire: 4
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 45, bh: 37, na: 100, aa: 66, gd: 58 },
      couronne: { re: 100, bh: 28, aa: 87, nr: 0, gd: 57 },
      arriere_crane: { re: 78, bh: 68, aa: 50, ang: 53, gd: 87 },
      tempes: { re: 27, bh: 41, aa: 69, ang: 0 },
      front_sup: { re: 96, aa: 59, nh: 9, ang: 68, gd: 35 },
      front_inf: { re: 50, bh: 19, aa: 71, ang: 62 },
      sourcils: { re: 21, bh: 35, aa: 47, ang: 7 },
      sourcils_ctr: { re: 62, bh: 8, aa: 49, ang: 28, gd: 47 },
      sourcils_ext: { re: 26, bh: 42, aa: 86, ang: 50 },
      yeux: { re: 24, bh: 34, aa: 69, ang: 50 },
      orbites: { re: 35, bh: 26, aa: 65, gp: 75 },
      nez_adv: { re: 43, bh: 30, aa: 39, ang: 71, gd: 45 },
      arete_cotes: { re: 47, bh: 24, aa: 50, ang: 54 },
      arete_centrale: { re: 29, bh: 13, aa: 39, ang: 50, gd: 49 },
      arete_sup: { re: 79, bh: 9, aa: 51, ang: 24, gd: 44 },
      joues_adv: { re: 46, bh: 50, aa: 81, ang: 71 },
      bouche_adv: { re: 65, bh: 59, aa: 31, ang: 63, gd: 31 },
      bouche_ext: { re: 43, bh: 44, aa: 73, ang: 45 },
      menton_adv: { re: 42, bh: 74, aa: 100, ang: 99, gd: 71 },
      menton_sup: { re: 33, bh: 55, aa: 59, ang: 65, gd: 29 },
      machoire_adv: { re: 24, bh: 83, aa: 65, ang: 4 },
      maxillaire: { re: 18, bh: 47, aa: 54, ang: 68 },
      mandibule: { re: 50, bh: 83, aa: 82, ang: 51 },
    },
    ratios_cibles: { nez: 0.474, machoire: 0.771, joues: 0.892, bouche: 0.368, yeux: 0.055, sourcils: 0.136, eyebrowGap: 0.185, lipFullness: 0.094, noseFlare: 10.782, philtrum: 0.092, cheekProminence: 1.024, eyeHeightPos: 0.469 },
    notes: ''
  },
  {
    position: 18,
    preset_id: 304,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Rond",
    peau_detail: "Claire-bronzée",
    forme_detail: "Rond plein",
    machoire_label: "Moyenne",
    levres_label: "Pleines",
    nez_label: "Fin",
    pommettes_label: "Hautes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 33, bas_haut: 29,
        neutre_avant: 97, arrondi_angulaire: 70,
        gauche_droite: 100
      },
      front_superieur: {
        reduire_elargir: 38, arriere_avant: 29,
        neutre_haut: 75, arrondi_angulaire: 26,
        gauche_droite: 49
      },
      sourcils: {
        reduire_elargir: 67, bas_haut: 70,
        arriere_avant: 50, arrondi_angulaire: 34
      },
      orbites: {
        reduire_elargir: 32, bas_haut: 54,
        arriere_avant: 92, plus_grande_petite: 100
      },
      oreilles: {
        reduire_elargir: 12, bas_haut: 23,
        arriere_avant: 97, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 48, bas_haut: 24,
        arriere_avant: 36, arrondi_angulaire: 73,
        gauche_droite: 55
      },
      joues: {
        reduire_elargir: 74, bas_haut: 94,
        arriere_avant: 86, arrondi_angulaire: 83
      },
      bouche: {
        reduire_elargir: 59, bas_haut: 39,
        arriere_avant: 59, arrondi_angulaire: 100,
        gauche_droite: 26
      },
      menton: {
        reduire_elargir: 52, bas_haut: 65,
        arriere_avant: 58, arrondi_angulaire: 37,
        gauche_droite: 40
      },
      machoire: {
        reduire_elargir: 31, bas_haut: 29,
        arriere_avant: 100, arrondi_angulaire: 5
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 33, bh: 29, na: 97, aa: 70, gd: 100 },
      couronne: { re: 49, bh: 57, aa: 70, nr: 0, gd: 60 },
      arriere_crane: { re: 47, bh: 56, aa: 86, ang: 62, gd: 94 },
      tempes: { re: 20, bh: 29, aa: 75, ang: 47 },
      front_sup: { re: 38, aa: 29, nh: 75, ang: 26, gd: 49 },
      front_inf: { re: 100, bh: 47, aa: 54, ang: 34 },
      sourcils: { re: 67, bh: 70, aa: 50, ang: 34 },
      sourcils_ctr: { re: 72, bh: 56, aa: 59, ang: 62, gd: 56 },
      sourcils_ext: { re: 31, bh: 79, aa: 36, ang: 78 },
      yeux: { re: 52, bh: 55, aa: 94, ang: 50 },
      orbites: { re: 32, bh: 54, aa: 92, gp: 100 },
      nez_adv: { re: 48, bh: 24, aa: 36, ang: 73, gd: 55 },
      arete_cotes: { re: 54, bh: 16, aa: 72, ang: 92 },
      arete_centrale: { re: 30, bh: 26, aa: 31, ang: 100, gd: 53 },
      arete_sup: { re: 82, bh: 14, aa: 38, ang: 83, gd: 72 },
      joues_adv: { re: 74, bh: 94, aa: 86, ang: 83 },
      bouche_adv: { re: 59, bh: 39, aa: 59, ang: 100, gd: 26 },
      bouche_ext: { re: 22, bh: 46, aa: 75, ang: 58 },
      menton_adv: { re: 52, bh: 65, aa: 58, ang: 37, gd: 40 },
      menton_sup: { re: 44, bh: 31, aa: 49, ang: 55, gd: 48 },
      machoire_adv: { re: 31, bh: 29, aa: 100, ang: 5 },
      maxillaire: { re: 8, bh: 59, aa: 71, ang: 55 },
      mandibule: { re: 38, bh: 61, aa: 63, ang: 72 },
    },
    ratios_cibles: { nez: 0.462, machoire: 0.783, joues: 0.889, bouche: 0.356, yeux: 0.061, sourcils: 0.14, eyebrowGap: 0.183, lipFullness: 0.117, noseFlare: 9.658, philtrum: 0.091, cheekProminence: 1.04, eyeHeightPos: 0.436 },
    notes: 'visage asiatique'
  },
  {
    position: 19,
    preset_id: 57,
    // ── Labels morpho ──
    couleur_peau: "Foncée",
    forme_visage: "Ovale",
    peau_detail: "Claire-bronzée",
    forme_detail: "Ovale",
    machoire_label: "Moyenne",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Hautes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 49, bas_haut: 0,
        neutre_avant: 48, arrondi_angulaire: 0,
        gauche_droite: 5
      },
      front_superieur: {
        reduire_elargir: 90, arriere_avant: 59,
        neutre_haut: 19, arrondi_angulaire: 86,
        gauche_droite: 22
      },
      sourcils: {
        reduire_elargir: 24, bas_haut: 77,
        arriere_avant: 54, arrondi_angulaire: 57
      },
      orbites: {
        reduire_elargir: 38, bas_haut: 75,
        arriere_avant: 67, plus_grande_petite: 9
      },
      oreilles: {
        reduire_elargir: 28, bas_haut: 15,
        arriere_avant: 28, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 41, bas_haut: 40,
        arriere_avant: 36, arrondi_angulaire: 51,
        gauche_droite: 61
      },
      joues: {
        reduire_elargir: 57, bas_haut: 98,
        arriere_avant: 100, arrondi_angulaire: 96
      },
      bouche: {
        reduire_elargir: 50, bas_haut: 72,
        arriere_avant: 0, arrondi_angulaire: 64,
        gauche_droite: 48
      },
      menton: {
        reduire_elargir: 17, bas_haut: 75,
        arriere_avant: 49, arrondi_angulaire: 33,
        gauche_droite: 100
      },
      machoire: {
        reduire_elargir: 63, bas_haut: 25,
        arriere_avant: 100, arrondi_angulaire: 16
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 49, bh: 0, na: 48, aa: 0, gd: 5 },
      couronne: { re: 100, bh: 94, aa: 13, nr: 0, gd: 54 },
      arriere_crane: { re: 69, bh: 7, aa: 82, ang: 86, gd: 48 },
      tempes: { re: 19, bh: 26, aa: 52, ang: 58 },
      front_sup: { re: 90, aa: 59, nh: 19, ang: 86, gd: 22 },
      front_inf: { re: 42, bh: 73, aa: 57, ang: 50 },
      sourcils: { re: 24, bh: 77, aa: 54, ang: 57 },
      sourcils_ctr: { re: 59, bh: 62, aa: 30, ang: 24, gd: 57 },
      sourcils_ext: { re: 40, bh: 72, aa: 61, ang: 100 },
      yeux: { re: 52, bh: 61, aa: 59, ang: 50 },
      orbites: { re: 38, bh: 75, aa: 67, gp: 9 },
      nez_adv: { re: 41, bh: 40, aa: 36, ang: 51, gd: 61 },
      arete_cotes: { re: 65, bh: 18, aa: 15, ang: 76 },
      arete_centrale: { re: 37, bh: 9, aa: 11, ang: 13, gd: 54 },
      arete_sup: { re: 22, bh: 7, aa: 48, ang: 50, gd: 63 },
      joues_adv: { re: 57, bh: 98, aa: 100, ang: 96 },
      bouche_adv: { re: 50, bh: 72, aa: 0, ang: 64, gd: 48 },
      bouche_ext: { re: 53, bh: 46, aa: 52, ang: 48 },
      menton_adv: { re: 17, bh: 75, aa: 49, ang: 33, gd: 100 },
      menton_sup: { re: 32, bh: 70, aa: 33, ang: 44, gd: 76 },
      machoire_adv: { re: 63, bh: 25, aa: 100, ang: 16 },
      maxillaire: { re: 42, bh: 59, aa: 79, ang: 48 },
      mandibule: { re: 47, bh: 75, aa: 90, ang: 65 },
    },
    ratios_cibles: { nez: 0.451, machoire: 0.784, joues: 0.887, bouche: 0.355, yeux: 0.062, sourcils: 0.137, eyebrowGap: 0.193, lipFullness: 0.088, noseFlare: 9.68, philtrum: 0.09, cheekProminence: 1.047, eyeHeightPos: 0.449 },
    notes: 'visage typé asie (thailandais)'
  },
  {
    position: 20,
    preset_id: 268,
    // ── Labels morpho ──
    couleur_peau: "Foncée",
    forme_visage: "Ovale",
    peau_detail: "Foncée",
    forme_detail: "Ovale plein",
    machoire_label: "Moyenne",
    levres_label: "Pleines",
    nez_label: "Large",
    pommettes_label: "Hautes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 70, bas_haut: 88,
        neutre_avant: 92, arrondi_angulaire: 55,
        gauche_droite: 0
      },
      front_superieur: {
        reduire_elargir: 79, arriere_avant: 23,
        neutre_haut: 0, arrondi_angulaire: 84,
        gauche_droite: 0
      },
      sourcils: {
        reduire_elargir: 50, bas_haut: 66,
        arriere_avant: 48, arrondi_angulaire: 53
      },
      orbites: {
        reduire_elargir: 68, bas_haut: 34,
        arriere_avant: 79, plus_grande_petite: 12
      },
      oreilles: {
        reduire_elargir: 44, bas_haut: 76,
        arriere_avant: 28, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 55, bas_haut: 33,
        arriere_avant: 45, arrondi_angulaire: 66,
        gauche_droite: 69
      },
      joues: {
        reduire_elargir: 72, bas_haut: 94,
        arriere_avant: 52, arrondi_angulaire: 86
      },
      bouche: {
        reduire_elargir: 58, bas_haut: 29,
        arriere_avant: 81, arrondi_angulaire: 100,
        gauche_droite: 65
      },
      menton: {
        reduire_elargir: 48, bas_haut: 53,
        arriere_avant: 22, arrondi_angulaire: 47,
        gauche_droite: 95
      },
      machoire: {
        reduire_elargir: 72, bas_haut: 68,
        arriere_avant: 53, arrondi_angulaire: 56
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 70, bh: 88, na: 92, aa: 55, gd: 0 },
      couronne: { re: 68, bh: 17, aa: 62, nr: 40, gd: 64 },
      arriere_crane: { re: 65, bh: 74, aa: 62, ang: 49, gd: 98 },
      tempes: { re: 45, bh: 44, aa: 91, ang: 25 },
      front_sup: { re: 79, aa: 23, nh: 0, ang: 84, gd: 0 },
      front_inf: { re: 14, bh: 56, aa: 86, ang: 25 },
      sourcils: { re: 50, bh: 66, aa: 48, ang: 53 },
      sourcils_ctr: { re: 100, bh: 46, aa: 42, ang: 83, gd: 42 },
      sourcils_ext: { re: 17, bh: 63, aa: 65, ang: 77 },
      yeux: { re: 45, bh: 0, aa: 89, ang: 50 },
      orbites: { re: 68, bh: 34, aa: 79, gp: 12 },
      nez_adv: { re: 55, bh: 33, aa: 45, ang: 66, gd: 69 },
      arete_cotes: { re: 48, bh: 19, aa: 37, ang: 51 },
      arete_centrale: { re: 22, bh: 17, aa: 40, ang: 100, gd: 63 },
      arete_sup: { re: 53, bh: 9, aa: 37, ang: 11, gd: 31 },
      joues_adv: { re: 72, bh: 94, aa: 52, ang: 86 },
      bouche_adv: { re: 58, bh: 29, aa: 81, ang: 100, gd: 65 },
      bouche_ext: { re: 77, bh: 47, aa: 36, ang: 45 },
      menton_adv: { re: 48, bh: 53, aa: 22, ang: 47, gd: 95 },
      menton_sup: { re: 89, bh: 7, aa: 38, ang: 55, gd: 62 },
      machoire_adv: { re: 72, bh: 68, aa: 53, ang: 56 },
      maxillaire: { re: 45, bh: 52, aa: 38, ang: 69 },
      mandibule: { re: 19, bh: 45, aa: 31, ang: 37 },
    },
    ratios_cibles: { nez: 0.476, machoire: 0.786, joues: 0.904, bouche: 0.357, yeux: 0.053, sourcils: 0.147, eyebrowGap: 0.191, lipFullness: 0.135, noseFlare: 11.218, philtrum: 0.091, cheekProminence: 1.041, eyeHeightPos: 0.467 },
    notes: ''
  },
  {
    position: 21,
    preset_id: 99,
    // ── Labels morpho ──
    couleur_peau: "Métis",
    forme_visage: "Carré",
    peau_detail: "Métis foncée",
    forme_detail: "Ovale",
    machoire_label: "Moyenne",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Hautes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 62, bas_haut: 20,
        neutre_avant: 51, arrondi_angulaire: 0,
        gauche_droite: 40
      },
      front_superieur: {
        reduire_elargir: 74, arriere_avant: 33,
        neutre_haut: 67, arrondi_angulaire: 22,
        gauche_droite: 38
      },
      sourcils: {
        reduire_elargir: 41, bas_haut: 15,
        arriere_avant: 53, arrondi_angulaire: 43
      },
      orbites: {
        reduire_elargir: 29, bas_haut: 43,
        arriere_avant: 34, plus_grande_petite: 24
      },
      oreilles: {
        reduire_elargir: 16, bas_haut: 89,
        arriere_avant: 27, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 34, bas_haut: 53,
        arriere_avant: 47, arrondi_angulaire: 52,
        gauche_droite: 67
      },
      joues: {
        reduire_elargir: 41, bas_haut: 48,
        arriere_avant: 81, arrondi_angulaire: 49
      },
      bouche: {
        reduire_elargir: 54, bas_haut: 18,
        arriere_avant: 47, arrondi_angulaire: 91,
        gauche_droite: 59
      },
      menton: {
        reduire_elargir: 29, bas_haut: 53,
        arriere_avant: 46, arrondi_angulaire: 0,
        gauche_droite: 64
      },
      machoire: {
        reduire_elargir: 41, bas_haut: 61,
        arriere_avant: 79, arrondi_angulaire: 1
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 62, bh: 20, na: 51, aa: 0, gd: 40 },
      couronne: { re: 35, bh: 75, aa: 19, nr: 0, gd: 68 },
      arriere_crane: { re: 50, bh: 18, aa: 59, ang: 75, gd: 48 },
      tempes: { re: 32, bh: 82, aa: 25, ang: 42 },
      front_sup: { re: 74, aa: 33, nh: 67, ang: 22, gd: 38 },
      front_inf: { re: 39, bh: 23, aa: 39, ang: 49 },
      sourcils: { re: 41, bh: 15, aa: 53, ang: 43 },
      sourcils_ctr: { re: 86, bh: 17, aa: 38, ang: 50, gd: 54 },
      sourcils_ext: { re: 70, bh: 26, aa: 37, ang: 49 },
      yeux: { re: 4, bh: 76, aa: 57, ang: 50 },
      orbites: { re: 29, bh: 43, aa: 34, gp: 24 },
      nez_adv: { re: 34, bh: 53, aa: 47, ang: 52, gd: 67 },
      arete_cotes: { re: 44, bh: 85, aa: 36, ang: 73 },
      arete_centrale: { re: 47, bh: 60, aa: 39, ang: 37, gd: 57 },
      arete_sup: { re: 7, bh: 61, aa: 34, ang: 20, gd: 55 },
      joues_adv: { re: 41, bh: 48, aa: 81, ang: 49 },
      bouche_adv: { re: 54, bh: 18, aa: 47, ang: 91, gd: 59 },
      bouche_ext: { re: 55, bh: 59, aa: 46, ang: 41 },
      menton_adv: { re: 29, bh: 53, aa: 46, ang: 0, gd: 64 },
      menton_sup: { re: 33, bh: 59, aa: 33, ang: 59, gd: 53 },
      machoire_adv: { re: 41, bh: 61, aa: 79, ang: 1 },
      maxillaire: { re: 53, bh: 28, aa: 71, ang: 74 },
      mandibule: { re: 39, bh: 27, aa: 60, ang: 86 },
    },
    ratios_cibles: { nez: 0.485, machoire: 0.797, joues: 0.888, bouche: 0.372, yeux: 0.064, sourcils: 0.133, eyebrowGap: 0.183, lipFullness: 0.1, noseFlare: 10.13, philtrum: 0.118, cheekProminence: 1.033, eyeHeightPos: 0.431 },
    notes: ''
  },
  {
    position: 22,
    preset_id: 202,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Carré",
    peau_detail: "Claire",
    forme_detail: "Carré large",
    machoire_label: "Large",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 33, bas_haut: 46,
        neutre_avant: 18, arrondi_angulaire: 75,
        gauche_droite: 17
      },
      front_superieur: {
        reduire_elargir: 69, arriere_avant: 31,
        neutre_haut: 0, arrondi_angulaire: 58,
        gauche_droite: 18
      },
      sourcils: {
        reduire_elargir: 9, bas_haut: 41,
        arriere_avant: 50, arrondi_angulaire: 43
      },
      orbites: {
        reduire_elargir: 35, bas_haut: 41,
        arriere_avant: 68, plus_grande_petite: 94
      },
      oreilles: {
        reduire_elargir: 56, bas_haut: 83,
        arriere_avant: 27, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 29, bas_haut: 36,
        arriere_avant: 49, arrondi_angulaire: 63,
        gauche_droite: 43
      },
      joues: {
        reduire_elargir: 44, bas_haut: 48,
        arriere_avant: 62, arrondi_angulaire: 42
      },
      bouche: {
        reduire_elargir: 60, bas_haut: 54,
        arriere_avant: 50, arrondi_angulaire: 100,
        gauche_droite: 14
      },
      menton: {
        reduire_elargir: 41, bas_haut: 73,
        arriere_avant: 75, arrondi_angulaire: 18,
        gauche_droite: 22
      },
      machoire: {
        reduire_elargir: 49, bas_haut: 30,
        arriere_avant: 88, arrondi_angulaire: 48
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 33, bh: 46, na: 18, aa: 75, gd: 17 },
      couronne: { re: 17, bh: 35, aa: 47, nr: 0, gd: 69 },
      arriere_crane: { re: 100, bh: 9, aa: 71, ang: 60, gd: 42 },
      tempes: { re: 39, bh: 49, aa: 75, ang: 51 },
      front_sup: { re: 69, aa: 31, nh: 0, ang: 58, gd: 18 },
      front_inf: { re: 54, bh: 49, aa: 54, ang: 57 },
      sourcils: { re: 9, bh: 41, aa: 50, ang: 43 },
      sourcils_ctr: { re: 77, bh: 20, aa: 50, ang: 44, gd: 45 },
      sourcils_ext: { re: 51, bh: 47, aa: 66, ang: 4 },
      yeux: { re: 59, bh: 41, aa: 74, ang: 50 },
      orbites: { re: 35, bh: 41, aa: 68, gp: 94 },
      nez_adv: { re: 29, bh: 36, aa: 49, ang: 63, gd: 43 },
      arete_cotes: { re: 24, bh: 47, aa: 41, ang: 30 },
      arete_centrale: { re: 24, bh: 35, aa: 75, ang: 100, gd: 54 },
      arete_sup: { re: 43, bh: 23, aa: 75, ang: 95, gd: 41 },
      joues_adv: { re: 44, bh: 48, aa: 62, ang: 42 },
      bouche_adv: { re: 60, bh: 54, aa: 50, ang: 100, gd: 14 },
      bouche_ext: { re: 0, bh: 49, aa: 61, ang: 50 },
      menton_adv: { re: 41, bh: 73, aa: 75, ang: 18, gd: 22 },
      menton_sup: { re: 59, bh: 62, aa: 56, ang: 87, gd: 51 },
      machoire_adv: { re: 49, bh: 30, aa: 88, ang: 48 },
      maxillaire: { re: 5, bh: 42, aa: 58, ang: 50 },
      mandibule: { re: 1, bh: 39, aa: 52, ang: 40 },
    },
    ratios_cibles: { nez: 0.454, machoire: 0.804, joues: 0.891, bouche: 0.374, yeux: 0.057, sourcils: 0.129, eyebrowGap: 0.183, lipFullness: 0.071, noseFlare: 10.384, philtrum: 0.086, cheekProminence: 1.039, eyeHeightPos: 0.46 },
    notes: ''
  },
  {
    position: 23,
    preset_id: 226,
    // ── Labels morpho ──
    couleur_peau: "Foncée",
    forme_visage: "Ovale",
    peau_detail: "Foncée",
    forme_detail: "Carré large",
    machoire_label: "Large",
    levres_label: "Pleines",
    nez_label: "Large",
    pommettes_label: "Hautes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 5, bas_haut: 11,
        neutre_avant: 58, arrondi_angulaire: 0,
        gauche_droite: 29
      },
      front_superieur: {
        reduire_elargir: 92, arriere_avant: 13,
        neutre_haut: 96, arrondi_angulaire: 0,
        gauche_droite: 62
      },
      sourcils: {
        reduire_elargir: 79, bas_haut: 66,
        arriere_avant: 83, arrondi_angulaire: 73
      },
      orbites: {
        reduire_elargir: 40, bas_haut: 28,
        arriere_avant: 66, plus_grande_petite: 82
      },
      oreilles: {
        reduire_elargir: 24, bas_haut: 46,
        arriere_avant: 27, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 71, bas_haut: 39,
        arriere_avant: 50, arrondi_angulaire: 67,
        gauche_droite: 12
      },
      joues: {
        reduire_elargir: 23, bas_haut: 78,
        arriere_avant: 96, arrondi_angulaire: 93
      },
      bouche: {
        reduire_elargir: 73, bas_haut: 31,
        arriere_avant: 94, arrondi_angulaire: 52,
        gauche_droite: 1
      },
      menton: {
        reduire_elargir: 0, bas_haut: 25,
        arriere_avant: 54, arrondi_angulaire: 90,
        gauche_droite: 51
      },
      machoire: {
        reduire_elargir: 31, bas_haut: 0,
        arriere_avant: 100, arrondi_angulaire: 34
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 5, bh: 11, na: 58, aa: 0, gd: 29 },
      couronne: { re: 40, bh: 100, aa: 21, nr: 0, gd: 58 },
      arriere_crane: { re: 40, bh: 35, aa: 57, ang: 69, gd: 61 },
      tempes: { re: 44, bh: 62, aa: 35, ang: 81 },
      front_sup: { re: 92, aa: 13, nh: 96, ang: 0, gd: 62 },
      front_inf: { re: 83, bh: 50, aa: 56, ang: 50 },
      sourcils: { re: 79, bh: 66, aa: 83, ang: 73 },
      sourcils_ctr: { re: 50, bh: 29, aa: 58, ang: 9, gd: 49 },
      sourcils_ext: { re: 60, bh: 9, aa: 46, ang: 100 },
      yeux: { re: 56, bh: 31, aa: 56, ang: 50 },
      orbites: { re: 40, bh: 28, aa: 66, gp: 82 },
      nez_adv: { re: 71, bh: 39, aa: 50, ang: 67, gd: 12 },
      arete_cotes: { re: 55, bh: 13, aa: 61, ang: 69 },
      arete_centrale: { re: 25, bh: 19, aa: 42, ang: 100, gd: 46 },
      arete_sup: { re: 42, bh: 8, aa: 38, ang: 53, gd: 53 },
      joues_adv: { re: 23, bh: 78, aa: 96, ang: 93 },
      bouche_adv: { re: 73, bh: 31, aa: 94, ang: 52, gd: 1 },
      bouche_ext: { re: 85, bh: 35, aa: 19, ang: 4 },
      menton_adv: { re: 0, bh: 25, aa: 54, ang: 90, gd: 51 },
      menton_sup: { re: 75, bh: 3, aa: 89, ang: 82, gd: 17 },
      machoire_adv: { re: 31, bh: 0, aa: 100, ang: 34 },
      maxillaire: { re: 82, bh: 7, aa: 70, ang: 95 },
      mandibule: { re: 14, bh: 24, aa: 76, ang: 39 },
    },
    ratios_cibles: { nez: 0.489, machoire: 0.803, joues: 0.914, bouche: 0.399, yeux: 0.059, sourcils: 0.135, eyebrowGap: 0.197, lipFullness: 0.161, noseFlare: 11.456, philtrum: 0.076, cheekProminence: 1.076, eyeHeightPos: 0.452 },
    notes: ''
  },
  {
    position: 24,
    preset_id: 151,
    // ── Labels morpho ──
    couleur_peau: "Foncée",
    forme_visage: "Long",
    peau_detail: "Métis",
    forme_detail: "Long",
    machoire_label: "Fine",
    levres_label: "Pleines",
    nez_label: "Moyen",
    pommettes_label: "Hautes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 42, bas_haut: 13,
        neutre_avant: 87, arrondi_angulaire: 95,
        gauche_droite: 49
      },
      front_superieur: {
        reduire_elargir: 48, arriere_avant: 100,
        neutre_haut: 0, arrondi_angulaire: 99,
        gauche_droite: 42
      },
      sourcils: {
        reduire_elargir: 36, bas_haut: 34,
        arriere_avant: 64, arrondi_angulaire: 23
      },
      orbites: {
        reduire_elargir: 61, bas_haut: 29,
        arriere_avant: 70, plus_grande_petite: 81
      },
      oreilles: {
        reduire_elargir: 67, bas_haut: 87,
        arriere_avant: 86, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 80, bas_haut: 44,
        arriere_avant: 48, arrondi_angulaire: 53,
        gauche_droite: 60
      },
      joues: {
        reduire_elargir: 26, bas_haut: 82,
        arriere_avant: 89, arrondi_angulaire: 61
      },
      bouche: {
        reduire_elargir: 84, bas_haut: 38,
        arriere_avant: 89, arrondi_angulaire: 99,
        gauche_droite: 48
      },
      menton: {
        reduire_elargir: 42, bas_haut: 60,
        arriere_avant: 96, arrondi_angulaire: 100,
        gauche_droite: 35
      },
      machoire: {
        reduire_elargir: 25, bas_haut: 34,
        arriere_avant: 100, arrondi_angulaire: 22
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 42, bh: 13, na: 87, aa: 95, gd: 49 },
      couronne: { re: 39, bh: 42, aa: 100, nr: 0, gd: 50 },
      arriere_crane: { re: 78, bh: 75, aa: 36, ang: 38, gd: 55 },
      tempes: { re: 21, bh: 53, aa: 85, ang: 14 },
      front_sup: { re: 48, aa: 100, nh: 0, ang: 99, gd: 42 },
      front_inf: { re: 21, bh: 37, aa: 94, ang: 85 },
      sourcils: { re: 36, bh: 34, aa: 64, ang: 23 },
      sourcils_ctr: { re: 86, bh: 23, aa: 57, ang: 59, gd: 42 },
      sourcils_ext: { re: 32, bh: 47, aa: 95, ang: 19 },
      yeux: { re: 69, bh: 27, aa: 71, ang: 50 },
      orbites: { re: 61, bh: 29, aa: 70, gp: 81 },
      nez_adv: { re: 80, bh: 44, aa: 48, ang: 53, gd: 60 },
      arete_cotes: { re: 64, bh: 26, aa: 18, ang: 33 },
      arete_centrale: { re: 40, bh: 24, aa: 47, ang: 85, gd: 49 },
      arete_sup: { re: 36, bh: 9, aa: 36, ang: 20, gd: 34 },
      joues_adv: { re: 26, bh: 82, aa: 89, ang: 61 },
      bouche_adv: { re: 84, bh: 38, aa: 89, ang: 99, gd: 48 },
      bouche_ext: { re: 38, bh: 35, aa: 41, ang: 63 },
      menton_adv: { re: 42, bh: 60, aa: 96, ang: 100, gd: 35 },
      menton_sup: { re: 42, bh: 45, aa: 92, ang: 78, gd: 61 },
      machoire_adv: { re: 25, bh: 34, aa: 100, ang: 22 },
      maxillaire: { re: 26, bh: 7, aa: 72, ang: 57 },
      mandibule: { re: 50, bh: 67, aa: 74, ang: 74 },
    },
    ratios_cibles: { nez: 0.45, machoire: 0.801, joues: 0.908, bouche: 0.397, yeux: 0.055, sourcils: 0.135, eyebrowGap: 0.217, lipFullness: 0.165, noseFlare: 11.512, philtrum: 0.073, cheekProminence: 1.034, eyeHeightPos: 0.493 },
    notes: ''
  },
  {
    position: 25,
    preset_id: 299,
    // ── Labels morpho ──
    couleur_peau: "Foncée",
    forme_visage: "Ovale",
    peau_detail: "Foncée",
    forme_detail: "Carré large",
    machoire_label: "Large",
    levres_label: "Pleines",
    nez_label: "Large",
    pommettes_label: "Hautes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 13, bas_haut: 22,
        neutre_avant: 81, arrondi_angulaire: 87,
        gauche_droite: 62
      },
      front_superieur: {
        reduire_elargir: 87, arriere_avant: 29,
        neutre_haut: 43, arrondi_angulaire: 53,
        gauche_droite: 6
      },
      sourcils: {
        reduire_elargir: 84, bas_haut: 23,
        arriere_avant: 64, arrondi_angulaire: 37
      },
      orbites: {
        reduire_elargir: 24, bas_haut: 33,
        arriere_avant: 67, plus_grande_petite: 16
      },
      oreilles: {
        reduire_elargir: 23, bas_haut: 35,
        arriere_avant: 67, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 57, bas_haut: 34,
        arriere_avant: 50, arrondi_angulaire: 52,
        gauche_droite: 32
      },
      joues: {
        reduire_elargir: 23, bas_haut: 54,
        arriere_avant: 83, arrondi_angulaire: 58
      },
      bouche: {
        reduire_elargir: 71, bas_haut: 47,
        arriere_avant: 85, arrondi_angulaire: 91,
        gauche_droite: 24
      },
      menton: {
        reduire_elargir: 7, bas_haut: 68,
        arriere_avant: 56, arrondi_angulaire: 0,
        gauche_droite: 22
      },
      machoire: {
        reduire_elargir: 35, bas_haut: 0,
        arriere_avant: 100, arrondi_angulaire: 41
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 13, bh: 22, na: 81, aa: 87, gd: 62 },
      couronne: { re: 69, bh: 38, aa: 57, nr: 0, gd: 57 },
      arriere_crane: { re: 95, bh: 49, aa: 64, ang: 80, gd: 47 },
      tempes: { re: 62, bh: 63, aa: 34, ang: 56 },
      front_sup: { re: 87, aa: 29, nh: 43, ang: 53, gd: 6 },
      front_inf: { re: 100, bh: 41, aa: 55, ang: 53 },
      sourcils: { re: 84, bh: 23, aa: 64, ang: 37 },
      sourcils_ctr: { re: 100, bh: 29, aa: 42, ang: 4, gd: 49 },
      sourcils_ext: { re: 38, bh: 10, aa: 37, ang: 75 },
      yeux: { re: 43, bh: 33, aa: 62, ang: 50 },
      orbites: { re: 24, bh: 33, aa: 67, gp: 16 },
      nez_adv: { re: 57, bh: 34, aa: 50, ang: 52, gd: 32 },
      arete_cotes: { re: 25, bh: 3, aa: 64, ang: 37 },
      arete_centrale: { re: 43, bh: 0, aa: 52, ang: 100, gd: 45 },
      arete_sup: { re: 35, bh: 0, aa: 46, ang: 86, gd: 39 },
      joues_adv: { re: 23, bh: 54, aa: 83, ang: 58 },
      bouche_adv: { re: 71, bh: 47, aa: 85, ang: 91, gd: 24 },
      bouche_ext: { re: 81, bh: 67, aa: 29, ang: 38 },
      menton_adv: { re: 7, bh: 68, aa: 56, ang: 0, gd: 22 },
      menton_sup: { re: 44, bh: 55, aa: 83, ang: 79, gd: 64 },
      machoire_adv: { re: 35, bh: 0, aa: 100, ang: 41 },
      maxillaire: { re: 78, bh: 32, aa: 60, ang: 90 },
      mandibule: { re: 19, bh: 55, aa: 75, ang: 13 },
    },
    ratios_cibles: { nez: 0.48, machoire: 0.81, joues: 0.901, bouche: 0.404, yeux: 0.063, sourcils: 0.149, eyebrowGap: 0.196, lipFullness: 0.132, noseFlare: 11.184, philtrum: 0.076, cheekProminence: 1.044, eyeHeightPos: 0.471 },
    notes: ''
  },
  {
    position: 26,
    preset_id: 1001,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Ovale",
    peau_detail: "Claire-bronzée",
    forme_detail: "Ovale",
    machoire_label: "Moyenne",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 41, bas_haut: 35,
        neutre_avant: 85, arrondi_angulaire: 100,
        gauche_droite: 23
      },
      front_superieur: {
        reduire_elargir: 84, arriere_avant: 47,
        neutre_haut: 16, arrondi_angulaire: 56,
        gauche_droite: 43
      },
      sourcils: {
        reduire_elargir: 75, bas_haut: 29,
        arriere_avant: 58, arrondi_angulaire: 50
      },
      orbites: {
        reduire_elargir: 37, bas_haut: 44,
        arriere_avant: 55, plus_grande_petite: 32
      },
      oreilles: {
        reduire_elargir: 34, bas_haut: 78,
        arriere_avant: 28, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 21, bas_haut: 21,
        arriere_avant: 36, arrondi_angulaire: 26,
        gauche_droite: 51
      },
      joues: {
        reduire_elargir: 43, bas_haut: 45,
        arriere_avant: 63, arrondi_angulaire: 0
      },
      bouche: {
        reduire_elargir: 78, bas_haut: 61,
        arriere_avant: 14, arrondi_angulaire: 81,
        gauche_droite: 24
      },
      menton: {
        reduire_elargir: 62, bas_haut: 30,
        arriere_avant: 49, arrondi_angulaire: 87,
        gauche_droite: 59
      },
      machoire: {
        reduire_elargir: 6, bas_haut: 8,
        arriere_avant: 71, arrondi_angulaire: 0
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 41, bh: 35, na: 85, aa: 100, gd: 23 },
      couronne: { re: 39, bh: 29, aa: 67, nr: 0, gd: 60 },
      arriere_crane: { re: 0, bh: 47, aa: 100, ang: 0, gd: 49 },
      tempes: { re: 39, bh: 54, aa: 27, ang: 6 },
      front_sup: { re: 84, aa: 47, nh: 16, ang: 56, gd: 43 },
      front_inf: { re: 81, bh: 23, aa: 64, ang: 58 },
      sourcils: { re: 75, bh: 29, aa: 58, ang: 50 },
      sourcils_ctr: { re: 99, bh: 18, aa: 43, ang: 38, gd: 58 },
      sourcils_ext: { re: 49, bh: 22, aa: 36, ang: 32 },
      yeux: { re: 57, bh: 38, aa: 44, ang: 50 },
      orbites: { re: 37, bh: 44, aa: 55, gp: 32 },
      nez_adv: { re: 21, bh: 21, aa: 36, ang: 26, gd: 51 },
      arete_cotes: { re: 43, bh: 23, aa: 39, ang: 58 },
      arete_centrale: { re: 23, bh: 2, aa: 30, ang: 47, gd: 47 },
      arete_sup: { re: 28, bh: 43, aa: 36, ang: 25, gd: 65 },
      joues_adv: { re: 43, bh: 45, aa: 63, ang: 0 },
      bouche_adv: { re: 78, bh: 61, aa: 14, ang: 81, gd: 24 },
      bouche_ext: { re: 41, bh: 43, aa: 53, ang: 51 },
      menton_adv: { re: 62, bh: 30, aa: 49, ang: 87, gd: 59 },
      menton_sup: { re: 0, bh: 78, aa: 52, ang: 33, gd: 33 },
      machoire_adv: { re: 6, bh: 8, aa: 71, ang: 0 },
      maxillaire: { re: 0, bh: 53, aa: 64, ang: 19 },
      mandibule: { re: 50, bh: 100, aa: 100, ang: 45 },
    },
    ratios_cibles: { nez: 0.447, machoire: 0.806, joues: 0.885, bouche: 0.339, yeux: 0.07, sourcils: 0.141, eyebrowGap: 0.184, lipFullness: 0.068, noseFlare: 9.537, philtrum: 0.098, cheekProminence: 1.044, eyeHeightPos: 0.442 },
    notes: ''
  },
  {
    position: 27,
    preset_id: 1002,
    // ── Labels morpho ──
    couleur_peau: "Très foncée",
    forme_visage: "Long",
    peau_detail: "Foncée",
    forme_detail: "Long",
    machoire_label: "Moyenne",
    levres_label: "Moyennes",
    nez_label: "Large",
    pommettes_label: "Hautes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 68, bas_haut: 50,
        neutre_avant: 31, arrondi_angulaire: 28,
        gauche_droite: 51
      },
      front_superieur: {
        reduire_elargir: 56, arriere_avant: 31,
        neutre_haut: 23, arrondi_angulaire: 29,
        gauche_droite: 37
      },
      sourcils: {
        reduire_elargir: 59, bas_haut: 69,
        arriere_avant: 58, arrondi_angulaire: 70
      },
      orbites: {
        reduire_elargir: 47, bas_haut: 64,
        arriere_avant: 56, plus_grande_petite: 49
      },
      oreilles: {
        reduire_elargir: 31, bas_haut: 42,
        arriere_avant: 34, plus_grande_petite: 51,
        gauche_droite: 53
      },
      nez: {
        reduire_elargir: 61, bas_haut: 53,
        arriere_avant: 66, arrondi_angulaire: 51,
        gauche_droite: 56
      },
      joues: {
        reduire_elargir: 63, bas_haut: 54,
        arriere_avant: 43, arrondi_angulaire: 43
      },
      bouche: {
        reduire_elargir: 59, bas_haut: 56,
        arriere_avant: 46, arrondi_angulaire: 34,
        gauche_droite: 40
      },
      menton: {
        reduire_elargir: 15, bas_haut: 62,
        arriere_avant: 56, arrondi_angulaire: 35,
        gauche_droite: 36
      },
      machoire: {
        reduire_elargir: 78, bas_haut: 20,
        arriere_avant: 81, arrondi_angulaire: 37
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 68, bh: 50, na: 31, aa: 28, gd: 51 },
      couronne: { re: 61, bh: 53, aa: 24, nr: 15, gd: 56 },
      arriere_crane: { re: 63, bh: 39, aa: 46, ang: 57, gd: 51 },
      tempes: { re: 46, bh: 61, aa: 40, ang: 81 },
      front_sup: { re: 56, aa: 31, nh: 23, ang: 29, gd: 37 },
      front_inf: { re: 50, bh: 49, aa: 20, ang: 69 },
      sourcils: { re: 59, bh: 69, aa: 58, ang: 70 },
      sourcils_ctr: { re: 79, bh: 74, aa: 49, ang: 36, gd: 56 },
      sourcils_ext: { re: 63, bh: 57, aa: 37, ang: 74 },
      yeux: { re: 60, bh: 56, aa: 70, ang: 64 },
      orbites: { re: 47, bh: 64, aa: 56, gp: 49 },
      nez_adv: { re: 61, bh: 53, aa: 66, ang: 51, gd: 56 },
      arete_cotes: { re: 39, bh: 51, aa: 72, ang: 64 },
      arete_centrale: { re: 81, bh: 42, aa: 42, ang: 64, gd: 51 },
      arete_sup: { re: 52, bh: 38, aa: 65, ang: 54, gd: 54 },
      joues_adv: { re: 63, bh: 54, aa: 43, ang: 43 },
      bouche_adv: { re: 59, bh: 56, aa: 46, ang: 34, gd: 40 },
      bouche_ext: { re: 76, bh: 51, aa: 42, ang: 39 },
      menton_adv: { re: 15, bh: 62, aa: 56, ang: 35, gd: 36 },
      menton_sup: { re: 46, bh: 20, aa: 39, ang: 54, gd: 43 },
      machoire_adv: { re: 78, bh: 20, aa: 81, ang: 37 },
      maxillaire: { re: 46, bh: 48, aa: 64, ang: 41 },
      mandibule: { re: 61, bh: 43, aa: 56, ang: 66 },
    },
    ratios_cibles: { nez: 0.491, machoire: 0.823, joues: 0.919, bouche: 0.439, yeux: 0.065, sourcils: 0.149, eyebrowGap: 0.205, lipFullness: 0.129, noseFlare: 10.683, philtrum: 0.082, cheekProminence: 1.052, eyeHeightPos: 0.456 },
    notes: ''
  },
  {
    position: 28,
    preset_id: 1003,
    // ── Labels morpho ──
    couleur_peau: "Claire-bronzée",
    forme_visage: "Carré",
    peau_detail: "Claire-bronzée",
    forme_detail: "Long",
    machoire_label: "Fine",
    levres_label: "Moyennes",
    nez_label: "Fin",
    pommettes_label: "Saillantes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 0, bas_haut: 0,
        neutre_avant: 100, arrondi_angulaire: 40,
        gauche_droite: 39
      },
      front_superieur: {
        reduire_elargir: 100, arriere_avant: 6,
        neutre_haut: 100, arrondi_angulaire: 7,
        gauche_droite: 1
      },
      sourcils: {
        reduire_elargir: 48, bas_haut: 6,
        arriere_avant: 66, arrondi_angulaire: 18
      },
      orbites: {
        reduire_elargir: 13, bas_haut: 55,
        arriere_avant: 37, plus_grande_petite: 0
      },
      oreilles: {
        reduire_elargir: 32, bas_haut: 70,
        arriere_avant: 72, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 32, bas_haut: 74,
        arriere_avant: 36, arrondi_angulaire: 21,
        gauche_droite: 83
      },
      joues: {
        reduire_elargir: 26, bas_haut: 52,
        arriere_avant: 76, arrondi_angulaire: 97
      },
      bouche: {
        reduire_elargir: 40, bas_haut: 69,
        arriere_avant: 44, arrondi_angulaire: 79,
        gauche_droite: 29
      },
      menton: {
        reduire_elargir: 13, bas_haut: 60,
        arriere_avant: 50, arrondi_angulaire: 82,
        gauche_droite: 15
      },
      machoire: {
        reduire_elargir: 16, bas_haut: 14,
        arriere_avant: 100, arrondi_angulaire: 16
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 0, bh: 0, na: 100, aa: 40, gd: 39 },
      couronne: { re: 58, bh: 89, aa: 0, nr: 0, gd: 61 },
      arriere_crane: { re: 35, bh: 59, aa: 53, ang: 57, gd: 43 },
      tempes: { re: 25, bh: 73, aa: 24, ang: 0 },
      front_sup: { re: 100, aa: 6, nh: 100, ang: 7, gd: 1 },
      front_inf: { re: 53, bh: 31, aa: 27, ang: 97 },
      sourcils: { re: 48, bh: 6, aa: 66, ang: 18 },
      sourcils_ctr: { re: 64, bh: 15, aa: 33, ang: 8, gd: 55 },
      sourcils_ext: { re: 30, bh: 50, aa: 9, ang: 86 },
      yeux: { re: 39, bh: 88, aa: 61, ang: 50 },
      orbites: { re: 13, bh: 55, aa: 37, gp: 0 },
      nez_adv: { re: 32, bh: 74, aa: 36, ang: 21, gd: 83 },
      arete_cotes: { re: 18, bh: 40, aa: 88, ang: 27 },
      arete_centrale: { re: 75, bh: 83, aa: 56, ang: 40, gd: 59 },
      arete_sup: { re: 47, bh: 78, aa: 38, ang: 35, gd: 47 },
      joues_adv: { re: 26, bh: 52, aa: 76, ang: 97 },
      bouche_adv: { re: 40, bh: 69, aa: 44, ang: 79, gd: 29 },
      bouche_ext: { re: 52, bh: 68, aa: 45, ang: 51 },
      menton_adv: { re: 13, bh: 60, aa: 50, ang: 82, gd: 15 },
      menton_sup: { re: 35, bh: 47, aa: 19, ang: 53, gd: 61 },
      machoire_adv: { re: 16, bh: 14, aa: 100, ang: 16 },
      maxillaire: { re: 57, bh: 47, aa: 61, ang: 86 },
      mandibule: { re: 18, bh: 41, aa: 55, ang: 99 },
    },
    ratios_cibles: { nez: 0.483, machoire: 0.808, joues: 0.897, bouche: 0.402, yeux: 0.064, sourcils: 0.131, eyebrowGap: 0.182, lipFullness: 0.104, noseFlare: 9.472, philtrum: 0.082, cheekProminence: 1.053, eyeHeightPos: 0.427 },
    notes: ''
  },
  {
    position: 29,
    preset_id: 1004,
    // ── Labels morpho ──
    couleur_peau: "Claire-bronzée",
    forme_visage: "Ovale",
    peau_detail: "Claire",
    forme_detail: "Long",
    machoire_label: "Moyenne",
    levres_label: "Moyennes",
    nez_label: "Large",
    pommettes_label: "Moyennes",
    front_label: "Étroit",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 74, bas_haut: 33,
        neutre_avant: 70, arrondi_angulaire: 100,
        gauche_droite: 68
      },
      front_superieur: {
        reduire_elargir: 54, arriere_avant: 42,
        neutre_haut: 11, arrondi_angulaire: 76,
        gauche_droite: 42
      },
      sourcils: {
        reduire_elargir: 46, bas_haut: 61,
        arriere_avant: 59, arrondi_angulaire: 55
      },
      orbites: {
        reduire_elargir: 46, bas_haut: 37,
        arriere_avant: 55, plus_grande_petite: 90
      },
      oreilles: {
        reduire_elargir: 33, bas_haut: 66,
        arriere_avant: 27, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 48, bas_haut: 34,
        arriere_avant: 49, arrondi_angulaire: 49,
        gauche_droite: 51
      },
      joues: {
        reduire_elargir: 80, bas_haut: 73,
        arriere_avant: 64, arrondi_angulaire: 26
      },
      bouche: {
        reduire_elargir: 75, bas_haut: 53,
        arriere_avant: 49, arrondi_angulaire: 100,
        gauche_droite: 17
      },
      menton: {
        reduire_elargir: 72, bas_haut: 79,
        arriere_avant: 67, arrondi_angulaire: 0,
        gauche_droite: 55
      },
      machoire: {
        reduire_elargir: 100, bas_haut: 75,
        arriere_avant: 97, arrondi_angulaire: 42
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 74, bh: 33, na: 70, aa: 100, gd: 68 },
      couronne: { re: 89, bh: 30, aa: 45, nr: 0, gd: 48 },
      arriere_crane: { re: 60, bh: 67, aa: 49, ang: 18, gd: 63 },
      tempes: { re: 31, bh: 44, aa: 47, ang: 22 },
      front_sup: { re: 54, aa: 42, nh: 11, ang: 76, gd: 42 },
      front_inf: { re: 49, bh: 39, aa: 58, ang: 71 },
      sourcils: { re: 46, bh: 61, aa: 59, ang: 55 },
      sourcils_ctr: { re: 57, bh: 38, aa: 30, ang: 57, gd: 49 },
      sourcils_ext: { re: 53, bh: 33, aa: 43, ang: 85 },
      yeux: { re: 49, bh: 51, aa: 53, ang: 50 },
      orbites: { re: 46, bh: 37, aa: 55, gp: 90 },
      nez_adv: { re: 48, bh: 34, aa: 49, ang: 49, gd: 51 },
      arete_cotes: { re: 21, bh: 32, aa: 23, ang: 63 },
      arete_centrale: { re: 41, bh: 63, aa: 55, ang: 30, gd: 44 },
      arete_sup: { re: 31, bh: 16, aa: 54, ang: 0, gd: 51 },
      joues_adv: { re: 80, bh: 73, aa: 64, ang: 26 },
      bouche_adv: { re: 75, bh: 53, aa: 49, ang: 100, gd: 17 },
      bouche_ext: { re: 33, bh: 44, aa: 61, ang: 38 },
      menton_adv: { re: 72, bh: 79, aa: 67, ang: 0, gd: 55 },
      menton_sup: { re: 53, bh: 87, aa: 30, ang: 43, gd: 41 },
      machoire_adv: { re: 100, bh: 75, aa: 97, ang: 42 },
      maxillaire: { re: 38, bh: 36, aa: 72, ang: 25 },
      mandibule: { re: 26, bh: 70, aa: 97, ang: 82 },
    },
    ratios_cibles: { nez: 0.473, machoire: 0.808, joues: 0.904, bouche: 0.372, yeux: 0.061, sourcils: 0.139, eyebrowGap: 0.178, lipFullness: 0.093, noseFlare: 10.536, philtrum: 0.085, cheekProminence: 1.058, eyeHeightPos: 0.467 },
    notes: ''
  },
  {
    position: 30,
    preset_id: 1005,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Rond",
    peau_detail: "Claire-bronzée",
    forme_detail: "Ovale",
    machoire_label: "Moyenne",
    levres_label: "Moyennes",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Large",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 58, bas_haut: 15,
        neutre_avant: 100, arrondi_angulaire: 0,
        gauche_droite: 77
      },
      front_superieur: {
        reduire_elargir: 43, arriere_avant: 14,
        neutre_haut: 77, arrondi_angulaire: 89,
        gauche_droite: 50
      },
      sourcils: {
        reduire_elargir: 56, bas_haut: 78,
        arriere_avant: 67, arrondi_angulaire: 97
      },
      orbites: {
        reduire_elargir: 42, bas_haut: 40,
        arriere_avant: 90, plus_grande_petite: 64
      },
      oreilles: {
        reduire_elargir: 77, bas_haut: 94,
        arriere_avant: 27, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 25, bas_haut: 62,
        arriere_avant: 42, arrondi_angulaire: 30,
        gauche_droite: 61
      },
      joues: {
        reduire_elargir: 100, bas_haut: 71,
        arriere_avant: 90, arrondi_angulaire: 0
      },
      bouche: {
        reduire_elargir: 80, bas_haut: 55,
        arriere_avant: 33, arrondi_angulaire: 100,
        gauche_droite: 29
      },
      menton: {
        reduire_elargir: 4, bas_haut: 62,
        arriere_avant: 26, arrondi_angulaire: 0,
        gauche_droite: 54
      },
      machoire: {
        reduire_elargir: 100, bas_haut: 28,
        arriere_avant: 6, arrondi_angulaire: 49
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 58, bh: 15, na: 100, aa: 0, gd: 77 },
      couronne: { re: 100, bh: 7, aa: 100, nr: 100, gd: 49 },
      arriere_crane: { re: 45, bh: 9, aa: 85, ang: 47, gd: 36 },
      tempes: { re: 30, bh: 86, aa: 42, ang: 0 },
      front_sup: { re: 43, aa: 14, nh: 77, ang: 89, gd: 50 },
      front_inf: { re: 78, bh: 49, aa: 44, ang: 83 },
      sourcils: { re: 56, bh: 78, aa: 67, ang: 97 },
      sourcils_ctr: { re: 72, bh: 91, aa: 24, ang: 89, gd: 55 },
      sourcils_ext: { re: 28, bh: 100, aa: 35, ang: 100 },
      yeux: { re: 100, bh: 100, aa: 46, ang: 50 },
      orbites: { re: 42, bh: 40, aa: 90, gp: 64 },
      nez_adv: { re: 25, bh: 62, aa: 42, ang: 30, gd: 61 },
      arete_cotes: { re: 39, bh: 31, aa: 0, ang: 67 },
      arete_centrale: { re: 49, bh: 0, aa: 46, ang: 47, gd: 52 },
      arete_sup: { re: 5, bh: 40, aa: 46, ang: 22, gd: 63 },
      joues_adv: { re: 100, bh: 71, aa: 90, ang: 0 },
      bouche_adv: { re: 80, bh: 55, aa: 33, ang: 100, gd: 29 },
      bouche_ext: { re: 62, bh: 60, aa: 46, ang: 46 },
      menton_adv: { re: 4, bh: 62, aa: 26, ang: 0, gd: 54 },
      menton_sup: { re: 27, bh: 19, aa: 54, ang: 62, gd: 49 },
      machoire_adv: { re: 100, bh: 28, aa: 6, ang: 49 },
      maxillaire: { re: 33, bh: 54, aa: 54, ang: 42 },
      mandibule: { re: 50, bh: 43, aa: 72, ang: 12 },
    },
    ratios_cibles: { nez: 0.463, machoire: 0.805, joues: 0.895, bouche: 0.37, yeux: 0.067, sourcils: 0.135, eyebrowGap: 0.183, lipFullness: 0.098, noseFlare: 9.716, philtrum: 0.085, cheekProminence: 1.05, eyeHeightPos: 0.45 },
    notes: ''
  },
  {
    position: 31,
    preset_id: 1006,
    // ── Labels morpho ──
    couleur_peau: "Claire",
    forme_visage: "Carré",
    peau_detail: "Claire",
    forme_detail: "Carré",
    machoire_label: "Moyenne",
    levres_label: "Fines",
    nez_label: "Moyen",
    pommettes_label: "Moyennes",
    front_label: "Moyen",
    // ── Façonnage simple ──
    faconner: {
      crane: {
        reduire_elargir: 34, bas_haut: 70,
        neutre_avant: 44, arrondi_angulaire: 92,
        gauche_droite: 52
      },
      front_superieur: {
        reduire_elargir: 67, arriere_avant: 51,
        neutre_haut: 40, arrondi_angulaire: 74,
        gauche_droite: 60
      },
      sourcils: {
        reduire_elargir: 58, bas_haut: 39,
        arriere_avant: 64, arrondi_angulaire: 59
      },
      orbites: {
        reduire_elargir: 35, bas_haut: 37,
        arriere_avant: 55, plus_grande_petite: 98
      },
      oreilles: {
        reduire_elargir: 53, bas_haut: 87,
        arriere_avant: 64, plus_grande_petite: 50,
        gauche_droite: 50
      },
      nez: {
        reduire_elargir: 32, bas_haut: 66,
        arriere_avant: 39, arrondi_angulaire: 69,
        gauche_droite: 45
      },
      joues: {
        reduire_elargir: 34, bas_haut: 31,
        arriere_avant: 74, arrondi_angulaire: 38
      },
      bouche: {
        reduire_elargir: 58, bas_haut: 87,
        arriere_avant: 15, arrondi_angulaire: 90,
        gauche_droite: 22
      },
      menton: {
        reduire_elargir: 35, bas_haut: 88,
        arriere_avant: 74, arrondi_angulaire: 15,
        gauche_droite: 34
      },
      machoire: {
        reduire_elargir: 13, bas_haut: 0,
        arriere_avant: 100, arrondi_angulaire: 0
      }
    },
    // ── Façonnage Avancé ──
    avance: {
      crane: { re: 34, bh: 70, na: 44, aa: 92, gd: 52 },
      couronne: { re: 65, bh: 20, aa: 32, nr: 0, gd: 50 },
      arriere_crane: { re: 92, bh: 54, aa: 46, ang: 81, gd: 54 },
      tempes: { re: 62, bh: 50, aa: 50, ang: 37 },
      front_sup: { re: 67, aa: 51, nh: 40, ang: 74, gd: 60 },
      front_inf: { re: 30, bh: 18, aa: 58, ang: 19 },
      sourcils: { re: 58, bh: 39, aa: 64, ang: 59 },
      sourcils_ctr: { re: 67, bh: 10, aa: 32, ang: 32, gd: 63 },
      sourcils_ext: { re: 45, bh: 13, aa: 40, ang: 38 },
      yeux: { re: 37, bh: 43, aa: 49, ang: 50 },
      orbites: { re: 35, bh: 37, aa: 55, gp: 98 },
      nez_adv: { re: 32, bh: 66, aa: 39, ang: 69, gd: 45 },
      arete_cotes: { re: 44, bh: 32, aa: 38, ang: 34 },
      arete_centrale: { re: 33, bh: 58, aa: 49, ang: 37, gd: 54 },
      arete_sup: { re: 43, bh: 37, aa: 51, ang: 41, gd: 65 },
      joues_adv: { re: 34, bh: 31, aa: 74, ang: 38 },
      bouche_adv: { re: 58, bh: 87, aa: 15, ang: 90, gd: 22 },
      bouche_ext: { re: 40, bh: 55, aa: 70, ang: 58 },
      menton_adv: { re: 35, bh: 88, aa: 74, ang: 15, gd: 34 },
      menton_sup: { re: 38, bh: 57, aa: 55, ang: 49, gd: 33 },
      machoire_adv: { re: 13, bh: 0, aa: 100, ang: 0 },
      maxillaire: { re: 8, bh: 35, aa: 57, ang: 57 },
      mandibule: { re: 46, bh: 56, aa: 38, ang: 26 },
    },
    ratios_cibles: { nez: 0.462, machoire: 0.799, joues: 0.894, bouche: 0.36, yeux: 0.06, sourcils: 0.139, eyebrowGap: 0.192, lipFullness: 0.097, noseFlare: 10.968, philtrum: 0.087, cheekProminence: 1.04, eyeHeightPos: 0.465 },
    notes: ''
  },
];

if (typeof module !== "undefined") module.exports = { PRESETS_DB };