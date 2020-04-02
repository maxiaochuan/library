import { join } from 'path';
import rimraf from 'rimraf';
// import Debug from 'debug';

import { IBuildOpts, IPackageJSON } from './types';
import { getConfig } from './utils';

import * as rollup from './rollup';
import * as storybook from './storybook';
import { OUTPUT_DIR } from './const';

export default async ({ cwd }: IBuildOpts) => {
  // TODO
  const pkg: IPackageJSON = require(join(cwd, 'package.json'));

  const conf = getConfig(cwd);
  const dev = conf.dev || 'esm';
  // dir: target dir
  rimraf.sync(join(cwd, OUTPUT_DIR));

  if (dev === 'esm') {
    rollup.dev({ cwd, pkg, format: 'esm', conf });
  }

  if (dev === 'story') {
    storybook.dev({ mode: 'dev' });
  }
};
