const chalk = require('chalk');
const debug = require('debug')('git');
const execa = require('execa');

/**
 * Execute git command.
 *
 * @param {String[]} [args] Arguments for git command.
 * @param {Object} [execaOpts] Options to pass to `execa`.
 *
 * @returns A [`child_process` instance](https://nodejs.org/api/child_process.html#child_process_class_childprocess), which is enhanced to also be a `Promise` for a result `Object` with `stdout` and `stderr` properties.
 */
module.exports = async function git(args, execaOpts) {
  cwd = execaOpts ? execaOpts.cwd || process.cwd() : process.cwd();
  debug(`${chalk.keyword('orange')(cwd)} > git ${args.join(' ')}`);
  return execa('git', args, execaOpts)
    .then(result => debug(result.stdout))
    .catch(err => {
      debug(err.all);
      throw err;
    });
};
