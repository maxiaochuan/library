export const EXTENSIONS = ['.es6', '.es', '.js', '.jsx', '.mjs', '.ts', '.tsx'];

export const CONFIG_FILES = ['.mlib.js', '.mlib.ts'];

export const OUTPUT_DIRS: Record<string, string> = {
  ESM: 'es',
  CJS: 'lib',
  UMD: 'dist',
  DECLARATION: 'dist',
};

export const DEFAULT_ROLLUP_ENTRY_FILES = [
  'src/index.ts',
  'src/index.tsx',
  'src/index.js',
  'src/index.jsx',
];
