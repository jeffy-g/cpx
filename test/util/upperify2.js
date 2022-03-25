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
"use strict";
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const Transform = require("stream").Transform;
//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
/**
 * @typedef {typeof Transform.prototype._transform} TTransformFunction Transform.prototype._transform
 */
/**
 *
 */
class Upperify extends Transform {
    /**
     *
     * @param {Parameters<TTransformFunction>[0]} data
     * @param {Parameters<TTransformFunction>[1]} _encoding
     * @param {Parameters<TTransformFunction>[2]} callback
     */
    _transform(data, _encoding, callback) {
        callback(null, data.toString().toUpperCase());
    }
}
/**
 * Creates a transform stream to convert data to upper cases.
 * @returns {Upperify} A transform stream to convert data to upper cases.
 */
function toUpperCase() {
    return new Upperify();
}
//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------
if (require.main === module) {
    process.stdin.pipe(toUpperCase()).pipe(process.stdout);
}
else {
    module.exports = toUpperCase;
}
