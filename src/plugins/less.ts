// import { createFilter } from '@rollup/pluginutils';

// export interface IOpts {
//   includes?: string[] | string;
//   excludes?: string[] | string;
// }

// export default (opts: IOpts = {}) => {
//   const filter = createFilter(
//     opts.includes || ['**/*.less', '**/*.css'],
//     opts.excludes || 'node_modules/**',
//   );
//   return {
//     name: 'less',
//     async transform(code: string, id: string) {
//       if (!filter(id)) {
//         return null;
//       }
//       console.log(code, id);
//       return null;
//     },
//   };
// };
