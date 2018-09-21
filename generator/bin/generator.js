const program = require('commander');
const readline = require('readline');
const Promise = require('bluebird');
const chalk = Promise.promisifyAll(require('chalk'));
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
    const blackboard = options ?
      chalk`{cyan ${question}}\n{green ${options.map((v, index) => `${index + 1}. ${v}`).join('\n')} }{green \n> }` :
      chalk`{cyan ${question}}\n{green > }`;
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

const answers = {};
const ESLINT_PRESETS = ['default', 'airbnb'];
confirm('What is the name of your project?')
  .then((name) => {
    answers.name = name;
    return confirm('Which eslint template you want to use?', ESLINT_PRESETS);
    // process.exit();
  }).then((eslintIndex) => {
    answers.esLint = ESLINT_PRESETS[parseInt(eslintIndex, 0) - 1];
    if (!answers.esLint) {
      return terminate('Invalid eslint template');
    }
  });
  
