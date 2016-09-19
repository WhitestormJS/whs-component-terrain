import path from 'path';
import webpack from 'webpack';

process.env.BABEL_ENV = 'browser';

export function config({isProduction, pluginSrc, pluginDest}) {
  console.log(isProduction ? 'Production mode' : 'Development mode');

  return {
    devtool: isProduction ? false : 'source-map',
    entry: `${pluginSrc}/index.js`,
    target: 'web',
    output: {
      path: path.join(__dirname, pluginDest),
      filename: 'whs-component-terrain.js',
      library: ['WHS', 'Terrain'],
      libraryTarget: 'umd'
    },
    externals: {
      whitestormjs: 'WHS',
      three: 'THREE',
      'whitestormjs/physics/index': 'Physijs'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
          happy: { id: 'js' }
        }
      ]
    },
    plugins: isProduction
    ? [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
        minimize: true
      }),
    ]
    : []
  };
}
