const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Añadir fallback para el módulo crypto
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify")
  };

  // Ignorar advertencias de SourceMap para node_modules
  config.ignoreWarnings = [
    /Failed to parse source map/
  ];

  // Esto puede ser necesario para algunas librerías que esperan la variable global process
  config.plugins.push(
    new webpack.DefinePlugin({
      process: {
        env: {}
      }
    })
  );

  return config;
}; 