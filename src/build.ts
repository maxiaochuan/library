import { join } from 'path';
import rimraf from 'rimraf';
// import Debug from 'debug';

import { IBuildOpts, IPackageJSON } from './types';
import { getConfig, isFalse } from './utils';

import rollup from './rollup';
import { OUTPUT_DIR } from './const';

export default async ({ cwd }: IBuildOpts) => {
  try {
    const pkg: IPackageJSON = require(join(cwd, 'package.json'));

    const conf = getConfig(cwd);
    // dir: target dir
    rimraf.sync(join(cwd, OUTPUT_DIR));

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
