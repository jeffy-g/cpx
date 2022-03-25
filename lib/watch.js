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
const normalize_options_1 = require("./utils/normalize-options");
const apply_action_1 = require("./utils/apply-action");
const remove_file_1 = require("./utils/remove-file");
const watcher_1 = require("./utils/watcher");
const misc = require("./utils/misc");
const { assertPathString } = misc;
//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
/**
 * Watch files then copy the files on each change.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCopyOptions} [options] The options.
 * @returns {import("./utils/watcher").Watcher} The watcher object which observes the files.
 */
function watch(source, outputDir, options) {
    assertPathString(source, "source");
    assertPathString(outputDir, "outputDir");
    if (options != null) {
        assert(typeof options === "object", "'options' should be an object.");
    }
    //eslint-disable-next-line no-param-reassign
    const normalizedOpt = (0, normalize_options_1.normalizeOptions)(source, outputDir, options);
    const watcher = new watcher_1.Watcher(normalizedOpt);
    (async () => {
        // Clean
        try {
            if (normalizedOpt.clean) {
                const output = normalizedOpt.toDestination(normalizedOpt.source);
                if (output !== normalizedOpt.source) {
                    await (0, apply_action_1.applyAction)(output, normalizedOpt, (targetPath) => (0, remove_file_1.removeFile)(targetPath));
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
