const { override, addWebpackResolve } = require('customize-cra');

module.exports = override(
  addWebpackResolve({
    fallback: {
      "core-js-pure/features/global-this": require.resolve("core-js-pure/features/global-this")
    }
  })
);