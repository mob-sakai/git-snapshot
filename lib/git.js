const chalk = require('chalk');
const debug = require('debug')('git-snapshot:git');
const execa = require('execa');

/**
 * Execute git command.
 *
 * @param {String[]} [args] Arguments for git command.
 * @param {Object} [execaOpts] Options to pass to `execa`.
 *
 * @returns A [`child_process` instance](https://nodejs.org/api/child_process.html#child_process_class_childprocess), which is enhanced to also be a `Promise` for a result `Object` with `stdout` and `stderr` properties.
 */
async function git(args, execaOpts) {
  args = args.filter(x => x);
  const cwd = execaOpts ? execaOpts.cwd || process.cwd() : process.cwd();
  debug(`${chalk.keyword('orange')(cwd)} > git ${args.join(' ')}`);

  try {
    const result = await execa('git', args, execaOpts);
    debug(result.stdout);
    return result.stdout;
  } catch (error) {
    debug(error.all);
    throw new Error(error.all);
  }
}

module.exports = git;
