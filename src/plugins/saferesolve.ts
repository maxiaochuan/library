export default () => {
  return {
    name: 'saferesolve',
    resolveId(source: any) {
      require.resolve(source);
      return null;
    },
  };
};
