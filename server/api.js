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

app.get('/deals/:id', async (req, res) => {
  const db = await connectToDb();
  const { id } = req.params;

  let deal;
  try {
    deal = await db.collection('deals').findOne({ _id: new ObjectId(id) });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }

  res.json(deal);
});

