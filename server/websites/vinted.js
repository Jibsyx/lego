const fetch = require('node-fetch');

/**
 * Scrape Vinted for a given search query and return up to 30 results
 * @param {String} url - Full Vinted search page URL (with query param)
 * @returns {Array<Object>} - List of items
 */
module.exports.scrape = async (url) => {
  const headers = {
    "cookie": "_vinted_fr_session=Z1NaMjcrcUJGazJMbEFGM3hrdVB1WmFRVjB2Y1d6QUw4MWo2RFZOVC9sYmc0SWhMZUpCVlRvTU5YMHRBeTRUdEpPQzYvZUhpNGEyTkZKNjY3OUkvYlczeWJKSFN3cGhDOUtxZlZ4SFZONW1oSU0rcCtUWGNycmtDM1FCeDZFWTQyYUxvRjY1dFhSVm9oWThwSjBJYi84cWQ4OEw3ZTJ4WTd6MGYwNi9YZCt5aFpaY09QTlpuSVIzemJ3YVFkMWZ3cm15OXROS2xsUVRCMHpBTG5MR0t3ekU1WTMzSHBJK2NIZGxnWk5VZ3A3eGZjNk9MN3BuRGhKaFpzcVBuaVZGWC0taXZjTmFnQWZVWDRSVzMzc1JFY3R6Zz09--f1c885ad6782babe844a2b7058bba8475937e98d; __cf_bm=zFIo6n9ke6F1AUYyzy8SEXYkLCbt.5gbcbrLGxs7Enc-1743866793-1.0.1.1-KiwoYAMMYoNp5l1yDeas2mQZCbwGUxOtUQDV7JtggKhBqzaDtIehi2WSyT8Guc8TqMRH.BxB3WOCC7zCm5rdHKyQzo6HszeDbj2VYh9p8wk", // ← ⚠️ tu dois mettre tes cookies ici
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
    "accept": "application/json",
    "accept-language": "fr-FR,fr;q=0.9"
  };

  try {
    // Transformation de l'URL utilisateur en appel API
    const parsed = new URL(url);
    const search = parsed.searchParams.get('search_text');
    const page = parsed.searchParams.get('page') || '1';

    const apiUrl = `https://www.vinted.fr/api/v2/catalog/items?search_text=${encodeURIComponent(search)}&per_page=30&page=${page}`;

    const res = await fetch(apiUrl, { headers });
    if (!res.ok) {
      console.error("Fetch error", res.status);
      return [];
    }

    const json = await res.json();
    const items = json.items || [];

    return items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      brand: item.brand_title,
      size: item.size_title,
      url: `https://www.vinted.fr${item.url}`,
      image: item.photos?.[0]?.url || ''
    }));
  } catch (err) {
    console.error("Scraping error:", err);
    return [];
  }
};
