#!/usr/bin/env node
const { MongoClient } = require('mongodb');
const { PRESETS_DB } = require('../app/PRESETS_DB_v3.js');

const uri = process.env.MONGODB_URI || process.argv[2];
if (!uri) {
  console.error('Usage: MONGODB_URI="your-conn-string" node scripts/seed_db.js');
  process.exit(1);
}

const dbName = process.env.MONGODB_DB || 'scanmyface';
const collName = process.env.MONGODB_COLLECTION || 'presets';

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection(collName);

    if (!Array.isArray(PRESETS_DB) || PRESETS_DB.length === 0) {
      console.error('No presets found in app/PRESETS_DB_v3.js');
      process.exit(1);
    }

    const ops = PRESETS_DB.map(preset => ({
      updateOne: {
        filter: { preset_id: preset.preset_id },
        update: { $set: preset },
        upsert: true
      }
    }));

    const result = await coll.bulkWrite(ops, { ordered: false });
    console.log('Seed completed. Inserted/Upserted counts:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: (result.upsertedCount || Object.keys(result.upserted || {}).length)
    });
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
})();
