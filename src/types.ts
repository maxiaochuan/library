export interface IPackageJSON {
  name?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface IConfig {
  esm?: boolean;
  cjs?: boolean;
  // umd?: IUMD;

  // runtimeHelpers?: boolean;

  // target?: 'browser' | 'node';
  // for rollup
  entry?: string;
  outputExports?: 'default' | 'named' | 'none' | 'auto';
  // alias?: Record<string, string>;
  // dev?: BundleType;
  // doc?: any;
}

export interface IBundleOpts {
  esm?: {};
  cjs?: {};
}

export interface IBuildOpts {
  cwd: string;
}
