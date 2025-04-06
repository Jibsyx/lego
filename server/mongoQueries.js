const connectToDb = require('./db');

/**
 * 1. Find all best discount deals (deals with the highest discount percentage)
 */
async function findBestDiscountDeals(db) {
  const deals = await db.collection('deals').aggregate([
    {
      $match: {
        discount: { $regex: /^\d+%$/ } // On ne garde que les chaînes comme "33%"
      }
    },
    {
      $addFields: {
        discountValue: {
          $toInt: { $substr: ["$discount", 0, { $subtract: [{ $strLenCP: "$discount" }, 1] }] }
        }
      }
    },
    { $sort: { discountValue: -1 } },
    { $limit: 10 }
  ]).toArray();

  return deals;
}



/**
 * 2. Find all most commented deals
 */
const findMostCommentedDeals = async (db) => {
  const collection = db.collection('deals');
  const deals = await collection.aggregate([
    {
      $addFields: {
        commentsInt: {
          $toInt: {
            $cond: {
              if: { $eq: ['$comments', ''] },
              then: '0',
              else: '$comments'
            }
          }
        }
      }
    },
    { $sort: { commentsInt: -1 } },
    { $limit: 10 }
  ]).toArray();

  return deals;
};


/**
 * 3. Find all deals sorted by price
 */
const findDealsSortedByPrice = async (db) => {
  const collection = db.collection('deals');
  const deals = await collection.aggregate([
    {
      $match: {
        price: { $regex: /^[0-9]+(\.[0-9]+)?€$/ } // garde uniquement les prix valides (ex: "134.99€")
      }
    },
    {
      $addFields: {
        priceValue: {
          $toDouble: {
            $replaceAll: {
              input: "$price",
              find: "€",
              replacement: ""
            }
          }
        }
      }
    },
    { $sort: { priceValue: -1 } },
    { $limit: 10 }
  ]).toArray();

  return deals;
};



/**
 * 4. Find all deals sorted by date (scrapedAt or published date)
 */
const findDealsSortedByDate = async (db) => {
  const collection = db.collection('deals');

  const deals = await collection.aggregate([
    {
      $match: {
        publishedAt: { $exists: true, $ne: "" }
      }
    },
    {
      $addFields: {
        publishedDate: {
          $toDate: "$publishedAt"
        }
      }
    },
    {
      $sort: {
        publishedDate: -1 // les plus récents d'abord
      }
    },
    {
      $limit: 10
    }
  ]).toArray();

  return deals;
};



/**
 * 5. Find all sales for a given LEGO set ID
 */
const findSalesByLegoId = async (db, legoId) => {
  return await db.collection('sales')
    .find({ id: legoId })
    .sort({ published: -1 })
    .toArray();
};


/**
 * 6. Find all sales scraped less than 3 weeks ago
 */
const findRecentSales = async (db) => {
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

  return await db.collection('sales')
    .aggregate([
      {
        $addFields: {
          publishedDate: { $toDate: "$published" }
        }
      },
      {
        $match: {
          publishedDate: { $gte: threeWeeksAgo }
        }
      },
      {
        $sort: { publishedDate: -1 }
      }
    ])
    .toArray();
};




module.exports = {
  findBestDiscountDeals,
  findMostCommentedDeals,
  findDealsSortedByPrice,
  findDealsSortedByDate,
  findSalesByLegoId,
  findRecentSales
};
