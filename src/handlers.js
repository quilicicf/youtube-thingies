module.exports = (() => {
  'use strict';

  const promptIfAbsent = require('./prompt.js')
    .promptIfAbsent;
  const ytdl = require('ytdl-core');
  const fs = require('fs');

  //////////////
  // HANDLERS //
  //////////////

  const apiHandler = (handler_config, results, recordId) => {
    // promptIfAbsent(recordId, 'recordId')
    //   .then(safeRecordId => {
    //     console.log('API handler: ', safeRecordId, results);
    // TODO: post result on the API
    // });
    console.log('API handler deactivated momentaneously');
  };

  const fileHandler = (handler_config, results) => {
    const downloadOptions = {
      filter: 'audioonly'
    };
    const videoName = results[ 0 ].title + '.mp3';

    const videoReadableStream = ytdl(results[ 0 ].link, downloadOptions);
    const videoWritableStream = fs.createWriteStream(handler_config.path + '/' + videoName); // TODO: better path resolving

    const stream = videoReadableStream.pipe(videoWritableStream);
    stream.on('finish', () => {
      console.log('Finished downloading: ' + videoName);
    });
  };

  const handlersMap = {
    api: apiHandler,
    file: fileHandler
  };

  return {
    handlersMap: handlersMap
  };
})();
