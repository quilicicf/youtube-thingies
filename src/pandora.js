module.exports = (() => {
  const _ = require('lodash');
  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  const request = require('request-promise');
  const Promise = require('bluebird');
  require('colors');

  const settingsPath = path.resolve(os.homedir(), '.config', 'youtube-thingies.json');
  const settingsAsString = fs.readFileSync(settingsPath, 'utf8');
  const settings = JSON.parse(settingsAsString);

  const retrieveAllStationsThumbsup = authToken => {
    const stationsListOptions = {
      uri: 'https://www.pandora.com/api/v1/station/getStations',
      method: 'POST',
      json: { pageSize: 250 },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': 'csrftoken=ab824910ea434558',
        'Host': 'www.pandora.com',
        'X-CsrfToken': 'ab824910ea434558',
        'X-AuthToken': authToken
      }
    };

    return request(stationsListOptions)
      .then(stationList => Promise.all(_.map(stationList.stations, station => retrieveOneStationThumbsup(station, authToken))));
  };

  const retrieveOneStationThumbsup = (station, authToken) => {
    const stationFeedbackOptions = {
      uri: 'https://www.pandora.com/api/v1/station/getStationFeedback',
      method: 'POST',
      json: { stationId: station.stationId, positive: true },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': 'csrftoken=ab824910ea434558',
        'Host': 'www.pandora.com',
        'X-CsrfToken': 'ab824910ea434558',
        'X-AuthToken': authToken
      }
    };

    return request(stationFeedbackOptions)
      .then(stationFeedback => {
        return _(stationFeedback.feedback)
          .map(feedbackDetails => {
            const albumArt = _(feedbackDetails.albumArt).find(art => art.size === 640);
            const musicDetails = {
              artist: feedbackDetails.artistName,
              cover: _.get(albumArt, 'url'),
              length: feedbackDetails.trackLength,
              title: feedbackDetails.songTitle
            };
            return [ computeId(musicDetails), musicDetails ];
          })
          .fromPairs()
          .value();
      });
  };

  const writeThumbsup = allStationsFeedback => {
    const newFeedback = _(allStationsFeedback)
      .map(stationFeedback => _.toPairs(stationFeedback))
      .flatten()
      .fromPairs()
      .value();

    const oldFeedback = retrieveCurrentMusic(settings);
    const mergedFeedback = _.cloneDeep(oldFeedback);

    _(newFeedback)
      .toPairs()
      .reject(pair => _.has(oldFeedback, pair[ 0 ]))
      .each(pair => _.set(mergedFeedback, pair[ 0 ], pair[ 1 ]));

    fs.writeFileSync(settings.musicFile, sortedStringify(mergedFeedback), 'utf8');
    console.log(`Music file written!`.green);
  };

  const retrieveCurrentMusic = settings => {
    const currentMusicAsString = fs.readFileSync(settings.musicFile, 'utf8');
    return JSON.parse(currentMusicAsString);
  };

  const computeId = musicDetails => {
    return new Buffer(`${musicDetails.title}:${musicDetails.artist}`).toString('base64');
  };

  const sortedStringify = object => {
    return JSON.stringify(Object.keys(object).sort().reduce((r, k) => (r[ k ] = object[ k ], r), {}), null, 2);
  };

  return {
    pandora: () => {
      const authenticationCallOptions = {
        uri: 'https://www.pandora.com/api/v1/auth/login',
        method: 'POST',
        json: {
          existingAuthToken: '',
          username: settings.login,
          password: settings.password,
          keepLoggedIn: true
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cookie': 'csrftoken=ab824910ea434558',
          'Host': 'www.pandora.com',
          'X-CsrfToken': 'ab824910ea434558'
        }
      };

      request(authenticationCallOptions)
        .then(body => retrieveAllStationsThumbsup(body.authToken))
        .then(allStationsFeedback => writeThumbsup(allStationsFeedback));
    }
  };
})();
