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
 * Remove a file or a directory synchronously.
 * Additionally, remove the parent directory if it's empty.
 * @param {string} target The path to the target file.
 * @returns {void}
 * @private
 */
function removeFileSync(target) {
    try {
        const stat = fs.statSync(target);
        if (stat.isDirectory()) {
            fs.rmdirSync(target);
        }
        else {
            fs.unlinkSync(target);
        }
    }
    catch ( /** @type {any} */err) {
        if (err.code !== "ENOENT") {
            throw err;
        }
    }
    // Remove the parent directory if possible.
    try {
        fs.rmdirSync(path.dirname(target));
    }
    catch ( /** @type {any} */err) {
        if (err.code !== "ENOTEMPTY") {
            throw err;
        }
    }
}
exports.removeFileSync = removeFileSync;
