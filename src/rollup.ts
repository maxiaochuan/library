// import { join } from 'path';
import { Signale } from 'signale';
import Debug from 'debug';
import { basename, extname, join } from 'path';
import { rollup, watch, InputOptions, OutputOptions, ModuleFormat } from 'rollup';
import TEMP_DIR from 'temp-dir';

// plugins
// 2020-03-28 15:56:39 UNRESOLVED_IMPORT
import nodeResolve from '@rollup/plugin-node-resolve';
// 2020-03-28 16:07:28 for typescript
import typescript from 'rollup-plugin-typescript2';

import { IPackageJSON } from './types';
import { DEFAULT_ROLLUP_ENTRY_FILES, OUTPUT_DIR } from './const';
import { getEntryPath } from './utils';

// for auto external
import external from './plugins/external';

const debug = Debug('mlib:rollup');

export interface IRollupOpts {
  cwd: string;
  format: ModuleFormat;
  dev?: boolean;
  entry?: string;
  name?: string;
  exports?: 'default' | 'named' | 'none' | 'auto';
  runtime?: boolean;
  pkg: IPackageJSON;
}

export default async (opts: IRollupOpts) => {
  debug('input opts:\n%O', opts);
  const signale = new Signale().scope('MLIB', 'ROLLUP', opts.pkg.name || '');

  // 获取rollup的 input 暂时只支持单文件
  const input = opts.entry || getEntryPath(opts.cwd, DEFAULT_ROLLUP_ENTRY_FILES);

  if (!input) {
    throw new Error('rollup entry file failed');
  }

  const name = opts.name || basename(input, extname(input));

  // TODO babel
  // const runtime = opts.format === 'cjs' ? false : opts.runtime;

  const inputOptions: InputOptions = {
    input,
    plugins: [
      nodeResolve({
        preferBuiltins: true, // https://github.com/rollup/plugins/tree/master/packages/node-resolve/#preferbuiltins
      }),
      typescript({
        cacheRoot: join(TEMP_DIR, '.rollup_plugin_typescript2_cache'),
        tsconfig: join(opts.cwd, 'tsconfig.json'),
        tsconfigDefaults: {
          compilerOptions: {
            target: 'esnext',
            declarationDir: OUTPUT_DIR,
            declaration: true,
          },
        },
      }),
      external({ pkg: opts.pkg }),
    ],
  };

  const outputOptions: OutputOptions = {
    file: join(OUTPUT_DIR, `${name}.${opts.format}.js`),
    format: opts.format,
    exports: opts.exports,
  };

  try {
    if (opts.dev) {
      signale.watch(`rollup watching: [${opts.format}]`);
      const watcher = watch({ ...inputOptions, output: outputOptions });
      watcher.on('event', evt => {
        debug('on watch event:\n%O', evt);
      });
      process.on('exit', () => watcher.close());
    } else {
      signale.start(`rollup <- ${input}`);
      const bundle = await rollup(inputOptions);
      await bundle.write(outputOptions);
      signale.complete(`rollup -> ${outputOptions.file}\n\n`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('error', error);
  }
};
