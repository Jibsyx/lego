const {
  findBestDiscountDeals,
  findMostCommentedDeals,
  findDealsSortedByPrice,
  findDealsSortedByDate,
  findSalesByLegoId,
  findRecentSales
} = require('./mongoQueries');

const connectToDb = require('./db');
require('dotenv').config();

const legoIdArg = process.argv[3] || '42143';

(async () => {
  const [, , queryName] = process.argv;

  if (!queryName) {
    console.error('❌ Please provide a valid query name:');
    console.log('Options: bestDiscount, mostCommented, sortedByPrice, sortedByDate, salesById, recentSales');
    process.exit(1);
  }

  try {
    console.log(`🔍 Running query: ${queryName}`);
    const db = await connectToDb();

    const testMap = {
      bestDiscount: () => findBestDiscountDeals(db),
      mostCommented: () => findMostCommentedDeals(db),
      sortedByPrice: () => findDealsSortedByPrice(db),
      sortedByDate: () => findDealsSortedByDate(db),
      salesById: () => findSalesByLegoId(db, legoIdArg),
      recentSales: () => findRecentSales(db)
    };

    const queryFunc = testMap[queryName];

    if (!queryFunc) {
      console.error(`❌ Query "${queryName}" not found.`);
      process.exit(1);
    }

    const results = await queryFunc();
    console.log(`✅ ${results.length} result(s) found:`);
    console.dir(results, { depth: null });
  } catch (error) {
    console.error('❌ Error while running query:', error);
  } finally {
    process.exit(0);
  }
})();
