const fetch = require('../fetchWrapper');
const cheerio = require('cheerio');

/**
 * Parse webpage data response
 * @param  {String} data - HTML response
 * @return {Array<Object>} deals
 */
const parse = data => {
  const $ = cheerio.load(data);
  const deals = [];

  $('article').each((_, el) => {
    const title = $(el).find('a.cept-tt.thread-link.linkPlain').text().trim();
    const link = 'https://www.dealabs.com' + $(el).find('a.cept-tt.thread-link.linkPlain').attr('href');
    const price = $(el).find('span.thread-price').first().text().trim();
    const discount = $(el).find('span.space--ml-1').first().text().trim(); // Often contains "-22%"

    if (title && link) {
      deals.push({ title, link, price, discount });
    }
  });

  return deals;
};

/**
 * Scrape a given Dealabs page
 * @param {String} url - URL to parse
 * @returns {Array<Object>}
 */
module.exports.scrape = async url => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      console.error('Fetch error:', response.status);
      return [];
    }

    const body = await response.text();
    return parse(body);
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};
