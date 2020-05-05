import { join } from 'path';
import rimraf from 'rimraf';
// import Debug from 'debug';

import { existsSync } from 'fs';
import { IBuildOpts, IPackageJSON } from './types';
import { OUTPUT_DIR } from './const';
import { getConfig, getLernaPackages } from './utils';

import * as rollup from './rollup';
import * as docz from './docz';
import declaration from './declaration';

export const dev = async ({ cwd }: IBuildOpts) => {
  // TODO
  const pkg: IPackageJSON = require(join(cwd, 'package.json'));

  const conf = getConfig(cwd);
  const mode = conf.dev || 'esm';
  // dir: target dir
  rimraf.sync(join(cwd, OUTPUT_DIR));

  try {
    const isTs = existsSync(join(cwd, 'tsconfig.json'));
    if (mode !== 'docz' && isTs) {
      await declaration({ pkg });
    }
    if (mode === 'esm') {
      return rollup.dev({ cwd, pkg, format: 'esm', conf });
    }

    if (mode === 'cjs') {
      return rollup.dev({ cwd, pkg, format: 'cjs', conf });
    }

    if (mode === 'umd') {
      return rollup.dev({ cwd, pkg, format: 'umd', conf });
    }

    if (mode === 'docz') {
      return docz.dev({ cwd, conf });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }

  return {};
};

export const devForLerna = async (opts: IBuildOpts) => {
  try {
    if (!opts.scope) {
      throw new Error('dev in leran project must scope');
    }

    const params = getLernaPackages(opts.cwd);
    const names = params.reduce<Record<string, string>>((prev, param) => {
      // eslint-disable-next-line no-param-reassign
      prev[param.name] = param.path;
      return prev;
    }, {});

    if (names[opts.scope]) {
      process.chdir(names[opts.scope]);
      await dev({
        ...opts,
        cwd: names[opts.scope],
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
    await devForLerna(opts);
  } else {
    await dev(opts);
  }
}
