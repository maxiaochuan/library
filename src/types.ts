export interface IPackageJSON {
  name?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export type IOutputExports = 'default' | 'named' | 'none' | 'auto';

export interface IConfig {
  esm?: boolean | IESM;
  cjs?: boolean | ICJS;
  umd?: IUMD;

  runtime?: boolean;
  target?: 'browser' | 'node';
  // for rollup
  entry?: string;
  outputExports?: IOutputExports;
  name?: string;
}

export interface IESM {
  name?: string;
}
export interface ICJS {
  name?: string;
}
export interface IUMD {
  name?: string;
  outputName: string;
}

export interface IBundleOpts {
  entry?: string;
  name?: string;
  esm?: IESM;
  cjs?: ICJS;
  umd?: IUMD;
  runtime: boolean;
  outputExports: IOutputExports;
}

export interface IBuildOpts {
  cwd: string;
}
