"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copySync = void 0;
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
// import * as syncs from "./utils/syncs";
// const {
//     applyActionSync, copyFileSync, removeFileSync
// } = syncs;import * as aas from "./apply-action-sync";
const aas = require("./utils/apply-action-sync");
const cfs = require("./utils/copy-file-sync");
const rfs = require("./utils/remove-file-sync");
const applyActionSync = aas.applyActionSync;
const copyFileSync = cfs.copyFileSync;
const removeFileSync = rfs.removeFileSync;
const utils = require("./utils");
const { normalizeOptions, assertPathString } = utils;
//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
/**
 * Copy files synchronously.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCpxOptions} [options] The options.
 * @returns {void}
 */
function copySync(source, outputDir, options) {
    assertPathString(source, "source");
    assertPathString(outputDir, "outputDir");
    if (typeof options === "object" && options !== null) {
        assert(options.transform === void 0, "'options.transform' is not supported in synchronous functions.");
    }
    const normalizedOpt = normalizeOptions(source, outputDir, options);
    // Clean
    if (normalizedOpt.clean) {
        const output = normalizedOpt.toDestination(normalizedOpt.source);
        if (output !== normalizedOpt.source) {
            applyActionSync(output, normalizedOpt, targetPath => {
                removeFileSync(targetPath);
            });
        }
    }
    // Copy
    applyActionSync(normalizedOpt.source, normalizedOpt, sourcePath => {
        const outputPath = normalizedOpt.toDestination(sourcePath);
        if (outputPath !== sourcePath) {
            copyFileSync(sourcePath, outputPath, normalizedOpt);
        }
    });
}
exports.copySync = copySync;
