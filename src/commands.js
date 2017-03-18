module.exports = (() => {
  'use strict';

  const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  const searcher = require('youtube-search');
  const config = require(home + '/.youtube-thingies.json');
  const api_caller = require('./api_caller.js');
  const handlersMap = require('./handlers.js')
    .handlersMap;

  //////////////
  // COMMANDS //
  //////////////

  const searchCallback = (keywords, resolve, reject) => {
    searcher(keywords.join(' '), config.youtube_search_config, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  };

  const search = (keywords, recordId) => {
    return new Promise((resolve, reject) => searchCallback(keywords, resolve, reject))
      .then(results => {
        config.result_handlers.map(handler_config => {
          handlersMap[ handler_config.type ](handler_config, results, recordId);
        });
      });
  };

  const searchFromApiRecord = (recordId) => {
    api_caller.getRecord(recordId, config)
      .then(record => search([ record.artist, record.name ], record.id))
      .catch(error => console.log(error));
  };

  const commandsMap = {
    search: search,
    searchFromApiRecord: searchFromApiRecord
  };

  return {
    commandsMap: commandsMap
  };
})();
