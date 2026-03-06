/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const assert = require("assert");
const cp = require("child_process");
const exec = cp.exec;
const dirname = require("path").dirname;
const fs = require("fs-extra");
const execSync = cp.execSync;
const BIN_PREFIX = fs.existsSync("./dist") ? "dist/" : fs.existsSync("./build") ? "build/" : "";
//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------
/**
 * @param {TCpxTestEntryItem} entry
 * @returns
 */
module.exports.isCommand = (/** @type {TCpxTestEntryItem} */ entry) => entry.type === 1 /* ETestEntryType.CMD */;
/**
 * Wait for the given duration.
 *
 * @param {number} ms The duration in milliseconds to wait.
 * @returns {Promise<void>} The promise which will go fulfilled after the duration.
 */
const delay = (module.exports.delay = function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
});
/**
 * Writes specific data to a specific file.
 *
 * @param {string} path - A path to write.
 * @param {string | null} contentText - A text to write.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 */
async function writeFile(path, contentText) {
    if (contentText === null || contentText === undefined) {
        console.warn("contentText is invalid", contentText);
        return;
    }
    await fs.ensureDir(dirname(path));
    await fs.writeFile(path, contentText);
}
module.exports.writeFile = writeFile;
/**
 * Removes a specific file.
 *
 * @param {string} path - A path to write.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 */
module.exports.removeFile = function removeFile(path) {
    return fs.remove(path);
};
/**
 * Gets the content of a specific file.
 *
 * @param {string} path - A path to read.
 * @returns {Promise<string|null>} The content of the file, or `null` if not found.
 */
const readFile = (module.exports.content = async function content(path) {
    try {
        return await fs.readFile(path, { encoding: "utf8" });
    }
    catch (reason) {
        return null;
    }
});
// 2026/03/06 04:10:10 - node v25.6.1
// 16ms - test 19sec
// 50ms - test 22sec
const WAIT = 50;
/**
 * Sets up test files.
 *
 * @param {Record<string, string | null>} dataset - Test data to write.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 */
module.exports.setupTestDir = function setupTestDir(dataset) {
    return Promise.all(Object.keys(dataset).map(path => {
        return dataset[path] == null
            ? fs.ensureDir(path)
            : writeFile(path, dataset[path]);
    })).then(() => delay(WAIT));
};
/**
 * Removes test data.
 *
 * @param {string} testRootPath - A path to write.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 */
module.exports.teardownTestDir = function teardownTestDir(testRootPath) {
    return fs.remove(testRootPath);
};
/**
 * Sets up test files.
 *
 * @param {Record<string, any>} dataset - Test data to write.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 */
module.exports.verifyTestDir = async function verifyTestDir(dataset) {
    for (const path of Object.keys(dataset)) {
        const content = await readFile(path);
        assert.strictEqual(content, dataset[path]);
    }
};
/**
 * Execute cpx command.
 * @param {string} args - Command arguments.
 * @returns {import("child_process").ChildProcess} A child process object.
 */
module.exports.execCpx = function execCpx(args) {
    return exec(`node ${BIN_PREFIX}test/util/bin.js ${args}`);
};
/**
 * Execute cpx command.
 * @param {string} args - Command arguments.
 */
module.exports.execCpxSync = function execCpxSync(args) {
    const command = `node ${BIN_PREFIX}test/util/bin.js ${args}`;
    try {
        const stdout = execSync(command, {
            encoding: "utf8",
            stdio: "pipe",
        });
        return {
            code: 0,
            stdout,
            stderr: "",
        };
    }
    catch ( /** @type {any} */e) {
        return {
            code: typeof e.status === "number" ? e.status : 1,
            stdout: typeof e.stdout === "string" ? e.stdout : String(e.stdout || ""),
            stderr: typeof e.stderr === "string" ? e.stderr : String(e.stderr || ""),
        };
    }
};