// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';
const selectSort = document.querySelector('#sort-select');
const inputMinDiscount = document.querySelector('#min-discount');
const inputMinComments = document.querySelector('#min-comments');
const inputMinTemperature = document.querySelector('#min-temperature');

const boxDiscount = document.querySelector('#discount-threshold');
const boxComments = document.querySelector('#comments-threshold');
const boxTemperature = document.querySelector('#temperature-threshold');
document.querySelector('#nbSales').textContent = 0;




/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6, sort = '') => {
  try {
    let url = `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`;
    if (sort) {
      url += `&sort=${sort}`;
    }

    const response = await fetch(url);
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};


/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
  .map(deal => {
    const publishDate = new Date(deal.published * 1000).toLocaleDateString();
    return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}" target="_blank">${deal.title}</a>
        <button class="favorite-btn" data-id="${deal.uuid}">
        ⭐️
        </button>
        <span>${deal.price} €</span>
        <span class="publish-date">Published: ${publishDate}</span>
      </div>
    `;
  })
  .join('');


  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
  // Load favorites from localStorage
const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// Add event listeners to favorite buttons
document.querySelectorAll('.favorite-btn').forEach(btn => {
  const id = btn.getAttribute('data-id');

  // Fill star if it's already a favorite
  if (favorites.includes(id)) {
    btn.textContent = '⭐️ (saved)';
  }

  btn.addEventListener('click', () => {
    let updatedFavorites = [...favorites];

    if (favorites.includes(id)) {
      updatedFavorites = favorites.filter(fav => fav !== id);
      btn.textContent = '⭐️';
    } else {
      updatedFavorites.push(id);
      btn.textContent = '⭐️ (saved)';
    }

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  });
});

};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

// Fetch deals from api


// Event listener to update deals when page is changed FEATURE 1
selectPage.addEventListener('change', async (event) => {
  const page = parseInt(event.target.value); // Selected page
  const size = parseInt(selectShow.value) || 6; // Current page size

  // Fetch and render deals for the selected page
  const deals = await fetchDeals(page, size);
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

// Event listener for filtering by best discount FEATURE 2
selectSort.addEventListener('change', async (event) => {
  console.log(currentDeals.map(deal => new Date(deal.published * 1000).toLocaleString()));


  const sort = event.target.value;
  const page = currentPagination.currentPage || 1;
  const size = parseInt(selectShow.value) || 6;

  // Show threshold fields (if needed for other filters)
  boxDiscount.style.display = sort === 'discount-desc' ? 'block' : 'none';
  boxComments.style.display = sort === 'comments-desc' ? 'block' : 'none';
  boxTemperature.style.display = sort === 'temperature-desc' ? 'block' : 'none';

  const { result, meta } = await fetchDeals(page, size);
  let sortedResult = result;

  if (sort === 'discount-desc') {
    const minDiscount = parseInt(inputMinDiscount.value) || 0;
    sortedResult = [...result]
      .filter(deal => (deal.discount || 0) >= minDiscount)
      .sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else if (sort === 'comments-desc') {
    const minComments = parseInt(inputMinComments.value) || 0;
    sortedResult = [...result]
      .filter(deal => (deal.comments || 0) >= minComments)
      .sort((a, b) => (b.comments || 0) - (a.comments || 0));
  } else if (sort === 'temperature-desc') {
    const minTemp = parseFloat(inputMinTemperature.value) || 0;
    sortedResult = [...result]
      .filter(deal => (deal.temperature || 0) >= minTemp)
      .sort((a, b) => b.temperature - a.temperature);
  } else if (sort === 'price-asc') {
    sortedResult = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === 'price-desc') {
    sortedResult = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
  }
  else if (sort === 'date-asc') {
    // Newest first = highest published timestamp
    sortedResult = [...result].sort((a, b) => b.published - a.published);
  } 
  else if (sort === 'date-desc') {
    // Oldest first = lowest published timestamp
    sortedResult = [...result].sort((a, b) => a.published - b.published);
  }
  else if (sort === 'favorites') {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  sortedResult = [...result].filter(deal => favorites.includes(deal.uuid));
  }

  

  setCurrentDeals({ result: sortedResult, meta });
  render(currentDeals, currentPagination);
});

[inputMinDiscount, inputMinComments, inputMinTemperature].forEach(input => {
  input.addEventListener('input', () => {
    const event = new Event('change');
    selectSort.dispatchEvent(event); // re-triggers the sort listener
  });
});
const renderSales = (sales) => {
  document.querySelector('#nbSales').textContent = sales.length;
  document.querySelector('#p5Price').textContent = 0;
  document.querySelector('#p25Price').textContent = 0;
  document.querySelector('#p50Price').textContent = 0;

  const section = document.querySelector('#sales');
  section.innerHTML = '<h2>Sales on Vinted</h2>';
  document.querySelector('#nbSales').textContent = sales.length;

// Feature 9: Calculate and display price indicators
const prices = sales.map(s => s.price).sort((a, b) => a - b);

// Percentile helper
const percentile = (arr, p) => {
  if (arr.length === 0) return 0;
  const index = Math.floor((p / 100) * arr.length);
  return arr[Math.min(index, arr.length - 1)];
};

const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length || 0;

document.querySelector('#p5Price').textContent = percentile(prices, 5).toFixed(2);
document.querySelector('#p25Price').textContent = percentile(prices, 25).toFixed(2);
document.querySelector('#p50Price').textContent = percentile(prices, 50).toFixed(2);
// Feature 10: Lifetime Value (in days)
if (sales.length > 0) {
  const timestamps = sales.map(s => s.published).sort((a, b) => a - b);
  const firstDate = new Date(timestamps[0] * 1000);
  const lastDate = new Date(timestamps[timestamps.length - 1] * 1000);

  const diffTime = Math.abs(lastDate - firstDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  document.querySelector('#lifetimeValue').textContent = `${diffDays} days`;
} else {
  document.querySelector('#lifetimeValue').textContent = '0 days';
}


  if (sales.length === 0) {
    section.innerHTML += '<p>No sales found for this set.</p>';
    return;
  }

  sales.forEach(sale => {
    const date = new Date(sale.published * 1000).toLocaleDateString();
    section.innerHTML += `
      <div class="sale">
        <span>${sale.price} €</span>
        <span>Published: ${date}</span>
        <a href="${sale.link}" target="_blank">View</a>
      </div>
    `;
  });
};

selectLegoSetIds.addEventListener('change', (event) => {
  const selectedId = event.target.value;

  // Ensure we are comparing strings
  const sales = currentDeals.filter(deal => String(deal.id) === String(selectedId));

  console.log("Filtered sales:", sales); // ✅ Temporary debug
  renderSales(sales);
});






