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
  const forceOpt = argv.force ? '--force' : '';
  const commitOpt = (argv.auther ? ['--auther', argv.auther] : []) //
    .concat(argv.force ? ['--allow-empty', '--allow-empty-message'] : []);

  return (
    Promise.resolve()
      // Check permissions for remote branch.
      .then(async () => {
        if (argv.remote) {
          await git(['push', '--dry-run', '-f', argv.remote, argv.branch], onCwdOpts);
          await git(['fetch', argv.remote], onCwdOpts);
        }
      })

      // Check that the tag does not exist.
      .then(async () => {
        if (argv.tag && !argv.force) {
          await git(['show-ref', '--verify', `refs/tags/${argv.tag}`], onCwdOpts)
            .catch(() => false)
            .then(exists => {
              if (exists) {
                const message = `tag '${argv.tag}' already exists`
                throw { all: message, message,  };
              }
            });
        }
      })

      // Add worktree for the task.
      .then(async () => {
        await git(['worktree', 'add', '--detach', worktreePath], onCwdOpts);
        isAddedWorktree = true;
      })

      // Checkout working branch.
      .then(async () => {
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
        await git(['rm', '-rf', '--ignore-unmatch', '.'], onWorktreeOpts);
        await fs.copy(path.join(cwd, argv.prefix), worktreePath);
      })

      // Commit files.
      .then(async () => {
        await git(['add', '-A', '--ignore-errors'], onWorktreeOpts);
        await git(['commit', '-m', argv.message].concat(commitOpt), onWorktreeOpts);
      })

      // Add tag.
      .then(async () => {
        if (argv.tag) {
          await git(['tag', forceOpt, argv.tag], onWorktreeOpts);
          isAddedTag = true;
        }
      })

      // Push to remote repository.
      .then(async () => {
        if (argv.remote) {
          await git(['push', forceOpt, argv.remote, argv.branch], onWorktreeOpts);
          if (argv.tag) {
            await git(['push', forceOpt, argv.remote, argv.tag], onWorktreeOpts);
          }
        }
      })

      // Complete successflly.
      .then(() => console.log(chalk.green(chalk.bold('completed successflly'))))

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
