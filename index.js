const path = require('path');
const chalk = require('chalk');
const debug = require('debug')('git-snapshot:');
const fs = require('fs-extra');
const tempy = require('tempy');
const git = require('./lib/git');

/**
 * Take a snapshot of the directory and creates/updates another branch, like `git subtree split --squash`.
 *
 * @param {Object} argv git-snapshot options.
 * @param {String} argv.prefix the name of the subdir to split out
 * @param {String} argv.branch the name of branch for split to
 * @param {String} argv.message commit message
 * @param {String} argv.author override the commit author
 * @param {Boolean} argv.force allow force commit, tag, push
 * @param {String} argv.tag tag name
 * @param {String} argv.remote remote repository
 * @param {Boolean} argv.dryRun skip publishing
 * @param {String} argv.cwd working directory
 * @param {Boolean} argv.debug output debugging information
 */
async function gitSnapshot(argv) {
  const {prefix, branch, message, auther, force, tag, remote, dryRun, cwd} = {cwd: process.cwd(), ...argv};

  if (argv.debug) {
    // Debug must be enabled before other requires in order to work
    require('debug').enable('git-snapshot:*');
  }

  let isAddedWorktree = false;
  let isAddedTag = false;
  let isAddedWorkBranch = false;
  let failed = false;
  const worktreePath = tempy.directory();
  const workBranch = path.basename(worktreePath);
  const refs = remote ? `refs/remotes/${remote}/${branch}` : `refs/heads/${branch}`;
  const onCwdOpts = {cwd};
  const onWorktreeOpts = {cwd: worktreePath};
  const autherOpt = auther ? ['--auther', auther] : [];
  const prefixPath = path.resolve(prefix);
  const forceOpt = force ? '--force' : '';

  try {
    // Check that cwd and prefix directory exist.
    debug(`Check that cwd and prefix directory exist: ${cwd} ${prefix}`);
    if (!fs.pathExistsSync(cwd)) {
      throw new Error(`cwd directory '${cwd}' is not found`);
    } else if (!fs.pathExistsSync(prefixPath)) {
      throw new Error(`prefix directory '${prefixPath}' is not found`);
    }

    // Add worktree for the task.
    debug(`Check that the tag does not exist: ${tag}`);
    await git(['worktree', 'add', '--detach', worktreePath], onCwdOpts);
    isAddedWorktree = true;

    // Checkout working branch.
    debug(`Checkout working branch: ${branch} as ${workBranch} on ${onWorktreeOpts.cwd}`);
    await git(['checkout', '-B', workBranch, refs], onWorktreeOpts) //
      .catch(async () => {
        await git(['checkout', '-B', workBranch, `refs/heads/${branch}`], onWorktreeOpts) //
          .catch(async () => {
            await git(['checkout', '--orphan', workBranch], onWorktreeOpts);
          });
      });
    isAddedWorkBranch = true;

    // Check empty commit
    await git(['commit', '--allow-empty', '-m', 'empty commit'].concat(autherOpt), onWorktreeOpts);

    // Check permissions for remote branch.
    if (remote) {
      debug(`Check permissions for remote: \`${remote}\` ${branch}`);
      await git(['fetch', remote], onCwdOpts);
      await git(['push', '--dry-run', '-f', remote, `${workBranch}:${branch}`], onCwdOpts);
    }

    // Check that the tag does not exist.
    if (tag && !force) {
      debug(`Check that the tag does not exist: ${tag}`);
      await git(['show-ref', '--verify', `refs/tags/${tag}`], onCwdOpts)
        .catch(() => false)
        .then(exists => {
          if (exists) {
            throw new Error(`tag '${tag}' already exists`);
          }
        });
    }

    // In dry-run mode, return.
    if (dryRun) return;

    // Remove/copy all files in directory.
    debug(`Remove/copy all files in directory: ${prefix}`);
    await git(['rm', '-rf', '--ignore-unmatch', '.'], onWorktreeOpts);
    await fs.copy(prefixPath, worktreePath);

    // Commit files.
    debug(`Commit files:`);
    await git(['add', '-A', '--ignore-errors'], onWorktreeOpts);
    await git(
      ['commit', '--amend', '--allow-empty', '--allow-empty-message', '-m', message].concat(autherOpt),
      onWorktreeOpts
    );

    // Add tag.
    if (tag) {
      debug(`Add tag: ${tag}`);
      await git(['tag', forceOpt, tag], onWorktreeOpts);
      isAddedTag = true;
    }

    // Push to remote repository.
    if (remote) {
      debug(`Push to remote repository: ${remote} ${branch}`);
      await git(['push', forceOpt, remote, `${workBranch}:${branch}`], onWorktreeOpts);
      if (tag) {
        await git(['push', forceOpt, remote, tag], onWorktreeOpts);
      }
    }

    // Completed successflly.
    console.log(chalk.green(chalk.bold(`completed successflly${dryRun ? ' in dry-run mode' : ''}`)));
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
      await git(['tag', '-d', tag], onCwdOpts);
    }

    // Remove added work branch.
    if (isAddedWorkBranch) {
      await git(['branch', '-D', workBranch], onCwdOpts);
    }
  }
}

module.exports = gitSnapshot;
