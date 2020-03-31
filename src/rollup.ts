// import { join } from 'path';
import { Signale } from 'signale';
import Debug from 'debug';
import rimraf from 'rimraf';
import { basename, extname, join } from 'path';
import { rollup, watch, InputOptions, OutputOptions, ModuleFormat } from 'rollup';
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

import { IPackageJSON, IBundleOpts, IUMD } from './types';
import { DEFAULT_ROLLUP_ENTRY_FILES, OUTPUT_DIRS, EXTENSIONS } from './const';
import { getEntryPath, getExistPath } from './utils';

// for auto external
import external from './plugins/external';

const debug = Debug('mlib:rollup');

export interface IRollupOpts extends IBundleOpts {
  cwd: string;
  pkg: IPackageJSON;
  format: ModuleFormat;

  dev?: boolean;
}

export default async (opts: IRollupOpts) => {
  debug('input opts:\n%O', opts);
  const signale = new Signale().scope(
    (opts.pkg.name || '').toUpperCase(),
    'ROLLUP',
    opts.format.toUpperCase(),
  );

  // clear target dir
  const dir = OUTPUT_DIRS[opts.format.toUpperCase()];
  rimraf.sync(join(opts.cwd, dir));

  // 获取rollup的 input 暂时只支持单文件
  const input = opts.entry || getEntryPath(opts.cwd, DEFAULT_ROLLUP_ENTRY_FILES);

  if (!input) {
    throw new Error('rollup entry file failed');
  }

  const name = opts.name || basename(input, extname(input));

  const isTs = !!getExistPath(opts.cwd, ['tsconfig.json']);

  // 2020-03-30 15:40:53 感觉UMD 并不需要runtime 处理
  const runtime = opts.runtime && opts.format === 'esm';
  const target = opts.format === 'cjs' ? 'node' : 'browser';
  const targets = opts.format === 'cjs' ? { node: 10 } : { ie: 10 };

  const babelPresetOptions: IbabelPresetMxcinsOpts = {
    debug: false,
    env: { targets, corejs: 3, useBuiltIns: 'entry', modules: false },
    react: target === 'browser' && {},
    typescript: isTs && {},
    transformRuntime: runtime,
  };

  debug('babel-preset-mxcins options:\n%O', babelPresetOptions);

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
            declarationDir: OUTPUT_DIRS.declaration,
            declaration: true,
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
    ],
  };

  const outputOptions: OutputOptions = {
    file: join(dir, `${name}.${opts.format}.js`),
    format: opts.format,
    exports: opts.format === 'umd' ? 'named' : opts.outputExports,
  };

  if (opts.format === 'umd') {
    const umd = opts.umd as IUMD;
    inputOptions.plugins?.push(commonjs({ include: /node_modules/ }));
    outputOptions.name = umd.outputName;
  }

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
