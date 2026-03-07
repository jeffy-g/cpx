/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";
if (process.argv.some(arg => arg === "-w" || arg === "--watch")) {
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => {
        if (chunk.toString() === "KILL") {
            process.exit(0);
        }
    });
}
require("../../bin/index");