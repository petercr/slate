const path = require('path');

const {argv} = require('yargs');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const SlateConfig = require('@shopify/slate-config');
const SlateTagPlugin = require('@shopify/slate-tag-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const packageJson = require('../../../package.json');
const getChunkName = require('../get-chunk-name');
const HtmlWebpackIncludeLiquidStylesPlugin = require('../html-webpack-include-chunks');
const config = new SlateConfig(require('../../../slate-tools.schema'));

const babel = require('./parts/babel');
const sass = require('./parts/sass');
const entry = require('./parts/entry');
const core = require('./parts/core');
const css = require('./parts/css');
const getLayoutEntrypoints = require('./utilities/get-layout-entrypoints');
const getTemplateEntrypoints = require('./utilities/get-template-entrypoints');

const plugins = [
  new MiniCssExtractPlugin({
    filename: '[name].css.liquid',
  }),

  new webpack.DefinePlugin({
    'process.env': {NODE_ENV: '"production"'},
  }),

  new UglifyJSPlugin({
    sourceMap: true,
  }),

  new HtmlWebpackPlugin({
    excludeChunks: ['static'],
    filename: `../snippets/script-tags.liquid`,
    template: path.resolve(__dirname, '../script-tags.html'),
    inject: false,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: false,
      preserveLineBreaks: true,
      // more options:
      // https://github.com/kangax/html-minifier#options-quick-reference
    },
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency',
    liquidTemplates: getTemplateEntrypoints(),
    liquidLayouts: getLayoutEntrypoints(),
  }),

  new HtmlWebpackPlugin({
    filename: `../snippets/style-tags.liquid`,
    template: path.resolve(__dirname, '../style-tags.html'),
    inject: false,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: false,
      preserveLineBreaks: true,
      // more options:
      // https://github.com/kangax/html-minifier#options-quick-reference
    },
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency',
    liquidTemplates: getTemplateEntrypoints(),
    liquidLayouts: getLayoutEntrypoints(),
  }),

  new HtmlWebpackIncludeLiquidStylesPlugin(),

  new SlateTagPlugin(packageJson.version),
];

if (argv.analyze || argv.a) {
  plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      defaultSizes: 'gzip',
      generateStatsFile: true,
      openAnalyzer: true,
      reportFilename: path.resolve(`../build-analysis/index.html`),
      statsFilename: path.resolve(`../build-analysis/results.json`),
    })
  );
}

module.exports = merge([
  core,
  entry,
  babel,
  sass,
  css,
  {
    mode: 'production',
    devtool: 'hidden-source-map',
    plugins,
    optimization: {
      splitChunks: {
        chunks: 'initial',
        name: getChunkName,
      },
    },
  },
  config.get('webpack.extend'),
]);
