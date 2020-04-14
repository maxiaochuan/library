import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Signale } from 'signale';
import Debug from 'debug';
import sort from 'sort-package-json';
import prettier from 'prettier';
import { CONFIG_FILES, EXTENSIONS, OUTPUT_TYPES_PATH } from './const';
import { IConfig, IPackageJSON } from './types';

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

export const overwritePackageJSON = (
  cwd: string,
  pkg: IPackageJSON,
  outputs: { format: string; file: string }[],
) => {
  try {
    const signale = new Signale().scope((pkg.name || '').toUpperCase(), 'UPDATE_PACKAGE');

    const copy = { ...pkg };

    outputs.forEach(output => {
      const { format, file } = output;

      if (format === 'esm') {
        copy.module = file;
        signale.info(`${format} -> { module: ${file} }`);
      }

      if (format === 'cjs') {
        copy.main = file;
        signale.info(`${format} -> { main: ${file} }`);
      }

      if (format === 'umd') {
        copy.unpkg = file;
        signale.info(`${format} -> { unpkg: ${file} }`);
      }
    });

    if (!copy.main) {
      copy.main = copy.module;
      signale.info(`overwrite -> { main: ${copy.main} }`);
    }

    const typesPath = getExistPath(cwd, [OUTPUT_TYPES_PATH]);

    if (typesPath) {
      copy.types = OUTPUT_TYPES_PATH;
    }

    writeFileSync(
      join(cwd, 'package.json'),
      prettier.format(JSON.stringify(sort(copy)), { parser: 'json', printWidth: 1 }),
      { encoding: 'utf8' },
    );

    signale.complete('overwrite package.json done.\n\n');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};
