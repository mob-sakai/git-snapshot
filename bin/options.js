const yargs = require('yargs')
  .usage(
    `usage: git snapshot --prefix=<path> --branch=<branch> --message=<message> [--tag=<tag>] [--remote=<repository>] [--dry-run] [--cwd=<path>]`
  )
  .option('prefix', {
    requiresArg: true,
    alias: 'p',
    describe: 'the name of the subdir to split out',
    type: 'string',
    group: 'Required'
  })
  .option('branch', {
    requiresArg: true,
    alias: 'b',
    describe: 'the name of branch for split to',
    type: 'string',
    group: 'Required'
  })
  .option('message', {
    requiresArg: true,
    alias: 'm',
    describe: 'commit message',
    type: 'string',
    group: 'Required'
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
  .option('cwd', {
    requiresArg: true,
    alias: 'c',
    describe: 'working directory',
    type: 'string',
    default: process.cwd()
  })
  .alias('version', 'v')
  .alias('help', 'h')
  .demandOption(['prefix', 'message', 'branch']);

module.exports = yargs;
