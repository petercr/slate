// Set NODE_ENV so slate.config.js can return different values for
// production vs development builds
process.env.NODE_ENV = 'production';
const chalk = require('chalk');
const ora = require('ora');

const spinner = ora({
  text: chalk.magenta(' Compiling...'),
  spinner: 'dots10',
}).start();

/*
 * Run Webpack with the webpack.prod.conf.js configuration file. Write files to disk.
 *
 * If the `deploy` argument has been passed, deploy to Shopify when the compilation is done.
 */
const webpack = require('webpack');

const webpackConfig = require('../../tools/webpack/config/prod');
const packageJson = require('../../package.json');

webpack(webpackConfig, (err, stats) => {
  if (err) throw err;

  process.stdout.write(
    `${stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    })}`
  );

  console.log('');

  spinner.stop();

  if (stats.compilation.errors.length) process.exit(1);
});
