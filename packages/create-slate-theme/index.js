#!/usr/bin/env node

/* This file must remain compatible for as many legacy versions of Node as possible. Avoid ES6+ language. */

const chalk = require('chalk');
const program = require('commander');
const semver = require('semver');

const packageJson = require('./package.json');
const config = require('./create-slate-theme.config');

const currentNodeVersion = process.versions.node;

if (!semver.satisfies(currentNodeVersion, '>=8.9.4')) {
  console.log(
    chalk.red(
      `You are running Node ${currentNodeVersion}\n` +
        `Create Slate Theme requires Node 8.9.4 or higher. \n` +
        `Please update your version of Node.`
    )
  );

  process.exit(1);
}

let themeName;
let themeStarter;

program
  .version(packageJson.version)
  .usage(`${chalk.green('<theme-directory>')}[starter-theme] [options]`)
  .arguments('<name> [repo]')
  .option('--skipInstall', 'skip installing theme dependencies')
  .option('--ssh', 'uses SSH to clone git repo')
  .option('--verbose', 'print additional logs')
  .action((name, starter) => {
    themeName = name;
    themeStarter = starter || config.defaultStarter;
  })
  .parse(process.argv);

if (typeof themeName === 'undefined') {
  console.error('Please specify the theme directory:');
  console.log(
    `${chalk.cyan(program.name())} ${chalk.green('<theme-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`${chalk.cyan(program.name())} ${chalk.green('my-theme')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

function assignOption(key) {
  return typeof program[key] === 'undefined'
    ? config.defaultOptions[key]
    : program[key];
}

const options = {
  skipInstall: assignOption('skipInstall'),
  ssh: assignOption('ssh'),
};

require('./create-slate-theme')(themeName, themeStarter, options);
