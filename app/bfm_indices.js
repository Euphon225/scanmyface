// bfm_indices.js — Indices BFM extraits de 3DDFA V2 (session Python mai 2026)
// Mesh BFM : 53215 vertices, 68 keypoints
// Référence mesh moyen : face_w=146148, face_h=132165, face_z=131937

const BFM = {
  // Normalisations
  FACE_W: 146148,
  FACE_H: 132165,
  FACE_Z: 131937,

  // 68 landmarks indices
  KP: [17440, 17716, 17222, 16770, 33981, 34802, 35355, 35777, 36091, 36403, 36806, 37333, 38086, 29006, 28546, 28036, 28276, 29704, 30401, 30791, 30996, 31163, 31902, 32068, 32276, 32670, 33376, 8161, 8177, 8187, 8192, 6515, 7243, 8204, 9163, 9883, 2215, 3886, 4920, 5828, 4801, 3640, 10455, 11353, 12383, 14066, 12653, 11492, 5522, 6025, 7495, 8215, 8935, 10395, 10795, 9555, 8836, 8236, 7636, 6915, 5909, 7384, 8223, 9064, 10537, 8829, 8229, 7629],

  // Régions clés pour sliders FC26
  REGIONS: {
    jaw_left:       [17440, 17716, 17222, 16770, 33981, 34802, 35355, 35777, 36091],
    jaw_right:      [36091, 36403, 36806, 37333, 38086, 29006, 28546, 28036, 28276],
    chin:           36091,
    brow_left:      [29704, 30401, 30791, 30996, 31163],
    brow_right:     [31902, 32068, 32276, 32670, 33376],
    nose_bridge:    [8161, 8177, 8187, 8192],
    nose_tip:       8192,
    nose_root:      8161,
    nose_nostrils:  [6515, 7243, 8204, 9163, 9883],
    eye_left:       [2215, 3886, 4920, 5828, 4801, 3640],
    eye_right:      [10455, 11353, 12383, 14066, 12653, 11492],
    mouth_left:     5522,
    mouth_right:    10795,
    mouth_top:      8215,
    mouth_bottom:   8236,
    mouth_outer:    [5522, 6025, 7495, 8215, 8935, 10395, 10795, 9555, 8836, 8236, 7636, 6915],
    mouth_inner:    [5909, 7384, 8223, 9064, 10537, 8829, 8229, 7629],
  },

  // Profondeurs Z de référence (mesh moyen, unités BFM)
  Z_REF: {
    nose_tip:    131937,
    nose_root:   111411,
    chin:         96280,
    jaw:          17761,
    eye:          93282,
    mouth_corner: 99206,
    mouth_top:   117079,
    brow:         97584,
  },

  // Angle mâchoire de référence (mesh moyen)
  JAW_ANGLE_REF: 58.3,
};
