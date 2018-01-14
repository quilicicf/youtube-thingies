# youtube-thingies

This CLI tool helps you retrieve your thumps-up on [pandora](https://pandora.com) and download the songs from [Youtube](https://youtube.com).

This tool is highly experimental!

## Installation

Only checked on Linux Mint:

```shell
# Install ffmpeg
sudo apt-get install ffmpeg

# Install chromaprint
sudo apt-get install libchromaprint-tools

# Install eyeD3
pip install eyeD3

git clone git@github.com:quilicicf/youtube-thingies.git
cd youtube-thingies
npm link
```

Write configuration in `~/.config/youtube-thingies.json`:

```json
{
  "login": "pandora login",
  "password": "pandora password",
  "musicFolder": "path to folder where the music will be downloaded",
  "musicFile": "path to music file metadata"
}
```

## Use

### Retrieve thumbs-up

```shell
ythingies pandora-thumbsup
```
Writes the thumbs-up in your metadata file.

### Download music

```shell
ythingies download
```

Downloads the musics from the metadata file that are not already present in the downloads folder.

Use with `-f` to automatically download the first (best) link.
