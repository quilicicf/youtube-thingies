#!/usr/bin/env node

require('colors');

// noinspection BadExpressionStatementJS
require('yargs')
  .usage('usage: $0 <command>')
  .command('pandora-thumbsup', 'Pandora thumbsup retriever', yargs => require('./src/pandora').pandora(yargs))
  .command('download', 'Download music from metadata', yargs => require('./src/download').download(yargs))

  .command('groot', 'Tells a random sentence', () => console.log(`Je s'appelle Groot!`))

  .demandCommand(1, 'Specify the command you want to run!'.red)
  .help()
  .epilogue('for more information, readd the manual at https://github.com/quilicicf/youtube-thingies')
  .argv;
