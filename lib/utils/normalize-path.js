"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = void 0;
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
//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
/**
 * Convert the given file path to use glob.
 * Glob doesn't support the delimiter of Windows.
 *
 * @param {string} originalPath - The path to convert.
 * @returns {string} The normalized path.
 * @private
 */
function normalizePath(originalPath) {
    if (!originalPath) {
        // return null;
        throw new Error(`originalPath is null or undefind, originalPath="${originalPath}"`);
    }
    const cwd = process.cwd();
    const relativePath = path.resolve(originalPath);
    const normalizedPath = path.relative(cwd, relativePath).replace(/\\/gu, "/");
    if (/\/$/u.test(normalizedPath)) {
        return normalizedPath.slice(0, -1);
    }
    return normalizedPath || ".";
}
exports.normalizePath = normalizePath;
