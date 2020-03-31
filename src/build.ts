import { join } from 'path';
// import Debug from 'debug';

import { IBuildOpts, IPackageJSON } from './types';
import { getConfig, isFalse } from './utils';

import rollup from './rollup';

export default async ({ cwd }: IBuildOpts) => {
  try {
    const pkg: IPackageJSON = require(join(cwd, 'package.json'));

    const conf = getConfig(cwd);

    if (!isFalse(conf.esm)) {
      await rollup({ cwd, pkg, format: 'esm', conf });
    }

    if (!isFalse(conf.cjs)) {
      await rollup({ cwd, pkg, format: 'cjs', conf });
    }

    if (conf.umd) {
      await rollup({ cwd, pkg, format: 'umd', conf });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
