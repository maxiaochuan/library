const { join, resolve } = require('path');
const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');

const cwd = process.cwd();

const presets = [
  [
    require.resolve('babel-preset-mxcins'),
    {
      debug: false,
      env: { targets: { ie: 11 }, corejs: 3, useBuiltIns: 'entry', modules: false },
      react: {},
      typescript: {},
      transformRuntime: false,
    },
  ],
];

module.exports = {
  stories: [join(cwd, '**/*.stories.(ts|tsx|js|jsx|mdx)')],
  addons: [
    '@storybook/addon-docs/register',
    '@storybook/addon-storysource',
    '@storybook/addon-backgrounds/register',
    '@storybook/addon-a11y/register',
    // '@storybook/addon-knobs/register',
  ],
  webpackFinal: async config => {
    config.module.rules.push({
      test: [/\.(jsx?$|tsx?$)/],
      use: [
        { loader: 'babel-loader', options: { presets } },
        {
          loader: 'react-docgen-typescript-loader',
          options: {
            tsconfigPath: resolve(cwd, 'tsconfig.json'),
          },
        },
      ],
      exclude: [/node_modules/],
    });

    config.module.rules.push({
      test: /\.(stories|story)\.mdx$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            plugins: ['@babel/plugin-transform-react-jsx'],
          },
        },
        {
          loader: '@mdx-js/loader',
          options: {
            compilers: [createCompiler({})],
          },
        },
      ],
    });
    // // 2b. Run `source-loader` on story files to show their source code
    // //     automatically in `DocsPage` or the `Source` doc block.
    config.module.rules.push({
      test: /\.(stories|story)\.jsx?$/,
      loader: require.resolve('@storybook/source-loader'),
      exclude: [/node_modules/],
      enforce: 'pre',
    });
    config.module.rules.push({
      test: /\.(stories|story)\.tsx?$/,
      loaders: [
        {
          loader: require.resolve('@storybook/source-loader'),
          options: { parser: 'typescript' },
        },
      ],
      exclude: [/node_modules/],
      enforce: 'pre',
    });

    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
};
