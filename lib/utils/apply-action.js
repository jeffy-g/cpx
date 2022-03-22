"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyAction = void 0;
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
 * @param {function(string): Promise<void>} action - The action function to apply.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 * @private
 */
function applyAction(pattern, options, action) {
    return new Promise((resolve, reject) => {
        let count = 0;
        let done = false;
        /** @type {any} */
        let lastError = null;
        /**
         * Calls the callback function if done.
         * @returns {void}
         */
        const next = () => {
            if (done && count === 0) {
                if (lastError === null) {
                    resolve();
                }
                else {
                    reject(lastError);
                }
            }
        };
        // const handleResolve = () => {};
        /**
         * @param {any} error
         * @param {true | undefined} [stop]
         */
        const handleReject = (error, stop) => {
            if (stop) {
                done = true;
            }
            else {
                count--;
            }
            lastError = lastError || error;
            next();
        };
        const globOptions = {
            nodir: !options.includeEmptyDirs,
            silent: true,
            follow: Boolean(options.dereference),
            nosort: true,
        };
        try {
            new glob.Glob(pattern, globOptions).on("match", (sourcePath) => {
                if (lastError !== null) {
                    return;
                }
                count++;
                try {
                    action(sourcePath).then(() => {
                        count--;
                        next();
                    }, handleReject);
                }
                catch (error) {
                    handleReject(error);
                }
            }).on("end", () => {
                done = true;
                next();
            }).on("error", error => {
                // done = true;
                // lastError = lastError || error;
                // next();
                handleReject(error, true);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.applyAction = applyAction;
