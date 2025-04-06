'use strict';

const API_BASE = 'https://server-7m8webgn1-jean-bastien-morales-projects.vercel.app';

const selectSort = document.querySelector('#sort-select');
const inputMinDiscount = document.querySelector('#min-discount');
const inputMinComments = document.querySelector('#min-comments');
const inputMinTemperature = document.querySelector('#min-temperature');

const boxDiscount = document.querySelector('#discount-threshold');
const boxComments = document.querySelector('#comments-threshold');
const boxTemperature = document.querySelector('#temperature-threshold');
document.querySelector('#nbSales').textContent = 0;

let currentDeals = [];
let currentPagination = {};
let currentSort = '';

const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals = document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

const fetchDeals = async (page = 1, size = 6, sort = '') => {
  try {
    const params = new URLSearchParams({ limit: size, page });
    if (sort && sort !== 'favorites') params.append('filterBy', sort);

    const url = `${API_BASE}/deals/search?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log("📦 Raw fetchDeals data:", data);

    if (!data || !Array.isArray(data.results)) {
      throw new Error("Invalid deals data format");
    }

    return {
      result: data.results,
      meta: {
        currentPage: data.page || page,
        pageCount: Math.ceil(data.total / size),
        count: data.total
      }
    };
  } catch (error) {
    console.error('❌ Error in fetchDeals:', error);
    return { result: [], meta: { currentPage: 1, pageCount: 1, count: 0 } };
  }
};

const fetchSales = async (legoId) => {
  try {
    const response = await fetch(`${API_BASE}/sales/search?legoSetId=${legoId}`);
    const body = await response.json();
    return body.results || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const setCurrentDeals = ({ result, meta }) => {
  currentDeals = result;
  currentPagination = meta;
};

const renderDeals = deals => {
  if (!Array.isArray(deals)) {
    console.error("❌ renderDeals expected an array but got:", deals);
    return;
  }
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals.map(deal => {
    const publishDate = deal.publishedAt ? new Date(deal.publishedAt).toLocaleDateString() : '';
    return `
      <div class="deal" id="${deal._id}">
        <span>${deal.id || ''}</span>
        <a href="${deal.link}" target="_blank">${deal.title}</a>
        <button class="favorite-btn" data-id="${deal._id}">⭐️</button>
        <span>${deal.price || '?'} €</span>
        <span>Discount: ${deal.discount || '?'}%</span>
        <span>Comments: ${deal.comments || 0}</span>
        <span class="publish-date">Published: ${publishDate}</span>
      </div>
    `;
  }).join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);

  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const id = btn.getAttribute('data-id');
    if (favorites.includes(id)) btn.textContent = '⭐️ (saved)';
    btn.addEventListener('click', () => {
      let updated = [...favorites];
      if (favorites.includes(id)) {
        updated = updated.filter(f => f !== id);
        btn.textContent = '⭐️';
      } else {
        updated.push(id);
        btn.textContent = '⭐️ (saved)';
      }
      localStorage.setItem('favorites', JSON.stringify(updated));
    });
  });
};

const renderPagination = pagination => {
  const { currentPage, pageCount } = pagination;
  const options = Array.from({ length: pageCount }, (_, i) =>
    `<option value="${i + 1}">${i + 1}</option>`).join('');
  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

const renderLegoSetIds = deals => {
  const ids = [...new Set(deals.map(d => d.id))].filter(Boolean);
  selectLegoSetIds.innerHTML = ids.map(id => `<option value="${id}">${id}</option>`).join('');
};

const renderIndicators = pagination => {
  spanNbDeals.textContent = pagination.count;
};

const render = (deals, pagination) => {
  if (!Array.isArray(deals) || !pagination) {
    console.warn("⚠️ Skipped render due to invalid data", deals, pagination);
    return;
  }
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
};

selectShow.addEventListener('change', async e => {
  const size = parseInt(e.target.value);
  const data = await fetchDeals(1, size, currentSort);
  setCurrentDeals(data);
  render(data.result, data.meta);
});

selectPage.addEventListener('change', async e => {
  const page = parseInt(e.target.value);
  const size = parseInt(selectShow.value);
  const data = await fetchDeals(page, size, currentSort);
  setCurrentDeals(data);
  render(data.result, data.meta);
});

document.addEventListener('DOMContentLoaded', async () => {
  const data = await fetchDeals();
  setCurrentDeals(data);
  render(data.result, data.meta);
});

selectSort.addEventListener('change', async e => {
  currentSort = e.target.value;
  const size = parseInt(selectShow.value) || 6;
  const data = await fetchDeals(1, size, currentSort);

  let filtered = data.result;

  if (currentSort === 'favorites') {
    const fav = JSON.parse(localStorage.getItem('favorites') || '[]');
    filtered = filtered.filter(d => fav.includes(d._id));
  } else if (currentSort === 'discount-desc') {
    const min = parseInt(inputMinDiscount.value) || 0;
    filtered = filtered.filter(d => (d.discount || 0) >= min).sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else if (currentSort === 'comments-desc') {
    const min = parseInt(inputMinComments.value) || 0;
    filtered = filtered.filter(d => (d.comments || 0) >= min).sort((a, b) => (b.comments || 0) - (a.comments || 0));
  } else if (currentSort === 'temperature-desc') {
    const min = parseFloat(inputMinTemperature.value) || 0;
    filtered = filtered.filter(d => (d.temperature || 0) >= min).sort((a, b) => b.temperature - a.temperature);
  }

  setCurrentDeals({ result: filtered, meta: data.meta });
  render(filtered, data.meta);
});

[inputMinDiscount, inputMinComments, inputMinTemperature].forEach(input => {
  input.addEventListener('input', () => {
    const event = new Event('change');
    selectSort.dispatchEvent(event);
  });
});

selectLegoSetIds.addEventListener('change', async event => {
  const sales = await fetchSales(event.target.value);
  renderSales(sales);
});

const inputLegoId = document.querySelector('#lego-set-id-input');
const btnSearchSales = document.querySelector('#search-sales-btn');

btnSearchSales.addEventListener('click', async () => {
  const legoId = inputLegoId.value.trim();
  if (!legoId) return;

  console.log('🔍 Searching sales for entered ID:', legoId);
  const sales = await fetchSales(legoId);
  renderSales(sales);
});

const renderSales = sales => {
  document.querySelector('#nbSales').textContent = sales.length;
  document.querySelector('#p5Price').textContent = 0;
  document.querySelector('#p25Price').textContent = 0;
  document.querySelector('#p50Price').textContent = 0;

  const section = document.querySelector('#sales');
  section.innerHTML = '<h2>Sales on Vinted</h2>';

  const prices = sales.map(s => parseFloat(s.price)).sort((a, b) => a - b);
  const percentile = (arr, p) =>
    arr.length === 0 ? 0 : arr[Math.min(Math.floor((p / 100) * arr.length), arr.length - 1)];

  document.querySelector('#p5Price').textContent = percentile(prices, 5).toFixed(2);
  document.querySelector('#p25Price').textContent = percentile(prices, 25).toFixed(2);
  document.querySelector('#p50Price').textContent = percentile(prices, 50).toFixed(2);

  if (sales.length > 0) {
    const timestamps = sales.map(s => new Date(s.published)).sort((a, b) => a - b);
    const days = Math.ceil((timestamps.at(-1) - timestamps[0]) / (1000 * 60 * 60 * 24));
    document.querySelector('#lifetimeValue').textContent = `${days} days`;
  } else {
    document.querySelector('#lifetimeValue').textContent = '0 days';
  }

  section.innerHTML += sales
    .map(
      s => `
    <div class="sale">
      <span>${s.price} €</span>
      <span>Published: ${new Date(s.published).toLocaleDateString()}</span>
      <a href="${sanitizeUrl(s.link)}" target="_blank">View</a>
    </div>
  `
    )
    .join('');
};

function sanitizeUrl(url) {
  if (!url) return '#';
  const match = url.match(/www\.vinted\.fr\/[^\"]+/);
  if (match) return `https://${match[0]}`;
  if (url.startsWith('https://')) return url;
  return '#';
}
