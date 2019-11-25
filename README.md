# git-snapshot

`git-snapshot` is a tool to _take a snapshot of the directory and creates/updates another branch_, like `git subtree split --squash`.

<img src="https://user-images.githubusercontent.com/12690315/69536339-27db2700-0fc1-11ea-8bff-06e531680e4c.png" width=128> 

[![npm](https://img.shields.io/npm/v/git-snapshot)](https://www.npmjs.com/package/git-snapshot)
[![npm (beta)](https://img.shields.io/npm/v/git-snapshot/beta)](https://www.npmjs.com/package/git-snapshot/v/beta)
![license](https://img.shields.io/npm/l/git-snapshot)
![downloads](https://img.shields.io/npm/dy/git-snapshot)
![release](https://github.com/mob-sakai/git-snapshot/workflows/release/badge.svg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Summary

`git-snapshot` is a tool to _take a snapshot of the directory and creates/updates another branch_, like `git subtree split --squash`.

- `git-snapshot` is a sub-command of `git`
- Take a snapshot of the directory as a commit
- Simple and fast
- Unlike `git subtree split`, you can split from the directory in which you want

## To take a snapshot, `subtree split` vs `snapshot`

|`subtree split`|`snapshot`|
|--|--|
|:+1: Official command<br>- Contain all history<br>:-1: Long commit log<br>:-1: No squash option<br>:-1: No support for moving target directory|- No history<br>:+1: Short commit log<br>:+1: Fast operation<br>:+1: Any target directory|
|<img src="https://user-images.githubusercontent.com/12690315/69534929-1ba19a80-0fbe-11ea-8dda-1fd3f95baa81.png" width=400>|<img src="https://user-images.githubusercontent.com/12690315/69534927-19d7d700-0fbe-11ea-94ad-c1f8e7fdb1f6.png" width=400>|

## Installation

### Global installation

Install globally (add to your `PATH`) and you can use **git-snapshot** as a git sub-command.

```bash
$ npm install -g git-snapshot 
```

### Local installation

For [Node modules projects](https://docs.npmjs.com/getting-started/creating-node-modules) we recommend installing **git-snapshot** locally.

```bash
$ npm install --save git-snapshot 
```

## Usage

### CLI Usage

```
usage: git snapshot --prefix=<path> --branch=<branch> --message=<message>
[--tag=<tag>] [--remote=<repository>] [--dry-run] [--cwd=<path>]

Required
  --branch, -b   the name of branch for split to                 [string] [required]

Options:
  --help, -h     Show help                                                 [boolean]
  --version, -v  Show version                                              [boolean]
  --prefix, -p   the name of the subdir to split out                        [string]
  --message, -m  commit message                                             [string]
  --author, -a   override the commit author                                 [string]
  --force, -f    allow force commit, tag, push                             [boolean]
  --tag, -t      tag name                                                   [string]
  --remote, -r   remote repository                                          [string]
  --dry-run, -d  skip publishing                                           [boolean]
  --debug        output debugging information                              [boolean]
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
- Changelog : https://github.com/mob-sakai/git-snapshot/blob/master/CHANGELOG.md
- npm page : https://www.npmjs.com/package/git-snapshot
- gitgraph.js (a git graph tool) : https://github.com/nicoespeon/gitgraph.js/tree/master/packages/gitgraph-js
- semantic-release (a npm release tool) : https://github.com/semantic-release/semantic-release

[![become_a_sponsor_on_github](https://user-images.githubusercontent.com/12690315/66942881-03686280-f085-11e9-9586-fc0b6011029f.png)](https://github.com/users/mob-sakai/sponsorship)
