# git-snapshot

![npm](https://img.shields.io/npm/v/git-snapshot)
![npm (beta)](https://img.shields.io/npm/v/git-snapshot/beta)
![node](https://img.shields.io/node/v/git-snapshot)
![NPM](https://img.shields.io/npm/l/git-snapshot)
![npm](https://img.shields.io/npm/dy/git-snapshot)
![npm](https://github.com/mob-sakai/git-snapshot/workflows/CI/badge.svg)


`git-snapshot` is a command-line tool to take a snapshot of the directory and creates/updates another branch, like `git subtree split --squash`.

- `git-snapshot` uses `git`
- The snapshot contains **no** commit histories
- Simple and fast 
- Unlike `git subtree split`, you can split from another directory

## Install

```sh
npm install -g git-snapshot
```

## Usage

```sh
git-snapshot --prefix=path/to/dir --message='a snapshot' --branch=snapshot_branch
```

# License

MIT

[![Patreon](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/join/2343451?)

# See Also

- GitHub page : https://github.com/mob-sakai/git-snapshot
- npm page : https://www.npmjs.com/package/git-snapshot