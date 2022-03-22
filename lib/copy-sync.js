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
const normalize_options_1 = require("./utils/normalize-options");
const apply_action_sync_1 = require("./utils/apply-action-sync");
const copy_file_sync_1 = require("./utils/copy-file-sync");
const remove_file_sync_1 = require("./utils/remove-file-sync");
const misc = require("./utils/misc");
const { assertPathString } = misc;
//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
/**
 * Copy files synchronously.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCopyOptions} [options] The options.
 * @returns {void}
 */
function copySync(source, outputDir, options) {
    assertPathString(source, "source");
    assertPathString(outputDir, "outputDir");
    if (typeof options === "object" && options !== null) {
        assert(options.transform === void 0, "'options.transform' is not supported in synchronous functions.");
    }
    const normalizedOpt = (0, normalize_options_1.normalizeOptions)(source, outputDir, options);
    // Clean
    if (normalizedOpt.clean) {
        const output = normalizedOpt.toDestination(normalizedOpt.source);
        if (output !== normalizedOpt.source) {
            (0, apply_action_sync_1.applyActionSync)(output, normalizedOpt, targetPath => {
                (0, remove_file_sync_1.removeFileSync)(targetPath);
            });
        }
    }
    // Copy
    (0, apply_action_sync_1.applyActionSync)(normalizedOpt.source, normalizedOpt, sourcePath => {
        const outputPath = normalizedOpt.toDestination(sourcePath);
        if (outputPath !== sourcePath) {
            (0, copy_file_sync_1.copyFileSync)(sourcePath, outputPath, normalizedOpt);
        }
    });
}
exports.copySync = copySync;
