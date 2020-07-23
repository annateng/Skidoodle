const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = (env, argv) => {
  const { mode } = argv
  const additionalPlugins = mode === 'production'
    ? []
    : [new webpack.HotModuleReplacementPlugin()] // Enable hot module replacement

  const additionalEntries = mode === 'production' ? [] : ['webpack-hot-middleware/client?http://localhost:8000']

  return {
    mode,
    entry: [
      '@babel/polyfill', // so we don't need to import it anywhere
      './client',
      ...additionalEntries,
    ],
    resolve: {
      alias: {
        Utilities: path.resolve(__dirname, 'client/util/'),
        Components: path.resolve(__dirname, 'client/components/'),
        Assets: path.resolve(__dirname, 'client/assets/'),
        '@root': path.resolve(__dirname),
      },
    },
    module: {
      rules: [
        {
          // Load JS files
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        { // CSS files
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          // Load LESS files
          test: /\.less$/,
          use: [{
            loader: 'style-loader',
          }, {
            loader: 'css-loader', // translates CSS into CommonJS
          }, {
            // Less loader is for modifying ant.design default theme 
            loader: 'less-loader', // compiles Less to CSS
            options: {
              lessOptions: {
                modifyVars: {
                  'primary-color': '#8aab60',
                  'border-radius-base': '3px',
                  'font-size-base': '20px',
                  'font-size-sm': '16px',
                  'layout-header-background': '#FAFAD2',
                  'layout-body-background': '#f2edeb',
                  'font-family': 'Nanum Gothic Coding, monospace',
                  'btn-font-size-sm': '@font-size-sm',
                  'border-color-split': '#d1d1d1',
                  'border-color-base': '#d1d1d1',
                  'error-color': '#FF6347',
                },
                javascriptEnabled: true,
              }
            }
          }]
        },
        {
          // Load other files
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
          use: ['file-loader'],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.BUILT_AT': JSON.stringify(new Date().toISOString()),
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),
      // Skip the part where we would make a html template
      new HtmlWebpackPlugin({
        template: 'index.html',
        favicon: path.resolve(__dirname, 'client/assets/favicon-64x64.png'),
      }),
      ...additionalPlugins,
    ],
    output: {
      publicPath: '/'
    }
  }
}
