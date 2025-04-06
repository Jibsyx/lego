require('dotenv').config();
const connectToDb = require('./db');

(async () => {
  const db = await connectToDb();
  const cursor = db.collection('deals').find();

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const discountStr = doc.discount;

    if (typeof discountStr === 'string') {
      const parsed = parseFloat(discountStr.replace('%', ''));
      if (!isNaN(parsed)) {
        await db.collection('deals').updateOne(
          { _id: doc._id },
          { $set: { discountValue: parsed } }
        );
      }
    }
  }

  console.log('✅ Done updating discountValue!');
  process.exit(0);
})();
