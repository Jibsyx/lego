const { scrapeAllLegoIds } = require('./websites/vinted');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

(async () => {
  try {
    const allDeals = await scrapeAllLegoIds(); // <- récupérer les résultats

    // 💾 Sauvegarde dans un fichier vinted.deals.json
    const filePath = path.join(__dirname, 'data', 'vinted.sales.json');
    fs.writeFileSync(filePath, JSON.stringify(allDeals, null, 2), 'utf-8');
    console.log(`✅ ${allDeals.length} deals sauvegardés dans ${filePath}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du scraping Vinted:', error);
    process.exit(1);
  }
})();
