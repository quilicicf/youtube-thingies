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

  const thumbsup = () => {
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
      .then(body => {
        return retrieveThumbsup(body.authToken);
      });
  };

  const retrieveThumbsup = authToken => {
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
      .then(stationList => {
        return Promise.all(
          _(stationList.stations)
            .map(station => {
              return retrieveStationsThumbsup(station, authToken);
            })
            .value()
        );
      });
  };

  const retrieveStationsThumbsup = (station, authToken) => {
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
        const musicsDetails = _(stationFeedback.feedback)
          .map(feedbackDetails => {
            const albumArt = _(feedbackDetails.albumArt).find(art => art.size === 640);
            const musicDetails = {
              title: feedbackDetails.songTitle,
              artist: feedbackDetails.artistName,
              length: feedbackDetails.trackLength,
              cover: _.get(albumArt, 'url')
            };
            console.log(`${feedbackDetails.songTitle} from ${feedbackDetails.artistName}`.green);
            return [ computeId(musicDetails), musicDetails ];
          })
          .fromPairs()
          .value();

        console.log(JSON.stringify(musicsDetails));
      });
  };

  const computeId = musicDetails => {
    return new Buffer(`${musicDetails.title}:${musicDetails.artist}`).toString('base64');
  };

  return {
    pandora: thumbsup
  };
})();
