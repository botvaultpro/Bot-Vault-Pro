'use strict';
const chalk = require('chalk');

const prefix = {
  info:    chalk.cyan('[INFO]'),
  success: chalk.green('[OK]'),
  warn:    chalk.yellow('[WARN]'),
  error:   chalk.red('[ERROR]'),
  step:    chalk.magenta('[STEP]'),
  data:    chalk.blue('[DATA]'),
};

function timestamp() {
  return chalk.gray(new Date().toISOString());
}

const logger = {
  info:    (msg) => console.log(`${timestamp()} ${prefix.info}    ${msg}`),
  success: (msg) => console.log(`${timestamp()} ${prefix.success} ${msg}`),
  warn:    (msg) => console.warn(`${timestamp()} ${prefix.warn}    ${msg}`),
  error:   (msg) => console.error(`${timestamp()} ${prefix.error}   ${msg}`),
  step:    (msg) => console.log(`${timestamp()} ${prefix.step}    ${msg}`),
  data:    (msg) => console.log(`${timestamp()} ${prefix.data}    ${msg}`),
  blank:   ()    => console.log(),
  divider: ()    => console.log(chalk.gray('─'.repeat(60))),
  table:   (data) => console.table(data),
};

module.exports = logger;
