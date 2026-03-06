"use strict";
/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2026 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/* eslint-disable  */
/**
 * @file test/util/platform-info.js
 * @command node test/util/platform-info.js
 */
const os = require("os");
const log = console.log;
function printPlatform(subtitle = "-- empty --") {
    const v8 = process.versions.v8;
    const node = process.versions.node;
    const plat = `${os.type()} ${os.release()} ${os.arch()}
Node.JS: ${node}
V8     : ${v8}`;
    let cpus = os.cpus().map(function (cpu) {
        return cpu.model;
    }).reduce(function (o, model) {
        if (!o[model])
            o[model] = 0;
        o[model]++;
        return o;
    }, /** @type {Record<string, number>} */ ({}));
    const cpusSummary = Object.keys(cpus).map(function (key) {
        return key + " x " + cpus[key];
    }).join("\n");
    log(`Platform info: (${subtitle})`);
    const platfromSummary = plat + "\n" + cpusSummary;
    log(platfromSummary);
    return platfromSummary;
}
printPlatform();