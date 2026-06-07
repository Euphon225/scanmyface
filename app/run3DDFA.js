// run3DDFA.js — Pipeline 3DDFA V2 ONNX in-browser
// Input  : HTMLImageElement | HTMLCanvasElement | HTMLVideoElement (visage déjà cropé)
// Output : { pose:{yaw,pitch,roll,tx,ty,scale}, shape:Float32Array(40), expr:Float32Array(10), raw:Float32Array(62) }
//
// Dépendances :
//   - onnxruntime-web (window.ort) chargé via CDN avant ce script
//   - ./3ddfa_mb1.onnx (12 Mo, MIT — cleardusk/3DDFA_V2) à la racine de app/
//   - ./3ddfa_params.json — { mean:[62], std:[62] } : statistiques de centrage/réduction
//     des 62 sorties du réseau (12 caméra + 40 shape + 10 expr), nécessaires pour
//     reconstruire la matrice caméra → pose.R. Origine : 300W-LP, redistribuées par
//     cleardusk/3DDFA_V2 sous MIT. Pas de donnée mesh BFM ici (audit licence 29 mai 2026).
//
// Note licence : les indices/vertex BFM ont été retirés du projet (suppression de
// bfm_indices.js le 29 mai 2026). Le reste du pipeline 3DDFA est sous MIT, OK commercial.

