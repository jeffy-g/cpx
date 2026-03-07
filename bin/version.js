"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = version;
/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * Prints the version text.
 *
 * @returns {void}
 */
function version() {
    // @ts-ignore
    console.log(`v${require("../package.json").version}`);
}