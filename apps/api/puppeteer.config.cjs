// eslint-disable-next-line
const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
// eslint-disable-next-line
module.exports = {
  // eslint-disable-next-line
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
