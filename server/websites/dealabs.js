const cheerio = require('cheerio');

/**
 * Parse webpage data response
 * @param  {String} data - HTML response
 * @return {Array<Object>} deals
 */
const parse = data => {
  const $ = cheerio.load(data);
  const deals = [];

  $('div.js-vue2[data-vue2]').each((_, el) => {
    try {
      const vueData = $(el).attr('data-vue2');
      if (!vueData) return;

      const parsed = JSON.parse(vueData);
      const thread = parsed.props?.thread;

      if (thread) {
        const title = thread.title;
        const link = thread.link || 'https://www.dealabs.com' + thread.titleSlug;
        const price = thread.price + '€';
        const discount = thread.percentage ? `-${thread.percentage}%` : '';
        const temperature = Math.round(thread.temperature) + '°';
        const comments = thread.commentCount;

        deals.push({
          title,
          link,
          price,
          discount,
          temperature,
          comments
        });
      }
    } catch (err) {
      console.error('Error parsing data-vue2:', err.message);
    }
  });

  return deals;
};

module.exports.scrape = async url => {
  const response = await require('../fetchWrapper')(url);
  if (response.ok) {
    const body = await response.text();
    return parse(body);
  } else {
    console.error('Fetch error:', response.status);
    return [];
  }
};
