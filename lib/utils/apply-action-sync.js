"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyActionSync = void 0;
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
const glob = require("glob");
//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
/**
 * Apply the given action to every file which matches to the given pattern.
 *
 * @param {string} pattern - The pattern to find files.
 * @param {Pick<TCopyOptions, "includeEmptyDirs" | "dereference">} options - The option object.
 * @param {(src: string) => void} action - The action function to apply.
 * @returns {void} The promise which will go fulfilled after done.
 * @private
 */
function applyActionSync(pattern, options, action) {
    const globOptions = {
        nodir: !options.includeEmptyDirs,
        silent: true,
        follow: Boolean(options.dereference),
    };
    for (const sourcePath of glob.sync(pattern, globOptions)) {
        action(sourcePath);
    }
}
exports.applyActionSync = applyActionSync;
