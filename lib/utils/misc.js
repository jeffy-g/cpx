"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertPathString = void 0;
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
const assert = require("assert");
/**
 * @param {string} path
 * @param {string} name
 */
function assertPathString(path, name) {
    assert(typeof path === "string", `'${name}' should be a string.`);
    assert(path.trim().length >= 1, `'${name}' should not be empty.`);
}
exports.assertPathString = assertPathString;
