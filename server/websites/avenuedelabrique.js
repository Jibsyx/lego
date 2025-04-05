const fetch = require('node-fetch');
const cheerio = require('cheerio');

const parse = data => {
  const $ = cheerio.load(data);

  return $('div.prods a')
    .map((i, element) => {
      const price = parseFloat($(element).find('span.prodl-prix span').text().replace('€', '').replace(',', '.'));
      const discount = Math.abs(parseInt($(element).find('span.prodl-reduc').text().replace('%', '')));
      const title = $(element).attr('title') || $(element).find('.prodl-nom').text().trim();

      return {
        title,
        price,
        discount
      };
    })
    .get();
};

module.exports.scrape = async url => {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch: ${response.status}`);
    return null;
  }
  const body = await response.text();
  return parse(body);
};
