import { join } from 'path';
import rimraf from 'rimraf';
import { Signale } from 'signale';

import { readdirSync, existsSync } from 'fs';
import { IBuildOpts, IPackageJSON } from './types';
import { getConfig, isFalse, overwritePackageJSON } from './utils';

import * as rollup from './rollup';
import { OUTPUT_DIR } from './const';

export const build = async ({ cwd }: IBuildOpts) => {
  const pkg: IPackageJSON = require(join(cwd, 'package.json'));
  const signale = new Signale().scope((pkg.name || '').toUpperCase(), 'BUILD');
  try {
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
    if (error.name === 'ConfigError') {
      signale.error(error.message);
    } else {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
};

const buildForLerna = async (opts: IBuildOpts) => {
  console.log('bbuildForLernaild', opts);
  try {
    const pkgs = readdirSync(join(opts.cwd, 'packages')).filter(p => !p.startsWith('.'));
    // eslint-disable-next-line no-restricted-syntax
    for (const pkg of pkgs) {
      const pkgPath = join(opts.cwd, 'packages', pkg);

      process.chdir(pkgPath);
      // eslint-disable-next-line no-await-in-loop
      await build({
        ...opts,
        cwd: pkgPath,
        // root: cwd,
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
};

export default async function (opts: IBuildOpts) {
  const lerna = existsSync(join(opts.cwd, 'lerna.json'));
  if (lerna) {
    await buildForLerna(opts);
  } else {
    await build(opts);
  }
}
