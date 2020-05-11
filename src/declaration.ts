import { fork } from 'child_process';
import { Signale } from 'signale';
import { IPackageJSON } from './types';

export default async ({ pkg, watch }: { pkg: IPackageJSON; watch?: boolean }) => {
  const signale = new Signale().scope((pkg.name || '').toUpperCase(), 'DECLARATION');
  // tsc --declaration --outDir lib/ --emitDeclarationOnly --declarationMap
  signale.start('declaration <- start');
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const bin = require.resolve('typescript/bin/tsc');

    const params = [
      '--outDir',
      'dist',
      '--declaration',
      '--emitDeclarationOnly',
      '--preserveWatchOutput',
    ];

    if (watch) {
      params.push('--watch');
    }

    const child = fork(bin, params);

    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('declaration error'));
      } else {
        signale.complete(`declaration -> finish   ${Date.now() - start}ms.\r\n\r\n`);
        resolve();
      }
    });
  });
};
