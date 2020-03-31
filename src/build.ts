import { join } from 'path';
// import Debug from 'debug';

import { IBuildOpts, IPackageJSON } from './types';
import { getBundleOpts } from './utils';

import rollup from './rollup';

// const debug = Debug('mlib:build');

export default async ({ cwd }: IBuildOpts) => {
  try {
    const pkg: IPackageJSON = require(join(cwd, 'package.json'));

    const { esm, cjs, umd, ...others } = getBundleOpts(cwd);

    if (esm) {
      await rollup({ cwd, pkg, format: 'esm', ...others, esm });
    }

    if (cjs) {
      await rollup({ cwd, pkg, format: 'cjs', ...others, cjs });
    }

    if (umd) {
      await rollup({ cwd, pkg, format: 'umd', ...others, umd });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
