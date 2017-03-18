module.exports = (() => {
  'use strict';

  const https = require('https');

  const apiHeaders = {
    'Accept': 'application/json'
  };

  ////////////////
  // API caller //
  ////////////////

  const call = (id, method, config, data) => {
    const apiHandler = config.result_handlers
      .find(handlerConfig => handlerConfig.type === 'API');


    if (!apiHandler) {
      throw new Error('No API handler mate.');
    }

    const options = {
      hostname: apiHandler.hostname,
      path: apiHandler.basePath + id,
      method: method,
      headers: apiHeaders,
      auth: apiHandler.login + ':' + apiHandler.password
    };

    return new Promise((resolve, reject) => {
      https.request(options, result => {
          result.setEncoding('utf-8');
          var responseString = '';

          result.on('data', (data) => {
            responseString += data;
          });
          result.on('end', () => resolve(JSON.parse(responseString)));
        })
        .on('error', (error) => reject(error))
        .end();
    });
  };

  const getRecord = (recordId, config) => {
    return call(recordId, 'GET', config);
  };

  return {
    getRecord: getRecord
  };
})();
