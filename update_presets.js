// Scanned statistics from mode experte.md
const SCANNED_DATA = {
  9: {
    "base": {"width": 0.642, "height": 0.737, "volume": 1.354},
    "front": {"height": 0.252, "width": 0.801},
    "sourcils": {"width": 0.801, "height": 0.099, "angle": -0.003},
    "yeux": {"width": 0.847, "spacing": 0.337, "height": 0.099},
    "nez": {"width": 0.17, "height": 0.228, "projection": 0.11, "volume": 0.032, "narine": 0.165},
    "joues": {"width": 1.354, "height": 0.703, "volume": 1.259},
    "bouche": {"width": 0.455, "height": 0.099, "volume": 0.023},
    "menton": {"height": 0.181, "width": 1.075},
    "machoire": {"width": 1.163, "height": 0.207, "angle": 0.327}
  },
  17: {
    "base": {"width": 0.615, "height": 0.723, "volume": 1.227},
    "front": {"height": 0.255, "width": 0.729},
    "sourcils": {"width": 0.729, "height": 0.101, "angle": -0.006},
    "yeux": {"width": 0.791, "spacing": 0.32, "height": 0.101},
    "nez": {"width": 0.16, "height": 0.234, "projection": 0.109, "volume": 0.03, "narine": 0.173},
    "joues": {"width": 1.227, "height": 0.745, "volume": 1.179},
    "bouche": {"width": 0.413, "height": 0.097, "volume": 0.023},
    "menton": {"height": 0.199, "width": 1.041},
    "machoire": {"width": 1.205, "height": 0.264, "angle": 0.408}
  },
  23: {
    "base": {"width": 0.635, "height": 0.764, "volume": 1.145},
    "front": {"height": 0.321, "width": 0.685},
    "sourcils": {"width": 0.685, "height": 0.068, "angle": -0.016},
    "yeux": {"width": 0.737, "spacing": 0.304, "height": 0.068},
    "nez": {"width": 0.156, "height": 0.232, "projection": 0.098, "volume": 0.031, "narine": 0.152},
    "joues": {"width": 1.145, "height": 0.766, "volume": 1.191},
    "bouche": {"width": 0.403, "height": 0.083, "volume": 0.021},
    "menton": {"height": 0.205, "width": 0.961},
    "machoire": {"width": 1.064, "height": 0.225, "angle": 0.371}
  },
  33: {
    "base": {"width": 0.617, "height": 0.777, "volume": 1.256},
    "front": {"height": 0.293, "width": 0.733},
    "sourcils": {"width": 0.733, "height": 0.069, "angle": 0},
    "yeux": {"width": 0.801, "spacing": 0.318, "height": 0.069},
    "nez": {"width": 0.166, "height": 0.228, "projection": 0.106, "volume": 0.026, "narine": 0.142},
    "joues": {"width": 1.256, "height": 0.713, "volume": 1.186},
    "bouche": {"width": 0.428, "height": 0.082, "volume": 0.02},
    "menton": {"height": 0.231, "width": 1.058},
    "machoire": {"width": 1.264, "height": 0.229, "angle": 0.370}
  },
  43: {
    "base": {"width": 0.659, "height": 0.731, "volume": 1.248},
    "front": {"height": 0.253, "width": 0.726},
    "sourcils": {"width": 0.726, "height": 0.079, "angle": -0.01},
    "yeux": {"width": 0.799, "spacing": 0.307, "height": 0.079},
    "nez": {"width": 0.177, "height": 0.226, "projection": 0.067, "volume": 0.032, "narine": 0.137},
    "joues": {"width": 1.248, "height": 0.755, "volume": 1.181},
    "bouche": {"width": 0.437, "height": 0.081, "volume": 0.02},
    "menton": {"height": 0.246, "width": 1.057},
    "machoire": {"width": 1.239, "height": 0.328, "angle": 0.446}
  },
  52: {
    "base": {"width": 0.588, "height": 0.756, "volume": 1.303},
    "front": {"height": 0.254, "width": 0.785},
    "sourcils": {"width": 0.785, "height": 0.089, "angle": -0.01},
    "yeux": {"width": 0.851, "spacing": 0.338, "height": 0.089},
    "nez": {"width": 0.151, "height": 0.245, "projection": 0.099, "volume": 0.031, "narine": 0.156},
    "joues": {"width": 1.303, "height": 0.615, "volume": 1.107},
    "bouche": {"width": 0.501, "height": 0.097, "volume": 0.026},
    "menton": {"height": 0.202, "width": 1.177},
    "machoire": {"width": 1.236, "height": 0.300, "angle": 0.442}
  },
  57: {
    "base": {"width": 0.679, "height": 0.668, "volume": 1.32},
    "front": {"height": 0.186, "width": 0.773},
    "sourcils": {"width": 0.773, "height": 0.102, "angle": 0.011},
    "yeux": {"width": 0.834, "spacing": 0.36, "height": 0.102},
    "nez": {"width": 0.184, "height": 0.245, "projection": 0.09, "volume": 0.033, "narine": 0.141},
    "joues": {"width": 1.32, "height": 0.832, "volume": 1.186},
    "bouche": {"width": 0.434, "height": 0.09, "volume": 0.021},
    "menton": {"height": 0.221, "width": 1.113},
    "machoire": {"width": 1.217, "height": 0.232, "angle": 0.330}
  },
  93: {
    "base": {"width": 0.526, "height": 0.831, "volume": 1.341},
    "front": {"height": 0.282, "width": 0.817},
    "sourcils": {"width": 0.817, "height": 0.094, "angle": -0.001},
    "yeux": {"width": 0.896, "spacing": 0.359, "height": 0.094},
    "nez": {"width": 0.218, "height": 0.216, "projection": 0.075, "volume": 0.037, "narine": 0.196},
    "joues": {"width": 1.341, "height": 0.589, "volume": 1.06},
    "bouche": {"width": 0.582, "height": 0.133, "volume": 0.04},
    "menton": {"height": 0.215, "width": 1.265},
    "machoire": {"width": 1.219, "height": 0.285, "angle": 0.434}
  },
  99: {
    "base": {"width": 0.599, "height": 0.746, "volume": 1.292},
    "front": {"height": 0.259, "width": 0.768},
    "sourcils": {"width": 0.768, "height": 0.079, "angle": -0.006},
    "yeux": {"width": 0.817, "spacing": 0.312, "height": 0.079},
    "nez": {"width": 0.172, "height": 0.224, "projection": 0.103, "volume": 0.03, "narine": 0.147},
    "joues": {"width": 1.292, "height": 0.693, "volume": 1.144},
    "bouche": {"width": 0.489, "height": 0.089, "volume": 0.024},
    "menton": {"height": 0.198, "width": 1.129},
    "machoire": {"width": 1.129, "height": 0.256, "angle": 0.413}
  },
  116: {
    "base": {"width": 0.723, "height": 0.722, "volume": 1.218},
    "front": {"height": 0.193, "width": 0.705},
    "sourcils": {"width": 0.705, "height": 0.115, "angle": -0.017},
    "yeux": {"width": 0.824, "spacing": 0.323, "height": 0.115},
    "nez": {"width": 0.241, "height": 0.247, "projection": 0.129, "volume": 0.044, "narine": 0.224},
    "joues": {"width": 1.218, "height": 0.73, "volume": 1.119},
    "bouche": {"width": 0.48, "height": 0.135, "volume": 0.037},
    "menton": {"height": 0.202, "width": 1.089},
    "machoire": {"width": 1.089, "height": 0.249, "angle": 0.36}
  },
  134: {
    "base": {"width": 0.71, "height": 0.674, "volume": 1.259},
    "front": {"height": 0.21, "width": 0.688},
    "sourcils": {"width": 0.688, "height": 0.077, "angle": 0.008},
    "yeux": {"width": 0.787, "spacing": 0.313, "height": 0.077},
    "nez": {"width": 0.173, "height": 0.241, "projection": 0.094, "volume": 0.032, "narine": 0.159},
    "joues": {"width": 1.259, "height": 0.807, "volume": 1.113},
    "bouche": {"width": 0.39, "height": 0.109, "volume": 0.024},
    "menton": {"height": 0.213, "width": 1.131},
    "machoire": {"width": 1.131, "height": 0.268, "angle": 0.376}
  },
  151: {
    "base": {"width": 0.729, "height": 0.74, "volume": 1.092},
    "front": {"height": 0.294, "width": 0.672},
    "sourcils": {"width": 0.672, "height": 0.076, "angle": -0.013},
    "yeux": {"width": 0.775, "spacing": 0.319, "height": 0.076},
    "nez": {"width": 0.222, "height": 0.229, "projection": 0.105, "volume": 0.039, "narine": 0.2},
    "joues": {"width": 1.092, "height": 0.734, "volume": 1.127},
    "bouche": {"width": 0.44, "height": 0.144, "volume": 0.041},
    "menton": {"height": 0.159, "width": 0.969},
    "machoire": {"width": 0.969, "height": 0.269, "angle": 0.416}
  },
  170: {
    "base": {"width": 0.578, "height": 0.786, "volume": 1.433},
    "front": {"height": 0.266, "width": 0.773},
    "sourcils": {"width": 0.773, "height": 0.082, "angle": -0.001},
    "yeux": {"width": 0.877, "spacing": 0.36, "height": 0.082},
    "nez": {"width": 0.177, "height": 0.238, "projection": 0.079, "volume": 0.033, "narine": 0.143},
    "joues": {"width": 1.433, "height": 0.642, "volume": 1.18},
    "bouche": {"width": 0.463, "height": 0.094, "volume": 0.021},
    "menton": {"height": 0.2, "width": 1.215},
    "machoire": {"width": 1.215, "height": 0.223, "angle": 0.361}
  },
  175: {
    "base": {"width": 0.633, "height": 0.755, "volume": 1.23},
    "front": {"height": 0.233, "width": 0.67},
    "sourcils": {"width": 0.67, "height": 0.101, "angle": -0.015},
    "yeux": {"width": 0.772, "spacing": 0.315, "height": 0.101},
    "nez": {"width": 0.209, "height": 0.219, "projection": 0.082, "volume": 0.034, "narine": 0.175},
    "joues": {"width": 1.23, "height": 0.701, "volume": 1.101},
    "bouche": {"width": 0.442, "height": 0.127, "volume": 0.032},
    "menton": {"height": 0.208, "width": 1.117},
    "machoire": {"width": 1.117, "height": 0.267, "angle": 0.412}
  },
  202: {
    "base": {"width": 0.591, "height": 0.751, "volume": 1.437},
    "front": {"height": 0.274, "width": 0.804},
    "sourcils": {"width": 0.804, "height": 0.089, "angle": 0},
    "yeux": {"width": 0.941, "spacing": 0.378, "height": 0.089},
    "nez": {"width": 0.186, "height": 0.229, "projection": 0.081, "volume": 0.029, "narine": 0.15},
    "joues": {"width": 1.437, "height": 0.664, "volume": 1.098},
    "bouche": {"width": 0.51, "height": 0.06, "volume": 0.015},
    "menton": {"height": 0.243, "width": 1.309},
    "machoire": {"width": 1.309, "height": 0.206, "angle": 0.312}
  },
  203: {
    "base": {"width": 0.614, "height": 0.754, "volume": 1.298},
    "front": {"height": 0.295, "width": 0.666},
    "sourcils": {"width": 0.666, "height": 0.067, "angle": -0.009},
    "yeux": {"width": 0.816, "spacing": 0.342, "height": 0.067},
    "nez": {"width": 0.18, "height": 0.236, "projection": 0.088, "volume": 0.03, "narine": 0.154},
    "joues": {"width": 1.298, "height": 0.657, "volume": 1.145},
    "bouche": {"width": 0.43, "height": 0.097, "volume": 0.022},
    "menton": {"height": 0.199, "width": 1.134},
    "machoire": {"width": 1.134, "height": 0.195, "angle": 0.327}
  },
  226: {
    "base": {"width": 0.56, "height": 0.812, "volume": 1.314},
    "front": {"height": 0.32, "width": 0.816},
    "sourcils": {"width": 0.816, "height": 0.082, "angle": -0.001},
    "yeux": {"width": 0.888, "spacing": 0.351, "height": 0.082},
    "nez": {"width": 0.246, "height": 0.223, "projection": 0.1, "volume": 0.037, "narine": 0.2},
    "joues": {"width": 1.314, "height": 0.699, "volume": 1.188},
    "bouche": {"width": 0.534, "height": 0.134, "volume": 0.038},
    "menton": {"height": 0.173, "width": 1.106},
    "machoire": {"width": 1.106, "height": 0.166, "angle": 0.315}
  },
  236: {
    "base": {"width": 0.614, "height": 0.758, "volume": 1.24},
    "front": {"height": 0.241, "width": 0.743},
    "sourcils": {"width": 0.743, "height": 0.097, "angle": -0.02},
    "yeux": {"width": 0.871, "spacing": 0.351, "height": 0.097},
    "nez": {"width": 0.16, "height": 0.253, "projection": 0.07, "volume": 0.035, "narine": 0.141},
    "joues": {"width": 1.24, "height": 0.614, "volume": 1.065},
    "bouche": {"width": 0.43, "height": 0.095, "volume": 0.023},
    "menton": {"height": 0.218, "width": 1.164},
    "machoire": {"width": 1.164, "height": 0.256, "angle": 0.396}
  },
  241: {
    "base": {"width": 0.697, "height": 0.767, "volume": 1.194},
    "front": {"height": 0.299, "width": 0.61},
    "sourcils": {"width": 0.61, "height": 0.089, "angle": -0.009},
    "yeux": {"width": 0.734, "spacing": 0.305, "height": 0.089},
    "nez": {"width": 0.153, "height": 0.223, "projection": 0.129, "volume": 0.03, "narine": 0.157},
    "joues": {"width": 1.194, "height": 0.638, "volume": 1.253},
    "bouche": {"width": 0.41, "height": 0.086, "volume": 0.021},
    "menton": {"height": 0.199, "width": 0.953},
    "machoire": {"width": 0.953, "height": 0.17, "angle": 0.303}
  },
  249: {
    "base": {"width": 0.577, "height": 0.785, "volume": 1.282},
    "front": {"height": 0.308, "width": 0.798},
    "sourcils": {"width": 0.798, "height": 0.086, "angle": -0.006},
    "yeux": {"width": 0.828, "spacing": 0.321, "height": 0.086},
    "nez": {"width": 0.177, "height": 0.23, "projection": 0.081, "volume": 0.033, "narine": 0.176},
    "joues": {"width": 1.282, "height": 0.577, "volume": 1.062},
    "bouche": {"width": 0.521, "height": 0.106, "volume": 0.03},
    "menton": {"height": 0.205, "width": 1.207},
    "machoire": {"width": 1.207, "height": 0.229, "angle": 0.369}
  },
  260: {
    "base": {"width": 0.629, "height": 0.792, "volume": 1.306},
    "front": {"height": 0.271, "width": 0.644},
    "sourcils": {"width": 0.644, "height": 0.078, "angle": 0},
    "yeux": {"width": 0.861, "spacing": 0.324, "height": 0.078},
    "nez": {"width": 0.177, "height": 0.254, "projection": 0.116, "volume": 0.036, "narine": 0.183},
    "joues": {"width": 1.306, "height": 0.565, "volume": 1.116},
    "bouche": {"width": 0.504, "height": 0.102, "volume": 0.027},
    "menton": {"height": 0.205, "width": 1.171},
    "machoire": {"width": 1.171, "height": 0.254, "angle": 0.384}
  },
  268: {
    "base": {"width": 0.708, "height": 0.706, "volume": 1.202},
    "front": {"height": 0.214, "width": 0.736},
    "sourcils": {"width": 0.736, "height": 0.11, "angle": -0.004},
    "yeux": {"width": 0.8, "spacing": 0.325, "height": 0.11},
    "nez": {"width": 0.169, "height": 0.245, "projection": 0.081, "volume": 0.036, "narine": 0.171},
    "joues": {"width": 1.202, "height": 0.645, "volume": 1.08},
    "bouche": {"width": 0.448, "height": 0.128, "volume": 0.033},
    "menton": {"height": 0.185, "width": 1.113},
    "machoire": {"width": 1.113, "height": 0.352, "angle": 0.464}
  },
  294: {
    "base": {"width": 0.683, "height": 0.711, "volume": 1.261},
    "front": {"height": 0.256, "width": 0.698},
    "sourcils": {"width": 0.698, "height": 0.099, "angle": 0.01},
    "yeux": {"width": 0.814, "spacing": 0.332, "height": 0.099},
    "nez": {"width": 0.17, "height": 0.305, "projection": 0.067, "volume": 0.042, "narine": 0.156},
    "joues": {"width": 1.261, "height": 0.696, "volume": 1.179},
    "bouche": {"width": 0.411, "height": 0.064, "volume": 0.015},
    "menton": {"height": 0.21, "width": 1.069},
    "machoire": {"width": 1.069, "height": 0.191, "angle": 0.304}
  },
  299: {
    "base": {"width": 0.608, "height": 0.71, "volume": 1.387},
    "front": {"height": 0.255, "width": 0.782},
    "sourcils": {"width": 0.782, "height": 0.099, "angle": -0.008},
    "yeux": {"width": 0.919, "spacing": 0.349, "height": 0.099},
    "nez": {"width": 0.181, "height": 0.251, "projection": 0.092, "volume": 0.041, "narine": 0.158},
    "joues": {"width": 1.387, "height": 0.62, "volume": 1.082},
    "bouche": {"width": 0.562, "height": 0.12, "volume": 0.034},
    "menton": {"height": 0.191, "width": 1.281},
    "machoire": {"width": 1.281, "height": 0.268, "angle": 0.384}
  },
  304: {
    "base": {"width": 0.653, "height": 0.695, "volume": 1.332},
    "front": {"height": 0.203, "width": 0.628},
    "sourcils": {"width": 0.628, "height": 0.104, "angle": 0},
    "yeux": {"width": 0.867, "spacing": 0.354, "height": 0.104},
    "nez": {"width": 0.177, "height": 0.256, "projection": 0.123, "volume": 0.036, "narine": 0.162},
    "joues": {"width": 1.332, "height": 0.692, "volume": 1.141},
    "bouche": {"width": 0.482, "height": 0.109, "volume": 0.028},
    "menton": {"height": 0.197, "width": 1.167},
    "machoire": {"width": 1.167, "height": 0.219, "angle": 0.333}
  },
  1001: {
    "base": {"width": 0.583, "height": 0.742, "volume": 1.305},
    "front": {"height": 0.225, "width": 0.727},
    "sourcils": {"width": 0.727, "height": 0.092, "angle": 0.007},
    "yeux": {"width": 0.828, "spacing": 0.315, "height": 0.092},
    "nez": {"width": 0.159, "height": 0.253, "projection": 0.097, "volume": 0.029, "narine": 0.152},
    "joues": {"width": 1.305, "height": 0.612, "volume": 1.125},
    "bouche": {"width": 0.437, "height": 0.064, "volume": 0.015},
    "menton": {"height": 0.255, "width": 1.16},
    "machoire": {"width": 1.16, "height": 0.235, "angle": 0.386}
  },
  1002: {
    "base": {"width": 0.591, "height": 0.824, "volume": 1.28},
    "front": {"height": 0.272, "width": 0.748},
    "sourcils": {"width": 0.748, "height": 0.098, "angle": 0},
    "yeux": {"width": 0.832, "spacing": 0.339, "height": 0.098},
    "nez": {"width": 0.198, "height": 0.264, "projection": 0.088, "volume": 0.039, "narine": 0.174},
    "joues": {"width": 1.28, "height": 0.571, "volume": 1.117},
    "bouche": {"width": 0.557, "height": 0.113, "volume": 0.035},
    "menton": {"height": 0.187, "width": 1.145},
    "machoire": {"width": 1.145, "height": 0.211, "angle": 0.355}
  },
  1003: {
    "base": {"width": 0.643, "height": 0.754, "volume": 1.267},
    "front": {"height": 0.251, "width": 0.676},
    "sourcils": {"width": 0.676, "height": 0.089, "angle": -0.002},
    "yeux": {"width": 0.792, "spacing": 0.316, "height": 0.089},
    "nez": {"width": 0.166, "height": 0.249, "projection": 0.086, "volume": 0.032, "narine": 0.152},
    "joues": {"width": 1.267, "height": 0.567, "volume": 1.1},
    "bouche": {"width": 0.499, "height": 0.094, "volume": 0.026},
    "menton": {"height": 0.218, "width": 1.152},
    "machoire": {"width": 1.152, "height": 0.265, "angle": 0.395}
  },
  1004: {
    "base": {"width": 0.699, "height": 0.721, "volume": 1.203},
    "front": {"height": 0.241, "width": 0.627},
    "sourcils": {"width": 0.627, "height": 0.097, "angle": -0.01},
    "yeux": {"width": 0.756, "spacing": 0.298, "height": 0.097},
    "nez": {"width": 0.165, "height": 0.274, "projection": 0.122, "volume": 0.036, "narine": 0.185},
    "joues": {"width": 1.203, "height": 0.578, "volume": 1.093},
    "bouche": {"width": 0.441, "height": 0.084, "volume": 0.021},
    "menton": {"height": 0.218, "width": 1.101},
    "machoire": {"width": 1.101, "height": 0.242, "angle": 0.36}
  },
  1005: {
    "base": {"width": 0.627, "height": 0.875, "volume": 1.192},
    "front": {"height": 0.331, "width": 0.622},
    "sourcils": {"width": 0.622, "height": 0.09, "angle": -0.002},
    "yeux": {"width": 0.731, "spacing": 0.291, "height": 0.09},
    "nez": {"width": 0.149, "height": 0.221, "projection": 0.109, "volume": 0.027, "narine": 0.134},
    "joues": {"width": 1.192, "height": 0.497, "volume": 1.101},
    "bouche": {"width": 0.418, "height": 0.081, "volume": 0.02},
    "menton": {"height": 0.18, "width": 1.083},
    "machoire": {"width": 1.083, "height": 0.208, "angle": 0.35}
  },
  1006: {
    "base": {"width": 0.614, "height": 0.768, "volume": 1.239},
    "front": {"height": 0.282, "width": 0.697},
    "sourcils": {"width": 0.697, "height": 0.093, "angle": -0.004},
    "yeux": {"width": 0.797, "spacing": 0.328, "height": 0.093},
    "nez": {"width": 0.153, "height": 0.231, "projection": 0.097, "volume": 0.03, "narine": 0.133},
    "joues": {"width": 1.239, "height": 0.61, "volume": 1.117},
    "bouche": {"width": 0.439, "height": 0.086, "volume": 0.021},
    "menton": {"height": 0.217, "width": 1.109},
    "machoire": {"width": 1.109, "height": 0.194, "angle": 0.33}
  }
};

console.log("Scanned data loaded. Total presets:", Object.keys(SCANNED_DATA).length);
module.exports = { SCANNED_DATA };
