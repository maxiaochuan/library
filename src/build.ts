import { join } from 'path';
import rimraf from 'rimraf';
import Debug from 'debug';

import { IBuildOpts, IPackageJSON } from './types';
import { OUTPUT_DIR } from './const';
import { getBundleOpts } from './utils';

import rollup from './rollup';

const debug = Debug('mlib:build');

export default async ({ cwd }: IBuildOpts) => {
  try {
    const pkg: IPackageJSON = require(join(cwd, 'package.json'));

    const { esm, cjs, ...others } = getBundleOpts(cwd);

    // clear target dir
    rimraf.sync(join(cwd, OUTPUT_DIR));
    debug('clear dir: %s', join(cwd, OUTPUT_DIR));

    if (esm) {
      await rollup({ cwd, pkg, format: 'esm', ...others });
    }

    if (cjs) {
      await rollup({ cwd, pkg, format: 'cjs', ...others });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
