const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { connectToDb } = require('./db');

async function importDeals(filePath, source) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const deals = JSON.parse(raw);

    const db = await connectToDb();
    const collection = db.collection('deals');

    // ajoute la source dans chaque deal
    const dealsWithSource = deals.map(deal => ({ ...deal, source }));

    const result = await collection.insertMany(dealsWithSource);
    console.log(`✅ ${result.insertedCount} deals from "${source}" imported successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

const [,, filePath, source] = process.argv;
if (!filePath || !source) {
  console.error('Usage: node importJsonToMongo.js <path-to-json> <source>');
  process.exit(1);
}

importDeals(path.resolve(filePath), source);
