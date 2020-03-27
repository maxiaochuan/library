#!/usr/bin/env node
const args = require('yargs-parser')(process.argv.slice(2), {
  alias: {
    version: ['v'],
  },
});

/**
 * version
 */
if (args.version) {
  // eslint-disable-next-line no-console
  console.log(require('../package').version);
  process.exit(0);
}

const cwd = process.cwd();

switch (args._[0]) {
  case 'build':
    require('../lib/build').default({
      cwd,
    });
    break;
  case 'dev':
    require('../lib/dev').default({
      cwd,
    });
    break;
  default:
    // eslint-disable-next-line no-console
    console.error(`Unknown command ${args._}`);
    break;
}
