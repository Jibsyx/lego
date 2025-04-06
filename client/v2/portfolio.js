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

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

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

const fetchSales = async (legoId) => {
  try {
    const url = `https://lego-api-blue.vercel.app/sales?id=${legoId}`;
    const response = await fetch(url);
    const body = await response.json();
    return body.results || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

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

  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const id = btn.getAttribute('data-id');
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

const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

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

selectPage.addEventListener('change', async (event) => {
  const page = parseInt(event.target.value);
  const size = parseInt(selectShow.value) || 6;
  const deals = await fetchDeals(page, size);
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

selectSort.addEventListener('change', async (event) => {
  const sort = event.target.value;
  const page = currentPagination.currentPage || 1;
  const size = parseInt(selectShow.value) || 6;

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
  } else if (sort === 'date-asc') {
    sortedResult = [...result].sort((a, b) => b.published - a.published);
  } else if (sort === 'date-desc') {
    sortedResult = [...result].sort((a, b) => a.published - b.published);
  } else if (sort === 'favorites') {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    sortedResult = [...result].filter(deal => favorites.includes(deal.uuid));
  }

  setCurrentDeals({ result: sortedResult, meta });
  render(currentDeals, currentPagination);
});

[inputMinDiscount, inputMinComments, inputMinTemperature].forEach(input => {
  input.addEventListener('input', () => {
    const event = new Event('change');
    selectSort.dispatchEvent(event);
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

  const prices = sales.map(s => s.price).sort((a, b) => a - b);

  const percentile = (arr, p) => {
    if (arr.length === 0) return 0;
    const index = Math.floor((p / 100) * arr.length);
    return arr[Math.min(index, arr.length - 1)];
  };

  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length || 0;

  document.querySelector('#p5Price').textContent = percentile(prices, 5).toFixed(2);
  document.querySelector('#p25Price').textContent = percentile(prices, 25).toFixed(2);
  document.querySelector('#p50Price').textContent = percentile(prices, 50).toFixed(2);

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

selectLegoSetIds.addEventListener('change', async (event) => {
  const selectedId = event.target.value;
  const sales = await fetchSales(selectedId);
  renderSales(sales);
});