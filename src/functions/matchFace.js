const { app } = require('@azure/functions');
const { MongoClient } = require('mongodb');

let mongoClient = null;

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

function jsonResponse(status, payload) {
    return {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
    };
}

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

app.http('matchFace', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Requête reçue !');
        context.log(`matchFace invoked for url "${request.url}"`);

        if (request.method === 'OPTIONS') {
            return jsonResponse(200, { success: true });
        }

        if (request.method !== 'POST') {
            return jsonResponse(405, { success: false, error: 'Method not allowed. Use POST.' });
        }

        let payload;
        try {
            const body = await request.text();
            payload = body ? JSON.parse(body) : {};
            context.log('Données reçues :', payload);
        } catch (error) {
            return jsonResponse(400, { success: false, error: 'Invalid JSON body.' });
        }

        let presets;
        try {
            presets = await loadPresetsFromMongo();
        } catch (error) {
            context.log('Error loading presets from MongoDB:', error?.message || error);
            return jsonResponse(500, { success: false, error: 'Preset database is unavailable.' });
        }

        if (!Array.isArray(presets) || presets.length === 0) {
            return jsonResponse(500, { success: false, error: 'Preset database is unavailable.' });
        }

        const stats = computeDbStats(presets);
        const ratios = payload?.ratios ?? payload ?? {};
        const skinTone = payload?.skinTone ?? payload?.skinToneKey ?? payload?.skin_tone ?? null;

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

        // Compute scores for all presets and collect them
        const scoredPresets = [];
        for (const preset of scoringPool) {
            const score = computePresetScore(ratios, skinTone, preset, stats);
            scoredPresets.push({ preset, score });
        }

        // Sort by score descending to get best matches first
        scoredPresets.sort((a, b) => b.score - a.score);

        // Get top 3 presets
        const top3 = scoredPresets.slice(0, 3).map((item) => ({
            preset_id: item.preset.preset_id,
            ...item.preset,
            score: item.score
        }));

        // Get best preset (first in top 3)
        const bestPreset = top3.length > 0 ? scoredPresets[0].preset : null;

        if (!bestPreset) {
            return jsonResponse(500, { success: false, error: 'No matching presets found.' });
        }

        return jsonResponse(200, {
            success: true,
            match: bestPreset,
            top3: top3
        });
    }
});
