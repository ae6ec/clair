const Queue = require('bull');

const scrapeQueue = new Queue('scrape', {
    redis: {
      host: '127.0.0.1',
      port: 6379
    }
  });

  exports.scrapeQueue = scrapeQueue