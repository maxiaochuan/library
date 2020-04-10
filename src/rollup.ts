// import { join } from 'path';
import { Signale } from 'signale';
import Debug from 'debug';
import { join } from 'path';
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
// 2020-04-03 17:18:33 for css
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

import { IPackageJSON, IConfig, IUMD } from './types';
import { DEFAULT_ROLLUP_ENTRY_FILES, OUTPUT_DIR, EXTENSIONS } from './const';
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

const formatOptions = (opts: IRollupOpts) => {
  const { cwd, format, conf } = opts;
  const params = conf[format];

  if (!params) {
    throw new Error(`rollup get params error: ${format}`);
  }

  // input: 暂时只支持单文件
  const input = conf.entry || getEntryPath(cwd, DEFAULT_ROLLUP_ENTRY_FILES);

  if (!input) {
    throw new Error('rollup entry file failed');
  }

  // 2020-03-31 16:34:01 思来想去 最后感觉用index最好
  //  (pkg.name || '').split('/').pop();
  const name = conf.outputFileName || 'index';

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

  // 2020-03-31 14:28:33 for declaration
  const declaration = true;
  // const declaration = !process.env.MLIB_DECLARATION_DONE;
  // if (declaration) {
  //   process.env.MLIB_DECLARATION_DONE = 'DONE';
  // }

  const options: RollupOptions = {
    input,
    external: conf.external,
    plugins: [
      nodeResolve({
        preferBuiltins: true, // https://github.com/rollup/plugins/tree/master/packages/node-resolve/#preferbuiltins
      }),
      typescript({
        clean: true,
        cacheRoot: join(TEMP_DIR, '.rollup_plugin_typescript2_cache'),
        tsconfig: join(opts.cwd, 'tsconfig.json'),
        tsconfigOverride: {
          compilerOptions: {
            target: 'esnext',
            declaration,
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
      external({
        cwd: opts.cwd,
        format: opts.format,
        pkg: opts.pkg,
      }),
      postcss({
        extract: true,
        use: [
          [
            'less',
            {
              javascriptEnabled: true,
            },
          ],
        ],
        plugins: [autoprefixer],
      }),
      // UMD
      format === 'umd' && commonjs({ include: /node_modules/ }),
    ],

    onwarn(warning: any) {
      console.log(warning);
    },

    output: {
      file: join(OUTPUT_DIR, `${name}.${format}.js`),
      format,
      exports: conf.outputExports,
    },
  };

  if (format === 'umd') {
    options.plugins?.push(commonjs({ include: /node_modules/ }));
    const umd = params as IUMD;
    options.external = [...Object.keys(umd.globals || {})];
    options.output = { ...options.output, name: umd.name, globals: umd.globals };
  }

  return options;
};

export const build = async (opts: IRollupOpts): Promise<{ format: string; file: string }> => {
  debug('input opts:\n%O', opts);

  const signale = new Signale().scope(
    (opts.pkg.name || '').toUpperCase(),
    'ROLLUP',
    opts.format.toUpperCase(),
  );

  const options = formatOptions(opts);
  debug('rollup options:\n%O', options);

  try {
    signale.start(`rollup <- ${options.input}`);
    const start = Date.now();
    const bundle = await rollup(options);
    const output = options.output as OutputOptions;
    await bundle.write(output);
    signale.complete(`rollup -> ${output.file}  ${Date.now() - start}ms.\n\n`);

    return { format: opts.format, file: output.file || '' };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('error', error);
    throw error;
  }
};

export const dev = async (opts: IRollupOpts) => {
  debug('input opts:\n%O', opts);

  const signale = new Signale().scope(
    (opts.pkg.name || '').toUpperCase(),
    'ROLLUP',
    opts.format.toUpperCase(),
  );

  const options = formatOptions(opts);
  debug('rollup options:\n%O', options);

  signale.watch(`rollup watching: [${opts.format}]`);
  const watcher = watch(options);
  watcher.on('event', evt => {
    if (evt.code === 'BUNDLE_START') {
      signale.start(`BUNDLE_START`);
    }
    if (evt.code === 'BUNDLE_END') {
      signale.success(`BUNDLE_END: ${evt.duration}ms.`);
    }
    debug('on watch event:\n%O', evt);
  });
  process.on('exit', () => {
    watcher.close();
  });
};
