const _ = require('lodash');

const fs = require('fs');
const os = require('os');
const path = require('path');
const allToMp3 = require('alltomp3');
const cliProgress = require('cli-progress');
const prompt = require('inquirer').createPromptModule();

const settingsPath = path.resolve(os.homedir(), '.config', 'youtube-thingies.json');
const settings = require(settingsPath);

const musicMetadataPath = settings.musicFile;
const musicMetadata = require(musicMetadataPath);

const musicPath = settings.musicFolder;

const VIDEO_CHOICES_NUMBER = 8;
const VIDEO_NAME_LENGTH = 40;
const PROGRESS_BAR_OPTIONS = {
  format: `  ${'{bar}'.green} {percentage}% | ETA {eta}s`,
  stream: process.stdout,
  clearOnComplete: true,
  hideCursor: true
};

const ARG_CHOOSE_FIRST = {
  name: 'choose-first',
  alias: 'f',
  describe: 'Automatically downloads the first choice',
  type: 'boolean'
};

const computeMusicFileName = (metadata) => {
  const fileNameWithoutExtension = `${metadata.artist} - ${metadata.title}`;
  return {
    withoutExtension: fileNameWithoutExtension,
    withExtension: `${fileNameWithoutExtension}.mp3`
  };
};

const writeMusic = (url, destination, fileName) => {
  const progressBar = new cliProgress.Bar(PROGRESS_BAR_OPTIONS, cliProgress.Presets.shades_classic);
  progressBar.start(201, 0);

  return new Promise((resolve, reject) => {
    const downloadProcess = allToMp3.downloadAndTagSingleURL(url, destination);
    downloadProcess.on('download', (info) => {
      progressBar.update(info.progress);
    });
    downloadProcess.on('convert', (info) => {
      progressBar.update(100 + info.progress);
    });
    downloadProcess.on('end', (info) => {
      fs.renameSync(info.file, path.resolve(destination, fileName));
      progressBar.stop();
      resolve();
    });
    downloadProcess.on('error', reject);
  });
};

const downloadMusic = (metadata, shouldDownloadFirstChoice) => {
  const fileName = computeMusicFileName(metadata);
  const filePath = path.resolve(musicPath, fileName.withExtension);

  const urlName = 'selectedUrl';
  if (!fs.existsSync(filePath)) {
    console.log(`Downloading ${fileName.withoutExtension}:`.yellow);
    return allToMp3.findVideo(fileName.withoutExtension)
      .then((proposedVideos) => {
        if (shouldDownloadFirstChoice) {
          return Promise.resolve(_.set({}, urlName, proposedVideos[ 0 ].url));
        }

        const choices = _(proposedVideos)
          .take(VIDEO_CHOICES_NUMBER)
          .map((video) => {
            const videoName = _(video.title)
              .truncate({ length: VIDEO_NAME_LENGTH, omission: '…' })
              .padEnd(VIDEO_NAME_LENGTH, ' ');

            const score = _(video.score)
              .truncate({ length: 6, omission: '' })
              .replace(/^-/, '');

            return {
              name: `${videoName} | ${video.url} | ${score}`,
              value: video.url
            };
          })
          .value();

        const question = {
          type: 'list',
          name: urlName,
          message: 'Check the quality of the videos and select the one that works best for you',
          choices: choices
        };

        return prompt(question);
      })
      .then((answer) => {
        return writeMusic(answer[ urlName ], musicPath, fileName.withExtension);
      })
      .catch((error) => {
        throw error;
      });
  }

  console.log(`${fileName.withoutExtension} already downloaded`.green);
  return Promise.resolve();
};

module.exports = (() => {
  return {
    download(yargs) {
      const args = yargs
        .usage('usage: $0 $1 [options]')
        .option(ARG_CHOOSE_FIRST.name, ARG_CHOOSE_FIRST)
        .help()
        .argv;

      const metadataList = _.values(musicMetadata);

      const reducer = (promise, metadata) => {
        return promise.then(() => downloadMusic(metadata, args[ ARG_CHOOSE_FIRST.name ]));
      };
      _.reduce(metadataList, reducer, Promise.resolve())
        .catch((error) => {
          throw error;
        });
    }
  };
})();
