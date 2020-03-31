import { join } from 'path';
import rimraf from 'rimraf';
// import Debug from 'debug';

import { IBuildOpts, IPackageJSON } from './types';
import { getConfig, isFalse, overwritePackageJSON } from './utils';

import * as rollup from './rollup';
import { OUTPUT_DIR } from './const';

export default async ({ cwd }: IBuildOpts) => {
  try {
    const pkg: IPackageJSON = require(join(cwd, 'package.json'));

    const conf = getConfig(cwd);
    // dir: target dir
    rimraf.sync(join(cwd, OUTPUT_DIR));

    const outputs = [];

    if (!isFalse(conf.esm)) {
      outputs.push(await rollup.build({ cwd, pkg, format: 'esm', conf }));
    }

    if (!isFalse(conf.cjs)) {
      outputs.push(await rollup.build({ cwd, pkg, format: 'cjs', conf }));
    }

    if (conf.umd) {
      outputs.push(await rollup.build({ cwd, pkg, format: 'umd', conf }));
    }

    if (!isFalse(conf.overwritePackageJSON)) {
      overwritePackageJSON(cwd, pkg, outputs);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
