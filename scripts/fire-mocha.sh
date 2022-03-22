#!/bin/bash

files=
testName=$1

if [[ -z $testName ]]; then
    testName=*
fi

if [ -d "./dist" ]; then
    files="./dist/test/$testName.js"
elif [ -d "./build" ]; then
    files="./build/test/$testName.js"
else
    # cwd is "dist" or "build"
    files="./test/$testName.js"
fi

# if [[ ! -z $files ]]; then
#     npx mocha --timeout 15000 $files
# else
#     echo "did not exists 'dist' or 'build'"
# fi
npx mocha --timeout 15000 $files
