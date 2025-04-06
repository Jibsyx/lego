const { scrapeAllLegoIds } = require('./websites/vinted');
require('dotenv').config();

(async () => {
  try {
    await scrapeAllLegoIds(); // scrape tous les LEGO_IDS
    console.log('✅ Scraping Vinted terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du scraping Vinted:', error);
    process.exit(1);
  }
})();
