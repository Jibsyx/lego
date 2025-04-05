// fetchWrapper.js
module.exports = async function fetchWrapper(...args) {
    const fetch = (await import('node-fetch')).default;
    return fetch(...args);
  };
  