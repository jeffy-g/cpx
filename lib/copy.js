"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy = void 0;
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
const copy_file_1 = require("./utils/copy-file");
const remove_file_1 = require("./utils/remove-file");
const misc = require("./utils/misc");
const { assertPathString } = misc;
//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
/**
 * Copy files asynchronously.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCopyOptions | ((arg0: Error | null) => any)} [options] The options.
 * @param {(arg0: Error | null) => any} [callback] The callback function which will go fulfilled after done.
 * @returns {Promise<void | Promise<void>>} The promise which will go fulfilled after done.
 * @see {@link TCopyOptions}
 */
function copy(source, outputDir, options, callback) {
    /*eslint-disable no-param-reassign */
    if (typeof options === "function") {
        callback = options;
        options = undefined;
    }
    /*eslint-enable no-param-reassign */
    const promise = (async () => {
        assertPathString(source, "source");
        assertPathString(outputDir, "outputDir");
        if (options) {
            assert(typeof options === "object", "'options' should be an object.");
        }
        if (callback) {
            assert(typeof callback === "function", "'callback' should be a function.");
        }
        const normalizedOpt = (0, normalize_options_1.normalizeOptions)(source, outputDir, options);
        // Clean
        if (normalizedOpt.clean) {
            const output = normalizedOpt.toDestination(normalizedOpt.source);
            if (output !== normalizedOpt.source) {
                await (0, apply_action_1.applyAction)(output, normalizedOpt, targetPath => (0, remove_file_1.removeFile)(targetPath));
            }
        }
        // Copy
        await (0, apply_action_1.applyAction)(normalizedOpt.source, normalizedOpt, sourcePath => {
            const outputPath = normalizedOpt.toDestination(sourcePath);
            if (outputPath !== sourcePath) {
                return (0, copy_file_1.copyFile)(sourcePath, outputPath, normalizedOpt);
            }
            return Promise.resolve();
        });
    })();
    if (typeof callback === "function") {
        // @ts-ignore
        promise.then(() => callback(null), callback);
    }
    return promise;
}
exports.copy = copy;
