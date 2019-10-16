const path = require('path');
const chalk = require('chalk');
const debug = require('debug')('git-snapshot');
const fs = require('fs-extra');
const tempy = require('tempy');
const git = require('./lib/git');

async function gitSnapshot(argv) {
  let isAddedWorktree = false;
  let isAddedTag = false;
  let failed = false;
  const worktreePath = tempy.directory();
  const refs = argv.remote ? `refs/remotes/${argv.remote}/${argv.branch}` : `refs/heads/${argv.branch}`;
  const onCwdOpts = {
    cwd: argv.cwd
  };
  const onWorktreeOpts = {
    cwd: worktreePath
  };
  const prefix = path.join(argv.cwd, argv.prefix);
  const forceOpt = argv.force ? '--force' : '';
  const commitOpt = (argv.auther ? ['--auther', argv.auther] : []) //
    .concat(argv.force ? ['--allow-empty', '--allow-empty-message'] : []);

  debug(`argv: ${JSON.stringify(argv)}`);

  try {
    // Check that cwd and prefix directory exist.
    debug(`Check that cwd and prefix directory exist: ${argv.cwd} ${argv.prefix}`);
    if (!fs.pathExistsSync(argv.cwd)) {
      throw new Error(`cwd directory '${argv.cwd}' is not found`);
    } else if (!fs.pathExistsSync(prefix)) {
      throw new Error(`prefix directory '${prefix}' is not found`);
    }

    // Check permissions for remote branch.
    if (argv.remote) {
      debug(`Check permissions for remote branch: ${argv.remote} ${argv.branch}`);
      await git(['push', '--dry-run', '-f', argv.remote, argv.branch], onCwdOpts);
      await git(['fetch', argv.remote], onCwdOpts);
    }

    // Check that the tag does not exist.
    if (argv.tag && !argv.force) {
      debug(`Check that the tag does not exist: ${argv.tag}`);
      await git(['show-ref', '--verify', `refs/tags/${argv.tag}`], onCwdOpts)
        .catch(() => false)
        .then(exists => {
          if (exists) {
            throw new Error(`tag '${argv.tag}' already exists`);
          }
        });
    }

    // In dry-run mode, return.
    if (argv.dryRun) return;

    // Add worktree for the task.
    debug(`Check that the tag does not exist: ${argv.tag}`);
    await git(['worktree', 'add', '--detach', worktreePath], onCwdOpts);
    isAddedWorktree = true;

    // Checkout working branch.
    debug(`Checkout working branch: ${onWorktreeOpts.cwd}`);
    await git(['checkout', '-B', argv.branch, refs], onWorktreeOpts) //
      .catch(async () => {
        await git(['checkout', '-B', argv.branch, `refs/heads/${argv.branch}`], onWorktreeOpts) //
          .catch(async () => {
            await git(['checkout', '--orphan', argv.branch], onWorktreeOpts);
          });
      });

    // Remove/copy all files in directory.
    debug(`Remove/copy all files in directory: ${argv.prefix}`);
    await git(['rm', '-rf', '--ignore-unmatch', '.'], onWorktreeOpts);
    await fs.copy(path.join(argv.cwd, argv.prefix), worktreePath);

    // Commit files.
    debug(`Commit files:`);
    await git(['add', '-A', '--ignore-errors'], onWorktreeOpts);
    await git(['commit', '-m', argv.message].concat(commitOpt), onWorktreeOpts);

    // Add tag.
    if (argv.tag) {
      debug(`Add tag: ${argv.tag}`);
      await git(['tag', forceOpt, argv.tag], onWorktreeOpts);
      isAddedTag = true;
    }

    // Push to remote repository.
    if (argv.remote) {
      debug(`Push to remote repository: ${argv.remote} ${argv.branch}`);
      await git(['push', forceOpt, argv.remote, argv.branch], onWorktreeOpts);
      if (argv.tag) {
        await git(['push', forceOpt, argv.remote, argv.tag], onWorktreeOpts);
      }
    }

    // Completed successflly.
    console.log(chalk.green(chalk.bold(`completed successflly${argv.dryRun ? ' in dry-run mode' : ''}`)));
  } catch (error) {
    failed = true;
    console.error(chalk.red(error.message));
    throw error;
  } finally {
    // Remove added worktree.
    if (isAddedWorktree) {
      await git(['worktree', 'remove', '-f', worktreePath], onCwdOpts);
      await git(['worktree', 'prune'], onCwdOpts);
    }

    // Remove added tag.
    if (failed && isAddedTag) {
      await git(['tag', '-d', argv.tag], onCwdOpts);
    }
  }
}

module.exports = gitSnapshot;
