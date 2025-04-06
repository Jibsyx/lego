const fs = require("fs");
const path = require("path");
const { v5: uuidv5 } = require("uuid");
const fetch = require("node-fetch");

/**
 * Liste des ID LEGO à scraper
 */
const LEGO_IDS = [
  "42143", "75192", "10347", "31215", "21265", 
  "10337", "76919","60337", "76294"
];

/**
 * Lit un fichier JSON local
 */
function readJsonFile(filename) {
  if (!fs.existsSync(filename)) return [];
  try {
    return JSON.parse(fs.readFileSync(filename, "utf-8"));
  } catch (error) {
    console.error(`❌ Erreur de lecture du fichier ${filename} :`, error);
    return [];
  }
}

/**
 * Scrape Vinted pour un ID LEGO donné (avec cookies)
 */
const scrapeWithCookies = async (legoId) => {
  try {
    console.log(`🔍 Scraping Vinted pour LEGO ID: ${legoId}`);
    const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=${legoId}`;

    const response = await fetch(url, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "fr",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "cookie": process.env.VINTED_COOKIE || "", // Ajouté : support via .env
        "referer": `https://www.vinted.fr/catalog?search_text=${legoId}`
      },
      method: "GET"
    });

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status} pour ${legoId}`);
      return [];
    }

    const body = await response.json();
    const items = parseJSON(body, legoId);
    return items;
  } catch (error) {
    console.error(`❌ Erreur scraping ${legoId}:`, error.message);
    return [];
  }
};

/**
 * Parse JSON de l'API Vinted
 */
const parseJSON = (data, legoId) => {
  try {
    return (data.items || [])
      .filter(item => item.brand_title?.toLowerCase() === "lego")
      .map(item => ({
        id: legoId,
        link: `https://www.vinted.fr${item.url}`,
        price: item.total_item_price?.amount || null,
        title: item.title,
        brand: item.brand_title,
        published: item.photo?.high_resolution?.timestamp
          ? new Date(item.photo.high_resolution.timestamp * 1000).toISOString()
          : null,
        uuid: uuidv5(item.url, uuidv5.URL)
      }));
  } catch (error) {
    console.error("❌ Parse error:", error);
    return [];
  }
};

/**
 * Sauvegarde locale (optionnelle)
 */
const saveDeals = (deals) => {
  const filename = path.join(__dirname, "DEALSVinted.json");
  const existingDeals = readJsonFile(filename);
  const combined = [...existingDeals, ...deals].reduce((acc, deal) => {
    if (!acc.find(d => d.uuid === deal.uuid)) acc.push(deal);
    return acc;
  }, []);

  fs.writeFileSync(filename, JSON.stringify(combined, null, 2), "utf-8");
  console.log(`✅ ${deals.length} nouveaux deals ajoutés à ${filename}`);
};

/**
 * Scrape tous les LEGO_IDs listés
 */
const scrapeAllLegoIds = async () => {
  console.log(`📦 Scraping ${LEGO_IDS.length} LEGO IDs sur Vinted...`);
  const allDeals = [];

  for (const legoId of LEGO_IDS) {
    const deals = await scrapeWithCookies(legoId);
    allDeals.push(...deals);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // pause anti-bannissement
  }

  console.log("🎉 Scraping terminé !");
  return allDeals; // ✅ important !
};


module.exports = {
  scrapeAllLegoIds,
  scrapeWithCookies,
  LEGO_IDS
};
