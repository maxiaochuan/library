import { join } from 'path';

const storybook = require('@storybook/react/standalone');

export const dev = async ({ mode = 'dev' }) => {
  storybook({
    mode,
    configDir: join(__dirname, '../templates/storybook'),
    port: 3000,
  });
};

export const build = async () => {};
