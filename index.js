const chalk = require('chalk');
const debug = require('debug')('git-snapshot');
const fs = require('fs-extra');
const path = require('path');
const tempy = require('tempy');
const git = require('./lib/git');

module.exports = function gitSnapshot(argv) {
  var isAddedWorktree = false;
  var isAddedTag = false;
  var failed = false;
  const cwd = process.cwd();
  const worktreePath = tempy.directory();
  const refs = argv.remote ? `refs/remotes/${argv.remote}/${argv.branch}` : `refs/heads/${argv.branch}`;
  var onCwdOpts = { cwd: argv.cwd };
  var onWorktreeOpts = { cwd: worktreePath };
  const prefix = path.join(argv.cwd, argv.prefix);
  const forceOpt = argv.force ? '--force' : '';
  const commitOpt = (argv.auther ? ['--auther', argv.auther] : []) //
    .concat(argv.force ? ['--allow-empty', '--allow-empty-message'] : []);

  debug(`argv: ${JSON.stringify(argv)}`);

  return (
    Promise.resolve()

      // Check that cwd and prefix directory exist.
      .then(async () => {
        debug(`Check that cwd and prefix directory exist: ${argv.cwd} ${argv.prefix}`);
        if (!fs.pathExistsSync(argv.cwd)) {
          const message = `cwd directory '${argv.cwd}' is not found`;
          throw { all: message, message };
        }
        if (!fs.pathExistsSync(prefix)) {
          const message = `prefix directory '${prefix}' is not found`;
          throw { all: message, message };
        }
      })

      // Check permissions for remote branch.
      .then(async () => {
        if (!argv.remote) return;

        debug(`Check permissions for remote branch: ${argv.remote} ${argv.branch}`);
        await git(['push', '--dry-run', '-f', argv.remote, argv.branch], onCwdOpts);
        await git(['fetch', argv.remote], onCwdOpts);
      })

      // Check that the tag does not exist.
      .then(async () => {
        if (!argv.tag || argv.force) return;

        debug(`Check that the tag does not exist: ${argv.tag}`);
        await git(['show-ref', '--verify', `refs/tags/${argv.tag}`], onCwdOpts)
          .catch(() => false)
          .then(exists => {
            if (exists) {
              const message = `tag '${argv.tag}' already exists`;
              throw { all: message, message };
            }
          });
      })

      // Add worktree for the task.
      .then(async () => {
        if (argv.dryRun) return;

        debug(`Check that the tag does not exist: ${argv.tag}`);
        await git(['worktree', 'add', '--detach', worktreePath], onCwdOpts);
        isAddedWorktree = true;
      })

      // Checkout working branch.
      .then(async () => {
        if (argv.dryRun) return;

        debug(`Checkout working branch: ${onWorktreeOpts.cwd}`);
        await git(['checkout', '-B', argv.branch, refs], onWorktreeOpts) //
          .catch(async err => {
            await git(['checkout', '-B', argv.branch, `refs/heads/${argv.branch}`], onWorktreeOpts) //
              .catch(async err => {
                await git(['checkout', '--orphan', argv.branch], onWorktreeOpts);
              });
          });
      })

      // Remove/copy all files in directory.
      .then(async () => {
        if (argv.dryRun) return;

        debug(`Remove/copy all files in directory: ${argv.prefix}`);
        await git(['rm', '-rf', '--ignore-unmatch', '.'], onWorktreeOpts);
        await fs.copy(path.join(argv.cwd, argv.prefix), worktreePath);
      })

      // Commit files.
      .then(async () => {
        if (argv.dryRun) return;

        debug(`Commit files:`);
        await git(['add', '-A', '--ignore-errors'], onWorktreeOpts);
        await git(['commit', '-m', argv.message].concat(commitOpt), onWorktreeOpts);
      })

      // Add tag.
      .then(async () => {
        if (argv.dryRun || !argv.tag) return;

        debug(`Add tag: ${argv.tag}`);
        await git(['tag', forceOpt, argv.tag], onWorktreeOpts);
        isAddedTag = true;
      })

      // Push to remote repository.
      .then(async () => {
        if (argv.dryRun || !argv.remote) return;

        debug(`Push to remote repository: ${argv.remote} ${argv.branch}`);
        await git(['push', forceOpt, argv.remote, argv.branch], onWorktreeOpts);
        if (argv.tag) {
          await git(['push', forceOpt, argv.remote, argv.tag], onWorktreeOpts);
        }
      })

      // Complete successflly.
      .then(() => console.log(chalk.green(chalk.bold(`completed successflly${argv.dryRun ? ' in dry-run mode' : ''}`))))

      // An exception was caught.
      .catch(err => {
        failed = true;
        console.error(chalk.red(err.all));
        throw err;
      })

      // Finally, remove added worktree and added tag.
      .finally(async () => {
        // Remove added worktree.
        if (isAddedWorktree) {
          await git(['worktree', 'remove', '-f', worktreePath], onCwdOpts);
          await git(['worktree', 'prune'], onCwdOpts);
        }

        // Remove added tag.
        if (failed && isAddedTag) {
          await git(['tag', '-d', argv.tag], onCwdOpts);
        }
      })
  );
};
