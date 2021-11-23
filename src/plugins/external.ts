import Debug from 'debug';
import { builtinModules } from 'module';
import { ModuleFormat } from 'rollup';
import { IPackageJSON } from '../types';

const debug = Debug('mlib:plugins:external');

export interface IExternalOpts extends IOptsByFormat {
  cwd: string;
  format: ModuleFormat;
  pkg: IPackageJSON;
  globals: Record<string, string>;
  react17: boolean;
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
    devDependencies: true,
    peerDependencies: true,
    runtime: false,
  },
};

// 2020-04-14 14:28:29 resolve 方案问题好多， 使用正则
export default ({ cwd, format = 'esm', pkg, globals, react17, ...others }: IExternalOpts) => ({
  name: 'mlib-external',
  options: (opts: any) => {
    const { builtins, dependencies, devDependencies, peerDependencies, runtime } = {
      ...DEFAULT_OPTIONS[format],
      ...others,
    };

    // 2020-04-03 19:13:04 TODO: 解决link 和 lerna 某些引用问题 感觉不是很好 期待解决办法
    // 2020-04-03 22:47:00 好像只有文件可以用- -
    // const rr = createRequire(join(cwd, 'package.json'));

    debug('external options:\n%O', {
      ...DEFAULT_OPTIONS[format],
      ...others,
    });
    let ids: string[] = [];
    if (builtins) {
      ids = ids.concat(builtinModules);
    }

    if (dependencies && pkg.dependencies) {
      ids = ids.concat(Object.keys(pkg.dependencies));
    }

    if (devDependencies && pkg.devDependencies) {
      ids = ids.concat(Object.keys(pkg.devDependencies));
    }

    if (peerDependencies && pkg.peerDependencies) {
      ids = ids.concat(Object.keys(pkg.peerDependencies));
    }

    if (globals) {
      ids = ids.concat(Object.keys(globals) || []);
    }

    // ids = ids.map(id => safe(rr, id)).filter(Boolean) as string[];
    let exps = ids.map(id => new RegExp(`^${id}$`));

    if (runtime) {
      exps = exps.concat([/^@babel\/runtime-corejs3\/.*/, /^@babel\/runtime\/.*/]);
    }

    const external = (id: string) => {
      if (typeof opts.external === 'function' && opts.external(id)) {
        return true;
      }

      if (Array.isArray(opts.external) && opts.external.includes(id)) {
        return true;
      }

      if (react17 && ['react/jsx-runtime'].includes(id)) {
        return true;
      }

      const ret = exps.some(exp => exp.test(id));

      debug('external: %s\n  id: %s\n', ret, id);

      return ret;
    };

    return { ...opts, external };
  },
});
