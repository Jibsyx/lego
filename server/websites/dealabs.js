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
        const discount = (originalPrice && price)
          ? Math.round(((originalPrice - price) / originalPrice) * 100) + '%'
          : '';
        const temperature = Math.round(thread.temperature) + '°';
        const comments = thread.commentCount.toString();
        const publishedAt = thread.publishedAt
            ? new Date(thread.publishedAt * 1000).toISOString()
            : '';

  
        deals.push({
          title,
          link,
          price: price ? `${price}€` : '',
          discount,
          temperature,
          comments,
          publishedAt
        });
      } catch (err) {
        console.error('JSON parse error:', err);
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
    console.error('Fetch error:', response.status);
    return [];
  }
};
