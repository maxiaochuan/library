const { eslint } = require('@mxcins/bedrock');

module.exports = {
  root: true,
  ...eslint,
  parserOptions: {
    ...eslint.parserOptions,
    project: 'tsconfig.json',
  },
  rules: {
    ...eslint.rules,
    'no-undef': 2,
    'global-require': 0,
    'import/no-dynamic-require': 0,
    'no-nested-ternary': 0,
  },
};
