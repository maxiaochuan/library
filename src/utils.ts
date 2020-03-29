import { existsSync } from 'fs';
import { join } from 'path';
import Debug from 'debug';
import { CONFIG_FILES, EXTENSIONS } from './const';
import { IConfig, IBundleOpts } from './types';

const debug = Debug('mlib:utils');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const d = <T>(o: any): T => o.default || o;

export class ConfigError extends Error {
  public name = 'ConfigError';
}

export const getExistPath = (cwd: string, paths: string[], opts: { relative?: boolean } = {}) => {
  const exists: { absolute: string; relative: string }[] = [];
  paths.forEach(path => {
    const absPath = join(cwd, path);
    if (existsSync(absPath)) {
      exists.push({ absolute: absPath, relative: path });
    }
  });

  if (!exists.length) {
    return false;
  }

  return opts.relative ? exists[0].relative : exists[0].absolute;
};

export const getEntryPath = (cwd: string, paths: string[]) => {
  const exist = getExistPath(cwd, paths, { relative: true });
  return exist;
};

export const getBundleOpts = (cwd: string) => {
  const path = getExistPath(cwd, CONFIG_FILES);
  if (!path) {
    throw new ConfigError('Config file is not exist, skip project!\n\n');
  }

  require('@babel/register')({
    presets: [
      require.resolve('@babel/preset-typescript'),
      [require.resolve('@babel/preset-env'), { targets: { node: 10 }, modules: 'auto' }],
    ],
    extensions: EXTENSIONS,
    only: CONFIG_FILES.map(f => join(cwd, f)),
  });

  const config: IConfig = d(require(path));

  const opts: IBundleOpts = {};

  debug('user config:\n%O', config);
  debug('buidle options:\n%O', opts);

  if (config.esm) {
    opts.esm = {};
  }

  if (config.cjs) {
    opts.cjs = {};
  }

  return opts;
};
