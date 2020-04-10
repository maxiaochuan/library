#!/usr/bin/env node
const args = require('yargs-parser')(process.argv.slice(2), {
  alias: {
    version: ['v'],
    scope: ['s'],
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
    process.env.NODE_ENV = 'production';
    require('../lib/build').default({
      cwd,
    });
    break;
  case 'dev':
    process.env.NODE_ENV = 'development';
    require('../lib/dev').default({
      cwd,
      scope: args.scope,
    });
    break;
  default:
    // eslint-disable-next-line no-console
    console.error(`Unknown command ${args._}`);
    break;
}
