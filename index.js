module.exports = (() => {
  'use strict';

  const searcher = require('youtube-search');
  const config = require('./config.json');

  return {
    search: (keyword) => {
      searcher(keyword, config, (err, results) => {
        if (err) {
          return console.log(err);
        }

        console.log(results);
      });
    }
  };
})();
