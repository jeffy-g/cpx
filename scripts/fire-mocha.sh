#!/bin/bash

testName=$1

if [[ -z $testName ]]; then
    testName=*
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
npx mocha --timeout 15000 "$prefix/test/$testName.js"
