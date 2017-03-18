#!/usr/bin/env node

'use strict';

const commandsMap = require('./src/methods.js')
  .commandsMap;


const main = () => {
  commandsMap[ process.argv[ 2 ] ](process.argv.splice(3));
};

main();
