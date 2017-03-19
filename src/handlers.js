module.exports = (() => {
  'use strict';

  const promptIfAbsent = require('./prompt.js')
    .promptIfAbsent;

  //////////////
  // HANDLERS //
  //////////////

  const apiHandler = (handler_config, results, recordId) => {
    promptIfAbsent(recordId, 'recordId')
      .then(safeRecordId => {
        console.log('API handler: ', safeRecordId, results);
        // TODO: post result on the API
      });
  };

  const handlersMap = {
    api: apiHandler
  };

  return {
    handlersMap: handlersMap
  };
})();
