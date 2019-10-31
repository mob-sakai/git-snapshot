const path = require('path');
const chalk = require('chalk');
const debug = require('debug')('git-snapshot:git');
const execa = require('execa');
const fs = require('fs-extra');

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

/**
 * Check out a branch.
 *
 * @param {String} [srcBranch] Checkout source branch name.
 * @param {String} [dstBranch] Checkout destination branch name.
 * @param {String} [remote] Remote name or repository url.
 * @param {Object} [execaOpts] Options to pass to `execa`.
 */
async function gitCheckout(srcBranch, dstBranch, remote, execaOpts) {
  if (remote) {
    await git(['fetch', remote, srcBranch], execaOpts)
      .then(async () => {
        await git(['checkout', '-B', dstBranch, 'FETCH_HEAD'], execaOpts);
      })
      .catch(async () => {
        await git(['checkout', '-B', dstBranch, srcBranch], execaOpts) //
          .catch(async () => {
            await git(['checkout', '--orphan', dstBranch], execaOpts);
          });
      });
  } else {
    await git(['checkout', '-B', dstBranch, srcBranch], execaOpts) //
      .catch(async () => {
        await git(['checkout', '--orphan', dstBranch], execaOpts);
      });
  }
}

/**
 * Get ignore from .gitignore.
 *
 * @param {String} [cwd] Working directory.
 */
async function gitIgnore(cwd) {
  const ignore = require('ignore')();
  ignore.add('.git');

  try {
    const rootDir = await git(['rev-parse', '--show-toplevel'], {cwd});
    while (cwd.startsWith(rootDir)) {
      const ignoreFilename = path.resolve(cwd, '.gitignore');
      if (fs.exists(ignoreFilename)) {
        ignore.add(fs.readFileSync(ignoreFilename).toString());
        break;
      }

      cwd = path.dirname(cwd);
    }
  } catch {}

  debug(`${chalk.bold('GitIgnore:')} ${ignore._rules.map(x => chalk.keyword('orange')(x.origin)).join(', ')}`);

  return ignore;
}

/**
 * Copy all files not in .gitignore file.
 *
 * @param {String} [src] Source directory.
 * @param {String} [dst] Destination directory.
 */
async function gitCopy(src, dst) {
  try {
    const ignore = await gitIgnore(src);
    await fs.copy(src, dst, {
      filter: (s, d) => {
        const rel = path.relative(src, s);
        const isIgnored = rel && ignore.ignores(rel);
        if (isIgnored) return false;

        debug(`${chalk.bold('GitCopy:')} ${s} -> ${d}`);
        return true;
      }
    });
  } catch {}
}

module.exports = {git, gitCheckout, gitIgnore, gitCopy};
