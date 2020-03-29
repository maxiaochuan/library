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

    const external = (id: string) => {
      debug('external: ', id);
      if (typeof opts.external === 'function' && opts.external(id)) {
        return true;
      }

      if (Array.isArray(opts.external) && opts.external.includes(id)) {
        return true;
      }

      return ids.some(idx => new RegExp(`^${idx}`).test(id));
    };

    return { ...opts, external };
  },
});
