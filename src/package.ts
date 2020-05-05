import { PackageJson } from '@mxcins/types';
import { join } from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import prettier from 'prettier';
import sort from 'sort-package-json';
import { writeFileSync } from 'fs';
import { Signale } from 'signale';
import { getExistPath } from './utils';
import { OUTPUT_TYPES_PATH } from './const';

export default (cwd: string, pkg: PackageJson, outputs: { format: string; file: string }[]) => {
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
