"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy = copy;
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
const assert = require("assert");
const aa = require("./utils/apply-action");
const cf = require("./utils/copy-file");
const rf = require("./utils/remove-file");
const applyAction = aa.applyAction;
const copyFile = cf.copyFile;
const removeFile = rf.removeFile;
const utils = require("./utils");
const { normalizeOptions, assertPathString } = utils;
/**
 * @typedef {(err: Error | null) => any} TErrorHandler
 */
/**
 * Copy files asynchronously.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCpxOptions | TErrorHandler} [options] The options.
 * @param {TErrorHandler} [callback] The callback function which will go fulfilled after done.
 * @returns {Promise<void | Promise<void>>} The promise which will go fulfilled after done.
 * @see {@link TCpxOptions}
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
        const normalizedOpt = normalizeOptions(source, outputDir, options);
        if (normalizedOpt.clean) {
            const output = normalizedOpt.toDestination(normalizedOpt.source);
            if (output !== normalizedOpt.source) {
                await applyAction(output, normalizedOpt, targetPath => removeFile(targetPath));
            }
        }
        await applyAction(normalizedOpt.source, normalizedOpt, sourcePath => {
            const outputPath = normalizedOpt.toDestination(sourcePath);
            if (outputPath !== sourcePath) {
                return copyFile(sourcePath, outputPath, normalizedOpt);
            }
            return Promise.resolve();
        });
    })();
    if (typeof callback === "function") {
        promise.then(() => callback(null), callback);
    }
    return promise;
}