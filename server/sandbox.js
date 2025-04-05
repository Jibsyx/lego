const websites = require('require-all')(`${__dirname}/websites`);
const fs = require('fs');
const path = require('path');

async function sandbox(website = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  try {
    console.log(`Browsing ${website} website`);

    // Extract domain name from URL
    const url = new URL(website);
    const hostname = url.hostname;
    const domainParts = hostname.split('.');
    const domain = domainParts[domainParts[0] === 'www' ? 1 : 0];

    if (!websites[domain]) {
      throw new Error(`No scraper found for domain: ${domain}`);
    }

    const deals = await websites[domain].scrape(website);
    // Save deals to a JSON file
    const filename = `${domain}.deals.json`;
    const filePath = path.join(__dirname, 'data', filename);

    fs.writeFileSync(filePath, JSON.stringify(deals, null, 2), 'utf-8');
    console.log(`✅ Saved ${deals.length} deals to ${filePath}`);

    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;
sandbox(eshop);
