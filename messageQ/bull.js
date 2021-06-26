// require('dotenv').config()
const Queue = require('bull');

const scrapeQueue = new Queue('scrape', {
    redis: {
      host: process.env.REDIS_SARSWATI_HOST,
      port: process.env.REDIS_SARSWATI_PORT,
      password: process.env.REDIS_SARSWATI_PASSWORD
    }
  });

  exports.scrapeQueue = scrapeQueue