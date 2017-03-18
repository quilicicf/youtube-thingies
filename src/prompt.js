module.exports = (() => {
  'use strict';

  const prompt = require('prompt');

  ////////////
  // PROMPT //
  ////////////

  const onPromptError = (err) => {
    console.log(err);
    return 1;
  };

  const promptIfAbsent = (object, objectName) => {
    return new Promise((resolve) => {
      if (object) {
        resolve(object);
        return;
      }

      prompt.start();
      prompt.get([ 'recordId' ], (err, result) => {
        if (err) {
          return onPromptError(err);
        }
        resolve(result[ objectName ]);
      });
    });
  };

  return {
    promptIfAbsent: promptIfAbsent
  };
})();
