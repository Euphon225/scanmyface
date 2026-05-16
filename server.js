const express = require('express');
const path = require('path');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let mongoClient = null;

const STRIPE_PRICES = {
  'pass24h': 'price_1TX8fI0F5tPT2CvowRDs8Esr',
  '5scans': 'price_1TX8gy0F5tPT2CvoKFqcb7nU',
  'seasonpass': 'price_1TX8hc0F5tPT2CvoRrwkTmaX'
};

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'app')));

// MongoDB utilities
function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }
  return uri;
}

async function getMongoClient() {
  if (mongoClient) return mongoClient;
  mongoClient = new MongoClient(getMongoUri());
  await mongoClient.connect();
  return mongoClient;
}

async function loadPresetsFromMongo() {
  const dbName = process.env.MONGODB_DB || 'scanmyface';
  const collName = process.env.MONGODB_COLLECTION || 'presets';
  const client = await getMongoClient();
  return client.db(dbName).collection(collName).find({}).toArray();
}

// Azure Face API utility
async function analyzePhotoQuality(base64Image) {
  const apiKey = process.env.AZURE_FACE_API_KEY;
  const apiEndpoint = process.env.AZURE_FACE_API_ENDPOINT;

  if (!apiKey || !apiEndpoint) {
    console.warn('Azure Face API credentials not configured, skipping quality check');
    return { ok: true };
  }

  try {
    const imageBuffer = Buffer.from(base64Image.split(',')[1] || base64Image, 'base64');
    const response = await fetch(`${apiEndpoint}/face/v1.0/detect?returnFaceAttributes=blur,exposure,headPose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': apiKey
      },
      body: imageBuffer
    });

    const data = await response.json();

    if (!data || data.length === 0 || !data[0].faceAttributes) {
      return { ok: false, reason: 'no_face' };
    }

    const attrs = data[0].faceAttributes;

    if (attrs.blur && attrs.blur.value > 0.5) {
      return { ok: false, reason: 'too_blurry' };
    }

    if (attrs.exposure && (attrs.exposure.value < 0.2 || attrs.exposure.value > 0.8)) {
      return { ok: false, reason: 'bad_lighting' };
    }

    if (attrs.headPose && (Math.abs(attrs.headPose.yaw) > 30 || Math.abs(attrs.headPose.pitch) > 30)) {
      return { ok: false, reason: 'bad_angle' };
    }

    return { ok: true, attrs: data[0] };
  } catch (error) {
    console.error('Azure Face API error:', error?.message || error);
    return { ok: true };
  }
}

// Face matching utilities
function normalizeSkinToneLabel(skinTone) {
  const skinToneAliases = {
    'skin.tone.very.light': 'Claire',
    'skin.tone.light': 'Claire',
    'skin.tone.light.tanned': 'Claire-bronzée',
    'skin.tone.medium': 'Métis',
    'skin.tone.dark': 'Foncée',
    'skin.tone.very.dark': 'Très foncée'
  };
  return skinToneAliases[skinTone] ?? skinTone;
}

function computeDbStats(presets) {
  const fields = ['nez', 'machoire', 'joues', 'bouche', 'yeux', 'sourcils', 'eyebrowGap', 'lipFullness', 'noseFlare', 'philtrum', 'cheekProminence', 'eyeHeightPos'];
  const mn = {};
  const mx = {};

  for (const key of fields) {
    const values = presets
      .map((preset) => preset.ratios_cibles?.[key])
      .filter((value) => value != null && Number.isFinite(Number(value)))
      .map(Number);

    mn[key] = values.length ? Math.min(...values) : 0;
    mx[key] = values.length ? Math.max(...values) : 1;
  }

  return { mn, mx };
}

function toNormalizedValue(value, key, stats) {
  const range = stats.mx[key] - stats.mn[key];
  const numericValue = Number(value);
  if (!Number.isFinite(range) || range === 0 || !Number.isFinite(numericValue)) return 0;
  return (numericValue - stats.mn[key]) / range;
}

function computePresetScore(ratios, skinTone, preset, stats) {
  const resolvedSkinTone = normalizeSkinToneLabel(skinTone);
  const neighborhoods = {
    'Claire': ['Claire', 'Claire-bronzée'],
    'Claire-bronzée': ['Claire', 'Claire-bronzée', 'Métis'],
    'Métis': ['Claire-bronzée', 'Métis', 'Foncée'],
    'Foncée': ['Métis', 'Foncée', 'Très foncée'],
    'Très foncée': ['Foncée', 'Très foncée']
  };

  const allowed = neighborhoods[resolvedSkinTone] ?? [resolvedSkinTone];
  if (!allowed.includes(preset.couleur_peau)) return 0;

  const rc = preset.ratios_cibles;
  if (!rc || rc.nez == null) return 20;

  const errLipFullness = Math.abs(toNormalizedValue(ratios.lipFullness, 'lipFullness', stats) - toNormalizedValue(rc.lipFullness, 'lipFullness', stats)) * 10;
  const errNoseFlare = Math.abs(toNormalizedValue(ratios.noseFlare, 'noseFlare', stats) - toNormalizedValue(rc.noseFlare, 'noseFlare', stats)) * 10;
  const errPhiltrum = Math.abs(toNormalizedValue(ratios.philtrum, 'philtrum', stats) - toNormalizedValue(rc.philtrum, 'philtrum', stats)) * 10;
  const errCheekProm = Math.abs(toNormalizedValue(ratios.cheekProminence, 'cheekProminence', stats) - toNormalizedValue(rc.cheekProminence, 'cheekProminence', stats)) * 10;
  const errEyebrowGap = Math.abs(toNormalizedValue(ratios.eyebrowGap, 'eyebrowGap', stats) - toNormalizedValue(rc.eyebrowGap, 'eyebrowGap', stats)) * 10;
  const errNez = Math.abs(toNormalizedValue(ratios.noseToInterEye, 'nez', stats) - toNormalizedValue(rc.nez, 'nez', stats));
  const errMachoire = Math.abs(toNormalizedValue(ratios.jawToFaceRatio, 'machoire', stats) - toNormalizedValue(rc.machoire, 'machoire', stats));
  const errJoues = Math.abs(toNormalizedValue(ratios.cheekToFaceRatio, 'joues', stats) - toNormalizedValue(rc.joues, 'joues', stats));
  const errBouche = Math.abs(toNormalizedValue(ratios.mouthToFace, 'bouche', stats) - toNormalizedValue(rc.bouche, 'bouche', stats));
  const errYeux = Math.abs(toNormalizedValue(ratios.eyeOpenness, 'yeux', stats) - toNormalizedValue(rc.yeux, 'yeux', stats));
  const errSourcils = Math.abs(toNormalizedValue(ratios.eyebrowHeightRatio, 'sourcils', stats) - toNormalizedValue(rc.sourcils, 'sourcils', stats));
  const errEyeHeightPos = Math.abs(toNormalizedValue(ratios.eyeHeightPos, 'eyeHeightPos', stats) - toNormalizedValue(rc.eyeHeightPos, 'eyeHeightPos', stats));

  let totalError =
    errLipFullness + errNoseFlare + errPhiltrum + errCheekProm + errEyebrowGap +
    errNez + errMachoire + errJoues + errBouche + errYeux + errSourcils + errEyeHeightPos;

  if (preset.notes && /asiatique/i.test(preset.notes) && (ratios.eyeOpenness || 0) > 0.075) {
    totalError += 50;
  }

  return Math.max(0, 100 - (totalError / 57) * 100);
}

// API Routes
app.post('/api/create-checkout', async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    // Validate that the priceId is one of the allowed prices
    const isValidPrice = Object.values(STRIPE_PRICES).includes(priceId);
    if (!isValidPrice) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    // Build the origin from the request
    const origin = `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${origin}/app/index.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`
    });

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

// Azure Face API - Analyze photo quality
async function analyzePhotoWithAzureFaceAPI(base64Image) {
  const apiKey = process.env.AZURE_FACE_API_KEY;
  const apiEndpoint = process.env.AZURE_FACE_API_ENDPOINT;

  if (!apiKey || !apiEndpoint) {
    console.warn('Azure Face API not configured, skipping quality validation');
    return { ok: true };
  }

  try {
    const imageBuffer = Buffer.from(base64Image.split(',')[1] || base64Image, 'base64');
    const response = await fetch(`${apiEndpoint}/face/v1.0/detect?returnFaceAttributes=blur,exposure,headPose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': apiKey
      },
      body: imageBuffer
    });

    const data = await response.json();

    if (!data || data.length === 0 || !data[0].faceAttributes) {
      return { ok: false, error: 'Aucun visage détecté. Veuillez vous assurer que votre visage est visible et bien centré.' };
    }

    const attrs = data[0].faceAttributes;

    if (attrs.blur && attrs.blur.value > 0.5) {
      return { ok: false, error: 'Photo trop floue. Veuillez prendre une photo plus nette.' };
    }

    if (attrs.exposure && (attrs.exposure.value < 0.2 || attrs.exposure.value > 0.8)) {
      return { ok: false, error: 'Éclairage insuffisant ou trop intense. Trouvez un meilleur endroit avec une bonne luminosité.' };
    }

    if (attrs.headPose && (Math.abs(attrs.headPose.yaw) > 30 || Math.abs(attrs.headPose.pitch) > 30)) {
      return { ok: false, error: 'Veuillez placer votre visage droit face à la caméra.' };
    }

    return { ok: true, attrs: data[0] };
  } catch (error) {
    console.error('Azure Face API error:', error?.message || error);
    return { ok: true };
  }
}

