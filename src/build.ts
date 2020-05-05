import { join } from 'path';
import rimraf from 'rimraf';
import { Signale } from 'signale';
import { PackageJson } from '@mxcins/types';
import { existsSync } from 'fs';
import { IBuildOpts } from './types';
import { getConfig, isFalse, getPackage, getLernaPackages } from './utils';
import overwrite from './package';
import * as rollup from './rollup';
import declaration from './declaration';
import { OUTPUT_DIR } from './const';

export const build = async ({ cwd }: IBuildOpts) => {
  const pkg: PackageJson = getPackage(cwd);
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
      overwrite(cwd, pkg, outputs);
    }

    const isTs = existsSync(join(cwd, 'tsconfig.json'));

    if (isTs) {
      await declaration({ pkg });
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
  try {
    const params = getLernaPackages(opts.cwd);
    // eslint-disable-next-line no-restricted-syntax
    for (const param of params) {
      process.chdir(param.path);
      // eslint-disable-next-line no-await-in-loop
      await build({
        ...opts,
        cwd: param.path,
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
