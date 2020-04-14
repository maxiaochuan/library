import { fork } from 'child_process';
import { join } from 'path';
import mkdirp from 'mkdirp';
// import rimraf from 'rimraf';
import { writeFileSync } from 'fs';
import { IConfig } from './types';

const createGatsbyCustomConfig = (plugins: string[] = []) => `
exports.onCreateBabelConfig = ({ actions }) => {
  ${plugins
    .map(name => {
      if (typeof name === 'string') {
        return `actions.setBabelPlugin({ name: '${name}' });`;
      }

      return `actions.setBabelPlugin({ name: '${name[0]}', options: ${JSON.stringify(name[1])}});`;
    })
    .join('\n')}
}
`;

export const dev = async ({ cwd, conf }: { cwd: string; conf: IConfig }) => {
  process.chdir(cwd);
  const dir = join(cwd, '.docz');
  // rimraf.sync(dir);
  mkdirp.sync(dir);

  const custom = createGatsbyCustomConfig(conf.extraBabelPlugins);

  console.log(custom);

  writeFileSync(join(dir, 'gatsby-node.custom.js'), custom, 'utf-8');

  return new Promise((resolve, reject) => {
    const bin = require.resolve('docz/bin/index.js');

    const child = fork(bin, ['dev', '--typescript']);

    if (child.stdout) {
      child.stdout.on('data', data => {
        process.stdout.write(data);
      });
    }

    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('docz error'));
      } else {
        resolve();
      }
    });
  });
};

export const build = () => {};
