export interface IPackageJSON {
  name?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export type IOutputExports = 'default' | 'named' | 'none' | 'auto';

export interface IConfig {
  esm?: boolean;
  cjs?: boolean;
  // umd?: IUMD;

  runtime?: boolean;

  target?: 'browser' | 'node';
  // for rollup
  entry?: string;
  outputExports?: IOutputExports;
  // alias?: Record<string, string>;
  // dev?: BundleType;
  // doc?: any;
}

export interface IESM {
  name?: string;
}
export interface ICJS {
  name?: string;
}

export interface IBundleOpts {
  entry?: string;
  esm?: IESM;
  cjs?: ICJS;
  runtime: boolean;
  outputExports: IOutputExports;
}

export interface IBuildOpts {
  cwd: string;
}
