#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
// @ts-ignore 
const subarg = require("subarg");
//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------
// Parse arguments.
const unknowns = new Set();
const args = subarg(process.argv.slice(2), {
    alias: {
        c: "command",
        C: "clean",
        h: "help",
        includeEmptyDirs: "include-empty-dirs",
        L: "dereference",
        p: "preserve",
        t: "transform",
        u: "update",
        v: "verbose",
        V: "version",
        w: "watch",
    },
    boolean: [
        "clean",
        "dereference",
        "help",
        "include-empty-dirs",
        "initial",
        "preserve",
        "update",
        "verbose",
        "version",
        "watch",
    ],
    default: { initial: true },
    unknown(arg) {
        if (arg[0] === "-") {
            unknowns.add(arg);
        }
        // DEVNOTE: 2022/03/15 - fix missed type
        return true;
    }
});
const source = args._[0];
const outDir = args._[1];
/**
 * @typedef TCPZBinMod
 * @prop {() => void} help
 * @prop {() => void} version
 * @prop {(input: string, output: string, args: TMinimistParsedArgs) => void} main
 */
/** @type {keyof TCPZBinMod} */
// @ts-ignore
let modId = "";
// Validate Options.
if (unknowns.size > 0) {
    console.error(`Unknown option(s): ${Array.from(unknowns).join(", ")}`);
    process.exitCode = 1;
}
// Main
else if (args.help) {
    modId = "help";
} else if (args.version) {
    modId = "version";
} else if (source == null || outDir == null || args._.length > 2) {
    modId = "help";
    process.exitCode = 1;
} else {
    modId = "main";
}
if (modId) {
    /** @type {Promise<TCPZBinMod>} */
    const module = Promise.resolve().then(() => require(`./${modId}`));
    if (modId !== "main") {
        module.then(mod => /** @type {TCPZBinMod["help" | "version"]} */(mod[modId])());
    } else {
        module.then(mod => mod.main(source, outDir, args));
    }
}
