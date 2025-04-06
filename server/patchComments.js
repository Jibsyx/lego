require('dotenv').config();
const connectToDb = require('./db');

(async () => {
  const db = await connectToDb();
  const cursor = db.collection('deals').find();

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const commentsRaw = doc.comments;

    if (typeof commentsRaw === 'string') {
      const parsed = parseInt(commentsRaw);
      if (!isNaN(parsed)) {
        await db.collection('deals').updateOne(
          { _id: doc._id },
          { $set: { commentsCount: parsed } }
        );
      }
    }
  }

  console.log('✅ Done updating commentsCount!');
  process.exit(0);
})();
