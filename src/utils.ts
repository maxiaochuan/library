import { PackageJson } from '@mxcins/types';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import Debug from 'debug';
import { CONFIG_FILES, EXTENSIONS } from './const';
import { IConfig } from './types';

const debug = Debug('mlib:utils');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const d = <T>(o: any): T => o.default || o;

export const isFalse = (bool?: unknown): bool is false =>
  (typeof bool === 'boolean' && bool === false) as any;

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

export const getConfig = (cwd: string) => {
  const path = getExistPath(cwd, CONFIG_FILES);
  if (!path) {
    throw new ConfigError('Config file is not exist, skip project!\n\n');
  }

  require('@babel/register')({
    presets: [
      [
        require.resolve('babel-preset-mxcins'),
        {
          debug: false,
          env: { targets: { node: 10 }, modules: 'auto' },
          react: false,
          typescript: true,
          transformRuntime: false,
        },
      ],
    ],
    extensions: EXTENSIONS,
    only: CONFIG_FILES.map(f => join(cwd, f)),
  });

  const config: IConfig = {
    runtime: true,
    esm: {},
    cjs: {},
    ...d(require(path)),
  };

  debug('config:\n%O', config);

  return config;
};

export const getPackage = (path: string): PackageJson => {
  const dir = path.endsWith('package.json') ? path : join(path, 'package.json');
  try {
    return JSON.parse(readFileSync(dir, 'utf-8'));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`read pakcage error: ${path}.`);
    return {};
  }
};

export const getLernaPackages = (cwd: string) => {
  const dirs = readdirSync(join(cwd, 'packages')).filter(p => !p.startsWith('.'));
  return dirs
    .map(dir => {
      const path = join(cwd, 'packages', dir);
      const pkg = getPackage(join(path, 'package.json'));
      return {
        path,
        name: pkg.name || '',
      };
    })
    .filter(param => param.name);
};
