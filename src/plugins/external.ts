import Debug from 'debug';
import { dirname } from 'path';
import { ModuleFormat } from 'rollup';
import getBuiltins from 'builtins';
import { IPackageJSON } from '../types';

const debug = Debug('mlib:plugins:external');

const cwd = process.cwd();

const safe = (id: string) => {
  try {
    return require.resolve(id, { paths: [cwd].concat(require.main?.paths || []) });
  } catch (error) {
    debug('safe error:', id);
    return null;
  }
};

export interface IExternalOpts extends IOptsByFormat {
  format: ModuleFormat;
  pkg: IPackageJSON;
}

interface IOptsByFormat {
  builtins?: boolean;
  dependencies?: boolean;
  peerDependencies?: boolean;
  devDependencies?: boolean;
  runtime?: boolean;
}

export const DEFAULT_OPTIONS: Record<string, IOptsByFormat> = {
  esm: {
    builtins: true,
    dependencies: true,
    devDependencies: true,
    peerDependencies: true,
    runtime: true,
  },
  cjs: {
    builtins: true,
    dependencies: true,
    devDependencies: true,
    peerDependencies: true,
    runtime: false,
  },
  umd: {
    builtins: true,
    dependencies: false,
    devDependencies: false,
    peerDependencies: true,
    runtime: false,
  },
};

export default ({ format = 'esm', pkg, ...others }: IExternalOpts) => ({
  name: 'mlib-external',
  options: (opts: any) => {
    const { builtins, dependencies, devDependencies, peerDependencies, runtime } = {
      ...DEFAULT_OPTIONS[format],
      ...others,
    };

    debug('external options:\n%O', {
      ...DEFAULT_OPTIONS[format],
      ...others,
    });
    let ids: string[] = [];

    if (dependencies && pkg.dependencies) {
      ids = ids.concat(Object.keys(pkg.dependencies));
    }

    if (devDependencies && pkg.devDependencies) {
      ids = ids.concat(Object.keys(pkg.devDependencies));
    }

    if (peerDependencies && pkg.peerDependencies) {
      ids = ids.concat(Object.keys(pkg.peerDependencies));
    }

    if (builtins) {
      ids = ids.concat(getBuiltins(process.version));
    }

    if (runtime) {
      ids = ids.concat(['@babel/runtime-corejs3/package.json', '@babel/runtime/package.json']);
    }

    ids = ids.map(safe).filter(Boolean) as string[];

    debug('ids:\n%O', ids);

    const external = (id: string) => {
      if (typeof opts.external === 'function' && opts.external(id)) {
        return true;
      }

      if (Array.isArray(opts.external) && opts.external.includes(id)) {
        return true;
      }

      const resolved = safe(id);

      if (!resolved) {
        return false;
      }

      const resolvedDirname = dirname(resolved);

      // const ret = exps.some(exp => exp.test(id));
      const ret = ids.some(idx => resolvedDirname.startsWith(dirname(idx)));

      debug('external: ', id, resolvedDirname, ret);

      return ret;
    };

    return { ...opts, external };
  },
});
