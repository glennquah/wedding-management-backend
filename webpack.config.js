const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/lambda.ts',
  target: 'node',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: 'commonjs2',
  },
  externals: [],
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices/microservices-module',
          '@nestjs/websockets/socket-module',
          'brotli',
        ];
        return lazyImports.includes(resource);
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/.prisma/client'),
          to: path.resolve(__dirname, 'dist/node_modules/.prisma/client'),
        },
        {
          from: path.resolve(
            __dirname,
            'src/email-notification/email-templates',
          ),
          to: path.resolve(__dirname, 'dist/email-templates'),
        },
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist/public'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/pdfkit/js/data'),
          to: path.resolve(__dirname, 'dist/node_modules/pdfkit/js/data'),
        },
      ],
    }),
  ],
};
