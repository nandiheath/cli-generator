#!/usr/bin/env node

// const program = require('commander');
const readline = require('readline');
const Promise = require('bluebird');
const chalk = Promise.promisifyAll(require('chalk'));
const path = require('path');
const mkdirp = require('mkdirp');
// const minimatch = require('minimatch');
const ejs = require('ejs');
const util = require('util');

const fs = Promise.promisifyAll(require('fs'));

const MODE_0666 = 0o666;
const MODE_0755 = 0o755;

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');

const { log } = console;

/**
 * Prompt a question to user and wait for the input
 * Will return a promise
 * @param {*} question
 */
async function confirm(question, options) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const blackboard = options
      ? chalk`{cyan ${question}}\n{green ${options.map((v, index) => `${index + 1}. ${v}`).join('\n')} }{green \n> }`
      : chalk`{cyan ${question}}\n{green > }`;
    rl.question(blackboard, (input) => {
      rl.close();
      resolve(input);
    });
  });
}

function terminate(reason) {
  log(chalk.red(reason));
  process.exit();
}

/**
 * echo str > file.
 *
 * @param {String} file
 * @param {String} str
 */
function write(file, str, mode) {
  fs.writeFileSync(file, str, { mode: mode || MODE_0666 });
  log(file + ' ' + chalk.red('created'));
}

function copyTemplate(from, to) {
  write(to, fs.readFileSync(path.join(TEMPLATE_DIR, from), 'utf-8'));
}

/**
 * Load template file.
 */

function loadTemplate(name) {
  var contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (name + '.ejs')), 'utf-8')
  var locals = Object.create(null)

  function render() {
    return ejs.render(contents, locals, {
      escape: util.inspect
    })
  }

  return {
    locals: locals,
    render: render
  }
}

/**
 * Make the given dir relative to base.
 *
 * @param {string} base
 * @param {string} dir
 */

function mkdir(base, dir) {
  var loc = path.join(base, dir)
  mkdirp.sync(loc, MODE_0755)
}

/**
 * Copy multiple files from template directory.
 */
// function copyTemplates(fromDir, toDir, regex) {
//   fs.readdirSync(path.join(TEMPLATE_DIR, fromDir))
//     .filter(minimatch.filter(regex, { matchBase: true }))
//     .forEach((name) => {
//       copyTemplate(path.join(fromDir, name), path.join(toDir, name));
//     });
// }

const ESLINT_PRESETS = ['default', 'airbnb'];

async function main() {
  const name = await confirm('What is the name of your project?');
  const esLintIndex = parseInt(
    await confirm('Which eslint template you want to use?', ESLINT_PRESETS),
    10
  );

  if (Number.isNaN(esLintIndex) || esLintIndex <= 0 || esLintIndex > ESLINT_PRESETS.length) {
    return terminate('Invalid eslint template');
  }
  const esLint = ESLINT_PRESETS[parseInt(esLintIndex, 10) - 1];

  // First create the destination folder
  const dir = path.join('.', name);
  if (dir !== '.') {
    mkdir(dir, '.');
  }

  // 
  const entryPoint = await confirm('What is entry point of your CLI? (default: cli)') || 'cli';

  const pkg = {
    name,
    version: '0.1.0',
    scripts: {
      test: 'mocha --recursive test',
      pretest: 'eslint .'
    },
    dependencies: {
      bluebird: '^3.5.2',
      commander: '^2.18.0'
    },
    devDependencies: {
      chai: '^4.1.2',
      mocha: '^5.2.0',
      eslint: '^5.6.0',
      rewire: '^4.0.1',
      'eslint-plugin-node': '^7.0.1',
      'eslint-config-airbnb-base': '^13.1.0',
      'eslint-plugin-chai-friendly': '^0.4.1',
      'eslint-plugin-import': '^2.14.0',
      'eslint-plugin-mocha': '^5.2.0'
    }
  }
  // Write the package.json file
  write(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')

  // Write the eslint file
  copyTemplate(`.eslintrc-${esLint}.js`, path.join(dir, '.eslintrc.js'));

  // Write the eslintignore and gitignore files
  copyTemplate(`.eslintignore`, path.join(dir, '.eslintignore'));
  copyTemplate(`.gitignore`, path.join(dir, '.gitignore'));

  // Render the index.js file 
  const index = loadTemplate('index.js');

  // TODO: edit the variables for rendering
  write(path.join(dir, `${entryPoint}.js`), index.render(), MODE_0755);

  // copy test files
  mkdir(dir, 'test');
  const testMain = loadTemplate('test/test-main.js');
  testMain.locals.name = entryPoint;
  write(path.join(dir, `test/test-${entryPoint}.js`), testMain.render(), MODE_0755);
  
  // copy the remaining test js files if necessary
  // copyTemplates('test', path.join(dir, 'test'), '*.js');
  return Promise.resolve(true);
}

main().then(() => {
  process.exit(0);
});
