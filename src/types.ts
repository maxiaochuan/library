export interface IPackageJSON {
  name?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export type IOutputExports = 'default' | 'named' | 'none' | 'auto';

/**
 * example:
 * {
 *    esm?: false | { },
 *    cjs?: false | { },
 *    umd?: { name: '' }
 *    entry: '',
 *    runtime: true | false,
 *    target: 'browser' | 'node',
 *    outputExports: IOutputExports;
 * }
 */
export interface IConfig {
  esm?: false | IESM;
  cjs?: false | ICJS;
  umd?: false | IUMD;

  runtime?: boolean;
  target?: 'browser' | 'node';
  // for rollup
  entry?: string;
  outputFileName?: string;
  outputExports?: IOutputExports;
}

export interface IESM {
  // name?: string;
}
export interface ICJS {
  // name?: string;
}
export interface IUMD {
  name: string;
  globals: Record<string, string>;
}

export interface IBuildOpts {
  cwd: string;
}
