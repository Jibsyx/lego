require('dotenv').config();
const connectToDb = require('./db');

/**
 * Find all best discount deals (e.g. more than 40%)
 */
async function findBestDiscountDeals(minDiscount = 40) {
  const db = await connectToDb();
  return db.collection('deals').find({
    discount: { $regex: /^-?\d+%$/, $exists: true }
  }).toArray();
}

/**
 * Find all most commented deals (more than X comments)
 */
async function findMostCommentedDeals(minComments = 10) {
  const db = await connectToDb();
  return db.collection('deals').find({
    comments: { $gte: minComments }
  }).toArray();
}

/**
 * Find all deals sorted by price (ascending)
 */
async function findDealsSortedByPrice() {
  const db = await connectToDb();
  return db.collection('deals').find().sort({ price: 1 }).toArray();
}

/**
 * Find all deals sorted by date (most recent first)
 */
async function findDealsSortedByDate() {
  const db = await connectToDb();
  return db.collection('deals').find().sort({ date: -1 }).toArray();
}

/**
 * Find all sales for a given Lego set ID
 */
async function findSalesByLegoId(legoSetId) {
  const db = await connectToDb();
  return db.collection('sales').find({ legoSetId }).toArray();
}

/**
 * Find all sales scraped less than 3 weeks ago
 */
async function findRecentSales() {
  const db = await connectToDb();
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  return db.collection('sales').find({
    scrapedAt: { $gte: threeWeeksAgo }
  }).toArray();
}

// Export all methods
module.exports = {
  findBestDiscountDeals,
  findMostCommentedDeals,
  findDealsSortedByPrice,
  findDealsSortedByDate,
  findSalesByLegoId,
  findRecentSales
};
