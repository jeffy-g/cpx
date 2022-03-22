"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = exports.copySync = exports.copy = void 0;
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
//------------------------------------------------------------------------------
// Requirements / Exports
//------------------------------------------------------------------------------
const C = require("./copy");
const CS = require("./copy-sync");
const W = require("./watch");
exports.copy = C.copy;
exports.copySync = CS.copySync;
exports.watch = W.watch;
