import { join } from 'path';
import rimraf from 'rimraf';
import Debug from 'debug';
// import { Signale } from 'signale';
import { IBuildOpts, IPackageJSON } from './types';
// import rollup from './rollup';
import { getBundleOpts } from './utils';
import rollup from './rollup';
import { OUTPUT_DIR } from './const';

const debug = Debug('mlib:build');

export default async ({ cwd }: IBuildOpts) => {
  try {
    const pkg: IPackageJSON = require(join(cwd, 'package.json'));

    const { esm, cjs } = getBundleOpts(cwd);

    debug('buidle esm:\n%O', esm);
    debug('buidle cjs:\n%O', cjs);

    // clear target dir
    rimraf.sync(join(cwd, OUTPUT_DIR));
    debug('clear dir: %s', join(cwd, OUTPUT_DIR));

    if (esm) {
      await rollup({ cwd, pkg, format: 'esm' });
    }

    if (cjs) {
      await rollup({ cwd, pkg, format: 'cjs' });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
