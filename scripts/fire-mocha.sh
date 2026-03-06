#!/bin/bash

testName=$1

if [[ -z "$testName" || "$testName" == "*" || $# -gt 1 ]]; then
  testName="*"
fi

if [ -d "./dist" ]; then
  prefix=./dist
elif [ -d "./build" ]; then
  prefix=./build
else
  # cwd is "dist" or "build"
  prefix=./
fi

# echo prefix=["$prefix"]
# npx mocha --timeout 15000 "$prefix/test/$testName.js"

# Why this path:
# - On Node v25.7, `npx mocha` / mocha CLI can fail at startup via yargs ESM/CJS resolution.
# - Running Mocha through Node API avoids that CLI path.
# - `addFile()` does not expand globs, so test files are resolved with `globSync` first.
node -e "$(cat <<END
  const Mocha=require('mocha');
  const { sync: globSync } = require('glob');
  const m=new Mocha({timeout:15000});
  const pattern = '$prefix/test/$testName.js';
  const files = globSync(pattern, { nodir: true }).sort();
  if (files.length === 0) {
    console.error('No test files matched:', pattern);
    process.exit(1);
  }
  for (const file of files) {
    m.addFile(file);
  }
  m.run(f=>process.exitCode=f?1:0);
END
)"

echo "- - - - - - - - - - - - - - - - - - - - - - -"
node test/util/platform-info.js
echo "- - - - - - - - - - - - - - - - - - - - - - -"
