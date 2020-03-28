const { eslint } = require('@mxcins/bedrock');

module.exports = {
  ...eslint,
  parserOptions: {
    ...eslint.parserOptions,
    project: 'tsconfig.json',
  },
};
