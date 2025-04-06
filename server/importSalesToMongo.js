// importSalesToMongo.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const connectToDb = require('./db');

async function importSales(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const sales = JSON.parse(raw);

    const db = await connectToDb();
    const collection = db.collection('sales');

    // Add a source and timestamp
    const salesWithMeta = sales.map((sale) => ({
      ...sale,
      source: 'vinted',
      importedAt: new Date(),
    }));

    const result = await collection.insertMany(salesWithMeta);
    console.log(`✅ ${result.insertedCount} sales imported into "sales" collection.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

const [,, filePath] = process.argv;
if (!filePath) {
  console.error('Usage: node importSalesToMongo.js <path-to-vinted.sales.json>');
  process.exit(1);
}

importSales(path.resolve(filePath));
