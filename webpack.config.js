const HtmlWebpackPlugin = require('html-webpack-plugin')
const pkg = require('./package.json')
const webpack = require('webpack')
const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const fs = require('fs')
let plugins = []

function resolve () {
  return path.join.bind(this, __dirname).apply(this, arguments)
}

module.exports = env => {
  const name = pkg.name
  const isProd = env === 'prod'
  const output = {
    path: path.join(__dirname),
    filename: 'dist/[name].min.js',
    library: name,
    libraryTarget: 'umd'
  }

  if (isProd) {
    plugins = [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.BannerPlugin(`${name} - ${pkg.version}`),
      new CompressionPlugin({
        test: /\.js(\?.*)?$/i
      })
    ]
  } else if (env === 'dev') {
    output.filename = 'dist/[name].js'
  } else {
    const index = 'index.html'
    const indexDev = `_${index}`
    const template = fs.existsSync(indexDev) ? indexDev : index
    plugins.push(new HtmlWebpackPlugin({ template, inject: false }))
  }

  // plugins.push(new webpack.ProvidePlugin({
  //   _: 'underscore',
  //   Backbone: 'backbone'
  // }))

  plugins.push(new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: 'dist/[name].min.css',
    chunkFilename: '[id].css'
  }))
  process.env.NODE_ENV = isProd ? 'production' : 'development'
  let optimization = {}
  if (isProd) {
    optimization.minimizer = [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({})
    ]
  }

  return {
    entry: {
      wwjs: './src/index.js',
      wwclass: './test/spec/wwclass.js'
    },
    output: output,
    plugins: plugins,
    // optimization: {
    //   splitChunks: {
    //     chunks: 'all'
    //   }
    // },
    optimization: optimization,
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : (!env ? 'cheap-module-eval-source-map' : false),
    devServer: { headers: { 'Access-Control-Allow-Origin': '*' } },
    // target: 'web',
    module: {
      rules: [ {
        test: /\/index\.js$/,
        loader: 'string-replace-loader',
        query: {
          search: '<# VERSION #>',
          replace: pkg.version
        }
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          resolve('src'),
          require.resolve('hyperhtml/cjs'),
          resolve('test', 'spec')
        ]
      }, {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          }
        ]
      }, {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'dist/img/[name].[ext]',
              limit: 1024
            }
          }
        ]
      }]
    },
    externals: {
      jquery: 'jQuery',
      knockout: 'ko'
    },
    resolve: {
      // symlinks: false,
      modules: [resolve('src'), resolve('node_modules')],
      alias: {
        // jquery: 'cash-dom',
        // jquery: 'umbrellajs',
        // jquery: 'jquery/dist/jquery.slim.min.js',
        // knockout: 'knockout/build/output/knockout-latest'
      }
    }
  }
}