(function () {
  'use strict';

  const MODEL_URL  = './3ddfa_mb1.onnx';
  const PARAMS_URL = './3ddfa_params.json';
  const ORT_WASM_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/';

  const INPUT_SIZE = 120;
  const PIXEL_MEAN = 127.5;
  const PIXEL_STD  = 128.0;

  let _session = null;
  let _paramStats = null;     // { mean: Float32Array(62), std: Float32Array(62) }
  let _loadingPromise = null;

  // -------- Loading (idempotent, cached) --------
  async function load3DDFA() {
    if (_session && _paramStats) return;
    if (_loadingPromise) return _loadingPromise;

    _loadingPromise = (async () => {
      if (typeof ort === 'undefined') {
        throw new Error('[3DDFA] onnxruntime-web non chargé — vérifier <script src="…ort.min.js"> dans index.html');
      }
      ort.env.wasm.wasmPaths = ORT_WASM_BASE;
      // Single-thread WASM : pas de COOP/COEP requis sur Vercel
      ort.env.wasm.numThreads = 1;

      const [session, statsRes] = await Promise.all([
        ort.InferenceSession.create(MODEL_URL, {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
        }),
        fetch(PARAMS_URL),
      ]);

      _session = session;

      if (!statsRes.ok) {
        console.warn('[3DDFA] 3ddfa_params.json introuvable — params retournés non-dénormalisés');
        _paramStats = { mean: new Float32Array(62), std: new Float32Array(62).fill(1) };
      } else {
        const j = await statsRes.json();
        if (!Array.isArray(j.mean) || !Array.isArray(j.std) || j.mean.length !== 62 || j.std.length !== 62) {
          throw new Error('[3DDFA] 3ddfa_params.json invalide — attendu { mean:[62], std:[62] }');
        }
        _paramStats = { mean: Float32Array.from(j.mean), std: Float32Array.from(j.std) };
      }

      console.log('[3DDFA] modèle chargé · inputs:', session.inputNames, '· outputs:', session.outputNames);
    })();

    try {
      await _loadingPromise;
    } finally {
      _loadingPromise = null;
    }
  }

  // -------- Preprocess : resize 120×120, BGR, (x-127.5)/128, CHW --------
  function preprocess(srcEl) {
    const canvas = document.createElement('canvas');
    canvas.width = INPUT_SIZE;
    canvas.height = INPUT_SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(srcEl, 0, 0, INPUT_SIZE, INPUT_SIZE);
    const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);

    const plane = INPUT_SIZE * INPUT_SIZE;
    const chw = new Float32Array(3 * plane);

    // 3DDFA V2 (TDDFA_ONNX.py) consomme l'image en convention OpenCV : BGR + (x-127.5)/128
    for (let i = 0; i < plane; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      chw[i]             = (b - PIXEL_MEAN) / PIXEL_STD; // B
      chw[plane + i]     = (g - PIXEL_MEAN) / PIXEL_STD; // G
      chw[2 * plane + i] = (r - PIXEL_MEAN) / PIXEL_STD; // R
    }

    return new ort.Tensor('float32', chw, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  }

  // -------- Denormalize : real = raw * std + mean --------
  function denormalize(raw) {
    const { mean, std } = _paramStats;
    const out = new Float32Array(62);
    for (let i = 0; i < 62; i++) out[i] = raw[i] * std[i] + mean[i];
    return out;
  }

  // -------- Pose : décomposition de la matrice caméra 3x4 [sR|t] --------
  //   P2sRt depuis 3DDFA_V2/utils/tddfa_util.py
  function extractPose(params) {
    // P (3x4) row-major dans params[0..11]
    const P = [
      [params[0], params[1], params[2],  params[3]],
      [params[4], params[5], params[6],  params[7]],
      [params[8], params[9], params[10], params[11]],
    ];
    const tx = P[0][3], ty = P[1][3], tz = P[2][3];

    const n1 = Math.hypot(P[0][0], P[0][1], P[0][2]);
    const n2 = Math.hypot(P[1][0], P[1][1], P[1][2]);
    const scale = (n1 + n2) / 2;

    const r1 = [P[0][0] / n1, P[0][1] / n1, P[0][2] / n1];
    const r2 = [P[1][0] / n2, P[1][1] / n2, P[1][2] / n2];
    // r3 = r1 × r2
    const r3 = [
      r1[1] * r2[2] - r1[2] * r2[1],
      r1[2] * r2[0] - r1[0] * r2[2],
      r1[0] * r2[1] - r1[1] * r2[0],
    ];

    const R = [r1, r2, r3];

    // matrix2angle (ZYX) : pitch = -asin(R[2][0]), yaw = atan2(R[2][1], R[2][2]), roll = atan2(R[1][0], R[0][0])
    let pitch, yaw, roll;
    if (Math.abs(R[2][0]) < 0.99999) {
      pitch = -Math.asin(R[2][0]);
      const cp = Math.cos(pitch);
      yaw  = Math.atan2(R[2][1] / cp, R[2][2] / cp);
      roll = Math.atan2(R[1][0] / cp, R[0][0] / cp);
    } else {
      // Gimbal lock
      roll = 0;
      if (R[2][0] < 0) { pitch =  Math.PI / 2; yaw =  Math.atan2( R[0][1],  R[0][2]); }
      else             { pitch = -Math.PI / 2; yaw =  Math.atan2(-R[0][1], -R[0][2]); }
    }

    const DEG = 180 / Math.PI;
    return {
      yaw:   yaw   * DEG,
      pitch: pitch * DEG,
      roll:  roll  * DEG,
      tx, ty, tz,
      scale,
      R,  // matrice rotation 3x3 brute, évite la reconstruction depuis Euler
    };
  }

  // -------- Inference --------
  async function run3DDFA(srcEl) {
    if (!srcEl) throw new Error('[3DDFA] run3DDFA: image element manquant');
    await load3DDFA();

    const input = preprocess(srcEl);
    const inputName = _session.inputNames[0];
    const outputs = await _session.run({ [inputName]: input });
    const raw = outputs[_session.outputNames[0]].data; // Float32Array(62)

    const params = denormalize(raw);

    return {
      pose:  extractPose(params),
      shape: params.slice(12, 52),
      expr:  params.slice(52, 62),
      raw:   params,
    };
  }

  // Expose
  window.run3DDFA = run3DDFA;
  window.load3DDFA = load3DDFA;
})();
