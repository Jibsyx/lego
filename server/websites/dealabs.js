const fetch = require('../fetchWrapper');
const cheerio = require('cheerio');

const parse = data => {
  const $ = cheerio.load(data);
  const deals = [];

  $('div.js-vue2[data-vue2]').each((_, el) => {
    const vue2Data = $(el).attr('data-vue2');
    if (!vue2Data) return;

    try {
      const parsed = JSON.parse(vue2Data);
      const thread = parsed.props?.thread;
      if (!thread) return;

      const title = thread.title;
      const link = thread.shareableLink;
      const price = thread.price;
      const originalPrice = thread.nextBestPrice;

      const discountValue = (originalPrice && price)
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : null;

      const temperature = Math.round(thread.temperature);
      const commentsCount = thread.commentCount || 0;
      const publishedAt = thread.publishedAt
        ? new Date(thread.publishedAt * 1000).toISOString()
        : null;

      deals.push({
        title,
        link,
        price: price ? `${price}€` : '',
        priceValue: price || null,
        discount: discountValue !== null ? `${discountValue}%` : '',
        discountValue,
        temperature: `${temperature}°`,
        comments: commentsCount.toString(),
        commentsCount,
        publishedAt
      });
    } catch (err) {
      console.error('❌ JSON parse error:', err);
    }
  });

  return deals;
};

module.exports.scrape = async url => {
  const response = await fetch(url);
  if (response.ok) {
    const body = await response.text();
    return parse(body);
  } else {
    console.error('❌ Fetch error:', response.status);
    return [];
  }
};
