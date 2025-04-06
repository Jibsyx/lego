const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const connectToDb = require('./db');


const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());
app.get('/test-db', async (req, res) => {
  try {
    const db = await connectToDb();
    const count = await db.collection('deals').countDocuments();
    res.json({ status: 'ok', dealsCount: count });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);

const { ObjectId } = require('mongodb');

app.get('/deals/search', async (req, res) => {
  const db = await connectToDb();

  const {
    limit = 12,
    price,
    date,
    filterBy
  } = req.query;

  const query = {};
  const sort = {};

  // Price filter
  if (price) {
    query.priceValue = { $lte: parseFloat(price) };
  }

  // Date filter
  if (date) {
    query.publishedAt = { $gte: new Date(date) };
  }

  // Sorting logic
  if (filterBy === 'best-discount') {
    sort.discountValue = -1; // ✅ use numeric field
  }
  else if (filterBy === 'most-commented') {
    if (filterBy === 'most-commented') {
      sort.commentsCount = -1; // ✅ new numeric field
    }
    
  } else {
    sort.priceValue = 1; // default sort by price ascending
  }

  try {
    const deals = await db
      .collection('deals')
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      limit: parseInt(limit),
      total: deals.length,
      results: deals
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});
app.get('/deals/:id', async (req, res) => {
  const db = await connectToDb();
  const { id } = req.params;

  let query;
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    // valid ObjectId format
    query = { _id: new ObjectId(id) };
  } else {
    // fallback: string ID (UUID or legacy)
    query = { _id: id };
  }

  try {
    const deal = await db.collection('deals').findOne(query);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(deal);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});





app.get('/sales/search', async (req, res) => {
  try {
    const db = await connectToDb();
    const { limit = 12, legoSetId } = req.query;

    const query = {};
    if (legoSetId) {
      query.id = legoSetId; // assuming `id` is the field in your MongoDB collection
    }

    const sales = await db
      .collection('sales')
      .find(query)
      .sort({ published: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({
      limit: parseInt(limit),
      total: sales.length,
      results: sales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


