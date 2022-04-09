"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFile = void 0;
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
const path = require("path");
const fs = require("fs-extra");
/**
 * Copy the content of the given file.
 * Transform the content by 'transform' option.
 * @param {string} source - A path of the source file.
 * @param {string} output - A path of the destination file.
 * @param {Required<TNormalizedCpxOption>["transform"]} transforms - Factory functions for transform streams.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 * @private
 */
function copyFileContent(source, output, transforms) {
    return new Promise((resolve, reject) => {
        const reader = fs.createReadStream(source);
        const writer = fs.createWriteStream(output);
        /** @type {import("stream").Stream[]} */
        const streams = [reader];
        /**
         * Clean up.
         * @param {Error} err - An error or undefined.
         * @returns {void}
         */
        function cleanup(err) {
            try {
                for (const s of /** @type {import("stream").Writable[]} */ (streams)) {
                    s.removeListener("error", cleanup);
                    if (typeof s.destroy === "function") {
                        s.destroy();
                    }
                }
                writer.removeListener("error", cleanup);
                writer.removeListener("finish", resolve);
            }
            catch (_err) {
                reject(err);
                return;
            }
            reject(err);
        }
        reader.on("error", cleanup);
        writer.on("error", cleanup);
        writer.on("finish", resolve);
        try {
            /** @type {typeof reader} */
            // @ts-ignore TODO: types
            const reduced = transforms.reduce((input, factory) => {
                const t = factory(source, { outfile: output });
                t.on("error", cleanup);
                streams.push(t);
                // DEVNOTE: 2022/03/17 - cast problem at js
                return input.pipe(t);
            }, reader);
            reduced.pipe(writer);
        }
        catch ( /** @type {any} */err) {
            cleanup(err);
        }
    });
}
/**
 * Copy a file asynchronously.
 * Additionally, copy file attributes also by options.
 * @function
 * @param {string} source - A path of the source file.
 * @param {string} output - A path of the destination file.
 * @param {Required<Pick<TNormalizedCpxOption, "update" | "transform" | "preserve">>} options - Options.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 * @private
 */
async function copyFile(source, output, options) {
    const stat = await fs.stat(source);
    if (options.update) {
        try {
            const dstStat = await fs.stat(output);
            if (dstStat.mtime.getTime() > stat.mtime.getTime()) {
                // Don't overwrite because the file on destination is newer than
                // the source file.
                return;
            }
        }
        catch ( /** @type {any} */dstStatError) {
            // console.log(dstStatError); // watch behavior of `fs.stat` error
            if (dstStatError.code !== "ENOENT") {
                throw dstStatError;
            }
        }
    }
    if (stat.isDirectory()) {
        await fs.ensureDir(output);
    }
    else {
        await fs.ensureDir(path.dirname(output));
        await copyFileContent(source, output, options.transform);
    }
    await fs.chmod(output, stat.mode);
    if (options.preserve) {
        // DEVNOTE: 2022/03/17 - use no `await`
        fs.chown(output, stat.uid, stat.gid);
        // DEVNOTE: 2022/03/17 - use no `await`
        fs.utimes(output, stat.atime, stat.mtime);
    }
}
exports.copyFile = copyFile;
