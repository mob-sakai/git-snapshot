# git-snapshot

![npm](https://img.shields.io/npm/v/git-snapshot)
![npm (beta)](https://img.shields.io/npm/v/git-snapshot/beta)
![node](https://img.shields.io/node/v/git-snapshot)
![NPM](https://img.shields.io/npm/l/git-snapshot)
![npm](https://img.shields.io/npm/dy/git-snapshot)
![npm](https://github.com/mob-sakai/git-snapshot/workflows/CI/badge.svg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

`git-snapshot` is a tool to take a snapshot of the directory and creates/updates another branch, like `git subtree split --squash`.

- `git-snapshot` is a sub-command of `git`
- The snapshot contains **no** commit histories
- Simple and fast
- Unlike `git subtree split`, you can split from the directory in which you want

## Installation

### Global installation

Install globally (add to your `PATH`) and you can use **git-snapshot** as a git sub-command.

```bash
$ npm install --save git-snapshot 
```

### Local installation

For [Node modules projects](https://docs.npmjs.com/getting-started/creating-node-modules) we recommend installing **git-snapshot** locally.

```bash
$ npm install --save git-snapshot 
```

## Usage

### CLI Usage

```sh
usage: git snapshot --prefix=<path> --branch=<branch> --message=<message>
[--tag=<tag>] [--remote=<repository>] [--dry-run] [--cwd=<path>]

Required
  --prefix, -p   the name of the subdir to split out             [string] [required]
  --branch, -b   the name of branch for split to                 [string] [required]
  --message, -m  commit message                                  [string] [required]

Options:
  --help, -h     Show help                                                 [boolean]
  --version, -v  Show version                                              [boolean]
  --allow-empty  allow empty commit                                        [boolean]
  --author, -a   override the commit author                                 [string]
  --force, -f    allow force commit, tag, push                             [boolean]
  --tag, -t      tag name                                                   [string]
  --remote, -r   remote repository                                          [string]
  --dry-run, -d  skip publishing                                           [boolean]
  --cwd, -c      working directory                                          [string]
```

### Code Usage

```js
const gitSnapshot = require('git-snapshot')

// Options are the same as command line, except camelCase
// gitSnapshot returns a Promise
gitSnapshot({
  prefix: './Packages/SomePackage',
  branch: 'upm',
  message: 'Release 1.0.0',
  allowEmpty: false,
  author: 'snapshot',
  force: false,
  tag: '1.0.0',
  remote: 'origin',
  dryRun: false,
  cwd: process.cwd(),
}).then(() => {
  // git-snapshot is done
}).catch(err => {
    console.error(`git-snapshot failed with message: ${err.message}`)
})
```

## License

MIT

## See Also

- GitHub page : https://github.com/mob-sakai/git-snapshot
- npm page : https://www.npmjs.com/package/git-snapshot

[![Patreon](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/join/2343451?)
