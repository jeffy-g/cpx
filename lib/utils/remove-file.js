"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const path = require("path");
const fs = require("fs-extra");
//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
/**
 * Remove a file or a directory asynchronously.
 * Additionally, remove the parent directory if it's empty.
 * @param {string} target The path to the target file.
 * @returns {Promise<void>}
 * @private
 */
async function removeFile(target) {
    try {
        const stat = await fs.stat(target);
        if (stat.isDirectory()) {
            await fs.rmdir(target);
        }
        else {
            await fs.unlink(target);
        }
    }
    catch ( /** @type {any} */err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
    // Remove the parent directory if possible.
    try {
        await fs.rmdir(path.dirname(target));
    }
    catch ( /** @type {any} */err) {
        if (err.code !== "ENOTEMPTY") {
            throw err;
        }
    }
}
exports.removeFile = removeFile;
