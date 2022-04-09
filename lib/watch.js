"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = void 0;
/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
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
const assert = require("assert");
const utils = require("./utils");
const w = require("./utils/watcher");
const aa = require("./utils/apply-action");
const rf = require("./utils/remove-file");
const applyAction = aa.applyAction;
const removeFile = rf.removeFile;
// import * as asyncs from "./utils/asyncs";
// const {
//     applyAction, removeFile
// } = asyncs;
const { normalizeOptions, assertPathString } = utils;
const { Watcher } = w;
//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
/**
 * Watch files then copy the files on each change.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCpxOptions} [options] The options.
 * @returns {import("./utils/watcher").Watcher} The watcher object which observes the files.
 */
function watch(source, outputDir, options) {
    assertPathString(source, "source");
    assertPathString(outputDir, "outputDir");
    if (options != null) {
        assert(typeof options === "object", "'options' should be an object.");
    }
    //eslint-disable-next-line no-param-reassign
    const normalizedOpt = normalizeOptions(source, outputDir, options);
    const watcher = new Watcher(normalizedOpt);
    (async () => {
        // Clean
        try {
            if (normalizedOpt.clean) {
                const output = normalizedOpt.toDestination(normalizedOpt.source);
                if (output !== normalizedOpt.source) {
                    await applyAction(output, normalizedOpt, (targetPath) => removeFile(targetPath));
                }
            }
        }
        catch (error) {
            watcher.emit("watch-error", error);
            return;
        }
        watcher.open();
    })();
    return watcher;
}
exports.watch = watch;
