import { fork } from 'child_process';
import { join } from 'path';
import mkdirp from 'mkdirp';
import { writeFileSync } from 'fs';

export const dev = async ({ cwd }: { cwd: string }) => {
  console.log('props cwd', cwd);
  process.chdir(cwd);
  const dir = join(cwd, '.docz');
  mkdirp.sync(dir);

  console.log('321');

  const doczrc = `export default ${JSON.stringify({ typescript: true }, null, 2)}`;

  writeFileSync(join(dir, 'doczrc.js'), doczrc, 'utf-8');

  return new Promise((resolve, reject) => {
    const bin = require.resolve('docz/bin/index.js');

    const child = fork(bin, ['dev']);

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
