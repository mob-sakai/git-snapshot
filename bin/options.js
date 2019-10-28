const yargs = require('yargs')
  .usage(
    `usage: git snapshot --branch=<branch> [--prefix=<path>] [--message=<commit message>] [--tag=<tag name>] [--remote=<repository url|remote name>] [--dry-run] [--cwd=<path>]`
  )
  .option('branch', {
    requiresArg: true,
    alias: 'b',
    describe: 'the name of branch for split to',
    type: 'string',
    group: 'Required'
  })
  .option('prefix', {
    requiresArg: true,
    alias: 'p',
    describe: 'the name of the subdir to split out',
    type: 'string'
  })
  .option('message', {
    requiresArg: true,
    alias: 'm',
    describe: 'commit message',
    type: 'string'
  })
  .option('author', {
    requiresArg: true,
    alias: 'a',
    describe: 'override the commit author',
    type: 'string'
  })
  .option('force', {
    alias: 'f',
    describe: 'allow force commit, tag, push',
    type: 'boolean'
  })
  .option('tag', {
    requiresArg: true,
    alias: 't',
    describe: 'tag name',
    type: 'string'
  })
  .option('remote', {
    requiresArg: true,
    alias: 'r',
    describe: 'remote repository',
    type: 'string'
  })
  .option('dry-run', {
    alias: 'd',
    describe: 'skip publishing',
    type: 'boolean'
  })
  .option('debug', {
    describe: 'output debugging information',
    type: 'boolean'
  })
  .option('cwd', {
    requiresArg: true,
    alias: 'c',
    describe: 'working directory',
    type: 'string'
  })
  .alias('version', 'v')
  .alias('help', 'h')
  .demandOption(['branch']);

if (yargs.argv.debug) {
  // Debug must be enabled before other requires in order to work
  require('debug').enable('git-snapshot:*');
}

module.exports = yargs;
