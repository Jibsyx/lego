const {
    findBestDiscountDeals,
    findMostCommentedDeals,
    findDealsSortedByPrice,
    findDealsSortedByDate,
    findSalesByLegoId,
    findRecentSales
  } = require('./mongoQueries');
  
  (async () => {
    console.log("🔍 Best Discount Deals:");
    const bestDeals = await findBestDiscountDeals(20);
    console.log(bestDeals);
  
    console.log("\n💬 Most Commented Deals:");
    const commentedDeals = await findMostCommentedDeals(5);
    console.log(commentedDeals);
  
    console.log("\n💸 Deals Sorted by Price:");
    const sortedByPrice = await findDealsSortedByPrice();
    console.log(sortedByPrice);
  
    console.log("\n🕓 Deals Sorted by Date:");
    const sortedByDate = await findDealsSortedByDate();
    console.log(sortedByDate);
  
    console.log("\n🧱 Sales for LEGO Set ID 75192:");
    const sales = await findSalesByLegoId("75192");
    console.log(sales);
  
    console.log("\n🆕 Sales scraped in the last 3 weeks:");
    const recentSales = await findRecentSales();
    console.log(recentSales);
  
    process.exit(0);
  })();
  