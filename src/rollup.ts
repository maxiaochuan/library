// import { join } from 'path';
import { Signale } from 'signale';
import Debug from 'debug';
import rimraf from 'rimraf';
import { basename, extname, join } from 'path';
import { rollup, watch, OutputOptions, RollupOptions } from 'rollup';
import TEMP_DIR from 'temp-dir';
import { IOpts as IbabelPresetMxcinsOpts } from 'babel-preset-mxcins';

// plugins
// 2020-03-28 15:56:39 UNRESOLVED_IMPORT
import nodeResolve from '@rollup/plugin-node-resolve';
// 2020-03-28 16:07:28 for typescript
import typescript from 'rollup-plugin-typescript2';
// 2020-03-29 23:03:18 for babel
import babel from 'rollup-plugin-babel';
// 2020-03-30 14:40:05 for umd
import commonjs from '@rollup/plugin-commonjs';

import { IPackageJSON, IConfig, IUMD } from './types';
import { DEFAULT_ROLLUP_ENTRY_FILES, OUTPUT_DIRS, EXTENSIONS } from './const';
import { getEntryPath, getExistPath } from './utils';

// for auto external
import external from './plugins/external';

const debug = Debug('mlib:rollup');

export interface IRollupOpts {
  cwd: string;
  pkg: IPackageJSON;
  format: 'esm' | 'cjs' | 'umd';

  conf: IConfig;

  dev?: boolean;
}

export default async (opts: IRollupOpts) => {
  debug('input opts:\n%O', opts);

  const { cwd, pkg, format, conf } = opts;
  const params = conf[format];

  if (!params) {
    throw new Error(`rollup get params error: ${format}`);
  }

  const signale = new Signale().scope(
    (pkg.name || '').toUpperCase(),
    'ROLLUP',
    format.toUpperCase(),
  );

  // input: 暂时只支持单文件
  const input = conf.entry || getEntryPath(cwd, DEFAULT_ROLLUP_ENTRY_FILES);

  // dir: target dir
  const dir = OUTPUT_DIRS[opts.format.toUpperCase()];
  rimraf.sync(join(cwd, dir));

  if (!input) {
    throw new Error('rollup entry file failed');
  }

  const name = conf.outputFileName || basename(input, extname(input));

  const isTs = !!getExistPath(opts.cwd, ['tsconfig.json']);

  // 2020-03-30 15:40:53 感觉UMD 并不需要runtime 处理
  const runtime = conf.runtime && format === 'esm';
  const target = format === 'cjs' ? 'node' : 'browser';
  const targets = format === 'cjs' ? { node: 10 } : { ie: 10 };

  const babelPresetOptions: IbabelPresetMxcinsOpts = {
    debug: false,
    env: { targets, corejs: 3, useBuiltIns: 'entry', modules: false },
    react: target === 'browser' && {},
    typescript: isTs && {},
    transformRuntime: runtime,
  };

  debug('babel-preset-mxcins options:\n%O', babelPresetOptions);

  const options: RollupOptions = {
    input,
    plugins: [
      nodeResolve({
        preferBuiltins: true, // https://github.com/rollup/plugins/tree/master/packages/node-resolve/#preferbuiltins
      }),
      typescript({
        clean: true,
        cacheRoot: join(TEMP_DIR, '.rollup_plugin_typescript2_cache'),
        tsconfig: join(opts.cwd, 'tsconfig.json'),
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            target: 'esnext',
            declaration: true,
            declarationDir: OUTPUT_DIRS.DECLARATION,
          },
        },
      }),
      babel({
        presets: [[require.resolve('babel-preset-mxcins'), babelPresetOptions]],
        runtimeHelpers: runtime,
        exclude: /\/node_modules\//,
        babelrc: false,
        extensions: EXTENSIONS,
      }),
      external({ format: opts.format, pkg: opts.pkg }),

      // UMD
      format === 'umd' && commonjs({ include: /node_modules/ }),
    ],

    output: {
      file: join(dir, `${name}.${opts.format}.js`),
      format,
      name: format === 'umd' ? (params as IUMD).name : undefined,
      exports: conf.outputExports,
    },
  };

  if (format === 'umd') {
    options.plugins?.push(commonjs({ include: /node_modules/ }));
  }

  debug('rollup options:\n%O', options);

  try {
    if (opts.dev) {
      signale.watch(`rollup watching: [${opts.format}]`);
      const watcher = watch(options);
      watcher.on('event', evt => {
        debug('on watch event:\n%O', evt);
      });
      process.on('exit', () => watcher.close());
    } else {
      signale.start(`rollup <- ${input}`);
      const bundle = await rollup(options);
      const output = options.output as OutputOptions;
      await bundle.write(output);
      signale.complete(`rollup -> ${output.file}\n\n`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('error', error);
  }
};
