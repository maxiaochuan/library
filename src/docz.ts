import { fork } from 'child_process';
import { join } from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { writeFileSync } from 'fs';

const gatsby = `
exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({ name:  require.resolve('babel-plugin-import'),
    options: { libraryName: 'antd', style: 'css' },
  })
}
`;

export const dev = async ({ cwd }: { cwd: string }) => {
  process.chdir(cwd);
  const dir = join(cwd, '.docz');
  rimraf.sync(dir);
  mkdirp.sync(dir);

  writeFileSync(join(dir, 'gatsby-node.custom.js'), gatsby, 'utf-8');

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
