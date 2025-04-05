require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lego';

let client;
let db;

async function connectToDb() {
  if (db) return db;

  if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is undefined. Check your .env file.");
  }

  client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  db = client.db(MONGODB_DB_NAME);
  console.log("✅ Connected to MongoDB");
  return db;
}

module.exports = connectToDb ;
