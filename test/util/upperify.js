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
const through = require("through");
//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
/**
 * Creates a transform stream to convert data to upper cases.
 * @returns {ThroughStream} A transform stream to convert data to upper cases.
 */
function toUpperCase() {
    return through(
    /**
     * @param {Parameters<Parameters<typeof through>[0]>[0]} chunk
     * @this ThroughStream
     */
    function write(chunk) {
        this.queue(chunk.toString().toUpperCase());
    }, 
    /** @this ThroughStream */
    function end() {
        this.queue(null);
    });
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
