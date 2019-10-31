#!/usr/bin/env node

/* istanbul ignore if */
if (process.version.match(/v(\d+)\./)[1] < 8) {
  console.error('git-snapthot: Node v8 or greater is required. `git-snapthot` did not run.');
} else {
  const gitSnapshot = require('..');
  const options = require('./options');
  gitSnapshot(options.argv).catch(() => {
    process.exit(1);
  });
}
