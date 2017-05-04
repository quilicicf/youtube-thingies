# youtube-thingies

This CLI tool is aimed at making maintenance of one's music library easier.

1. Create and deploy an API implementing [the Swagger definition](./doc/music_api_swagger.json) ([Restlet Cloud](https://cloud.restlet.com) might be your friend there). Only JSON is supposed to be supported, the API only performs CRUD operations on songs.
2. Create a synchronized folder for your music (you can use [rsync](https://www.digitalocean.com/community/tutorials/how-to-use-rsync-to-sync-local-and-remote-directories-on-a-vps) for example) so that your music is up-to-date on all your devices
3. Use this tool to find and download music via youtube
4. Be sure not to download any music on which you have no copyright of course

_Note:_ I have not reach a MVP ATM so the tool is not versioned/properly named yet.

## Install

- Fork this repository
- Get your Youtube API token from [API console](https://console.developers.google.com/apis/dashboard).
- Copy `youtube-thingies_example.json` to `~/.youtube-thingies.json`
- Put the API token in the COPIED file (you don't want to accidentally push it to github)
- Run `npm i -g` in the repository
- You can now run `ythingies` from anywhere on your machine :firework:

## Available commands

### Search

```shell
#        | Command | Key words for youtube search
ythingies search     jon lajoie this is the best song
```

Will search for the song in youtube API, download it into your shared folder and POST its metadata on your API.

### Search from record ID

```shell
#        | Command            | Record ID on the API
ythingies searchFromApiRecord   206becd1-724f-468c-87ec-cd3b5df63466
```

Will search for the song on youtube API using the artist and name of the music it fetched from your API and download it into your shared folder.

## Roadmap

### MVP (no I'm definitely not there yet)

- [ ] Actually download the music (first result for a start)
- [ ] Chain handlers and document them
- [ ] Actually push the new record on the user's API
- [ ] Add a help command
- [ ] Create a proper `config` command

### The future

- [ ] Create a command `bootstrap` to create from existing library
- [ ] Add a command `delete`
- [ ] Add syntax completion
- [ ] Explain how to implement the API in the README
- [ ] Explain how to install rsync in the README
- [ ] Create/run playlists
- [ ] Bulk download from API
- [ ] Allow user to choose the link from youtube's API results
- [ ] Conquer the world

## Contributing

If you'd like to give a hand, please contact me by email.
