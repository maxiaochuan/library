import Debug from 'debug';
import getBuiltins from 'builtins';
import { IPackageJSON } from '../types';

const debug = Debug('mlib:plugins:external');

export interface IExternalOpts {
  builtins?: boolean;
  dependencies?: boolean;
  peerDependencies?: boolean;
  devDependencies?: boolean;
  pkg: IPackageJSON;
}

export default ({
  builtins = true,
  dependencies = true,
  devDependencies = true,
  peerDependencies = true,
  pkg,
}: IExternalOpts) => ({
  name: 'mlib-external',
  options: (opts: any) => {
    let ids: string[] = [
      // TODO: runtime 的引入路径问题 移动到下面
      // // 2020-03-30 00:29:40 for runtime
      // '@babel/runtime',
    ];

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

    const exps = [/@babel\/runtime/].concat(ids.map(id => new RegExp(`^${id}`)));

    debug('exps:\n%O', exps);

    const external = (id: string) => {
      if (typeof opts.external === 'function' && opts.external(id)) {
        return true;
      }

      if (Array.isArray(opts.external) && opts.external.includes(id)) {
        return true;
      }

      const ret = exps.some(exp => exp.test(id));

      debug('external: ', id, ret);

      return ret;
    };

    return { ...opts, external };
  },
});
