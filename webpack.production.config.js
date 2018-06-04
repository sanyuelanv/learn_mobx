const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodeModuleDir = path.resolve(__dirname, 'node_module')
const InlineChunkManifestHtmlWebpackPlugin = require('./manifestInLine')
// 这里需要根据服务器来更改，
const publicPath = '/static'
module.exports = {
  entry: {
    app: [path.resolve(__dirname, 'app/main.js')]
  },
  output: {
    path: path.resolve(__dirname, 'build/static'),
    chunkFilename: 'js/[name].[chunkhash:5].js',
    publicPath: `${publicPath}/`,
    filename: 'js/[name].[chunkhash:5].js'
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      use: ['babel-loader'],
      include: [path.resolve(__dirname, 'app')],
      exclude: [nodeModuleDir]
    },
    {
      test: /\.css$/,
      use: ExtractTextWebpackPlugin.extract({
        use: ['css-loader?minimize&modules&localIdentName=_[local]_[hash:base64:5]', 'postcss-loader'],
        publicPath: '../'
      }),
      include: [path.resolve(__dirname, 'app')],
      exclude: [nodeModuleDir]
    },
    {
      test: /\.(png|svg|jpg|gif)$/,
      use: [{ loader: `url-loader?limit=25000&name=[name].[ext]&outputPath=../image/&publicPath=./${publicPath}/images` }],
      include: [path.resolve(__dirname, 'app')],
      exclude: [nodeModuleDir]
    }

    ]
  },
  mode: 'production',
  // 4.0 之后分代码
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          compress: { drop_console: true },
          output: { comments: false }
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
    runtimeChunk: { name: () => { return 'manifest' } },
    splitChunks: {
      cacheGroups: {
        globals: {
          minChunks: 2,
          name: 'globals',
          priority: -20,
          chunks: 'all'
        }
        // styles: {
        //   name: 'styles',
        //   test: /\.css$/,
        //   chunks: 'all',
        //   enforce: true
        // }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
    new ExtractTextWebpackPlugin('css/style.[hash:5].css'),
    new HtmlWebpackPlugin({
      filename: '../index.html',
      title: 'demo',
      template: 'app/index.html',
      inject: true,
      chunks: ['manifest', 'globals', 'app']
    }),
    new InlineChunkManifestHtmlWebpackPlugin({ inlineChunks: ['manifest'] })
  ]
}