// Face matching API route
app.post('/api/matchFace', async (req, res) => {
  try {
    const payload = req.body || {};
    const image = payload?.image;
    const ratios = payload?.ratios ?? {};
    const skinTone = payload?.skinTone ?? payload?.skinToneKey ?? payload?.skin_tone ?? null;

    // Step 1: If image is provided, validate quality with Azure Face API
    if (image) {
      const qualityCheck = await analyzePhotoWithAzureFaceAPI(image);
      if (!qualityCheck.ok) {
        return res.status(400).json({
          success: false,
          error: qualityCheck.error || 'Photo quality validation failed.'
        });
      }
    }

    // Step 2: Load presets and perform matching
    let presets;
    try {
      presets = await loadPresetsFromMongo();
    } catch (error) {
      console.error('Error loading presets from MongoDB:', error?.message || error);
      return res.status(500).json({ success: false, error: 'Preset database is unavailable.' });
    }

    if (!Array.isArray(presets) || presets.length === 0) {
      return res.status(500).json({ success: false, error: 'Preset database is unavailable.' });
    }

    const stats = computeDbStats(presets);
    const resolvedSkinTone = normalizeSkinToneLabel(skinTone);
    const neighborhoods = {
      'Claire': ['Claire', 'Claire-bronzée'],
      'Claire-bronzée': ['Claire', 'Claire-bronzée', 'Métis'],
      'Métis': ['Claire-bronzée', 'Métis', 'Foncée'],
      'Foncée': ['Métis', 'Foncée', 'Très foncée'],
      'Très foncée': ['Foncée', 'Très foncée']
    };

    const allowedSkinTones = neighborhoods[resolvedSkinTone] ?? [resolvedSkinTone];
    const candidates = presets.filter((preset) => allowedSkinTones.includes(preset.couleur_peau));
    const scoringPool = candidates.length > 0 ? candidates : presets;

    const scoredPresets = [];
    for (const preset of scoringPool) {
      const score = computePresetScore(ratios, skinTone, preset, stats);
      scoredPresets.push({ preset, score });
    }

    scoredPresets.sort((a, b) => b.score - a.score);

    const top3 = scoredPresets.slice(0, 3).map((item) => ({
      preset_id: item.preset.preset_id,
      ...item.preset,
      score: item.score
    }));

    const bestPreset = top3.length > 0 ? scoredPresets[0].preset : null;

    if (!bestPreset) {
      return res.status(500).json({ success: false, error: 'No matching presets found.' });
    }

    res.json({
      success: true,
      match: bestPreset,
      top3: top3
    });

  } catch (error) {
    console.error('Error in matchFace:', error);
    res.status(500).json({
      error: 'Failed to match face',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
