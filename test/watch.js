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
const path = require("path");
const fs = require("fs-extra");
// import { pEvent }  from "p-event";
const pEvent = require("p-event");
const ensureDir = fs.ensureDir;
const remove = fs.remove;
const cpx = require("../lib");
const util = require("./util/util");
const delay = util.delay;
const setupTestDir = util.setupTestDir;
const teardownTestDir = util.teardownTestDir;
const verifyTestDir = util.verifyTestDir;
const writeFile = util.writeFile;
const removeFile = util.removeFile;
const execCommand = util.execCommand;
/**
 * @typedef {import("child_process").ChildProcess} ChildProcess description
 */
//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------
/**
 *
 */
const TEST_WATCH_DELAY = 33;
describe("The watch method", () => {
    /** @type {ReturnType<typeof cpx.watch> | null} */
    let watcher = null;
    /** @type {ChildProcess | null} */
    let command = null;
    afterEach(async () => {
        if (watcher) {
            watcher.close();
            watcher = null;
        }
        if (command) {
            // @ts-ignore maybe not null
            command.stdin.write("KILL");
            await pEvent(command, "exit");
            await teardownTestDir("test-ws");
            //eslint-disable-next-line require-atomic-updates
            command = null;
        }
        else {
            await teardownTestDir("test-ws");
        }
    });
    /**
     * Wait for ready.
     * @returns {Promise<void>} The promise which will go fulfilled after done.
     */
    const waitForReady = async () => {
        if (watcher) {
            // @ts-ignore
            await pEvent(watcher, "watch-ready");
        }
        else if (command) {
            while (true) {
                // @ts-ignore
                const chunk = await pEvent(command.stdout, "data");
                if (chunk.indexOf("Be watching") >= 0) {
                    break;
                }
            }
        }
        await delay(TEST_WATCH_DELAY);
    };
    /**
     * Wait for a copy.
     * @returns {Promise<void>} The promise which will go fulfilled after done.
     */
    const waitForCopy = async () => {
        if (watcher) {
            // @ts-ignore
            await pEvent(watcher, "copy");
        }
        else if (command) {
            while (true) {
                // @ts-ignore
                const chunk = await pEvent(command.stdout, "data");
                if (chunk.indexOf("Copied:") >= 0) {
                    break;
                }
            }
        }
        await delay(TEST_WATCH_DELAY);
    };
    /**
     * Wait for a remove.
     * @returns {Promise<void>} The promise which will go fulfilled after done.
     */
    const waitForRemove = async () => {
        if (watcher) {
            // @ts-ignore
            await pEvent(watcher, "remove");
        }
        else if (command) {
            while (true) {
                // @ts-ignore
                const chunk = await pEvent(command.stdout, "data");
                if (chunk.indexOf("Removed:") >= 0) {
                    break;
                }
            }
        }
        await delay(TEST_WATCH_DELAY);
    };
    //==========================================================================
    describe("should copy specified files with globs at first:", () => {
        beforeEach(() => setupTestDir({
            "test-ws/untouchable.txt": "untouchable",
            "test-ws/a/hello.txt": "Hello",
            "test-ws/a/b/this-is.txt": "A pen",
            "test-ws/a/b/that-is.txt": "A note",
            "test-ws/a/b/no-copy.dat": "no-copy",
        }));
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            return verifyTestDir({
                "test-ws/untouchable.txt": "untouchable",
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/b/this-is.txt": "A pen",
                "test-ws/a/b/that-is.txt": "A note",
                "test-ws/a/b/no-copy.dat": "no-copy",
                "test-ws/b/untouchable.txt": null,
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/b/this-is.txt": "A pen",
                "test-ws/b/b/that-is.txt": "A note",
                "test-ws/b/b/no-copy.dat": null,
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a/**/*.txt", "test-ws/b");
            await waitForReady();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a/**/*.txt" test-ws/b --watch --verbose');
            await waitForReady();
            await verifyFiles();
        });
    });
    describe("should copy files in symlink directory at first when `--dereference` option was given:", () => {
        beforeEach(async () => {
            await setupTestDir({
                "test-ws/src/a/hello.txt": "Symlinked",
                "test-ws/a/hello.txt": "Hello",
            });
            await fs.symlink(path.resolve("test-ws/src"), path.resolve("test-ws/a/link"), "junction");
        });
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            return verifyTestDir({
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/link/a/hello.txt": "Symlinked",
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/link/a/hello.txt": "Symlinked",
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a/**/*.txt", "test-ws/b", {
                dereference: true,
            });
            await waitForReady();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a/**/*.txt" test-ws/b --watch --dereference --verbose');
            await waitForReady();
            await verifyFiles();
        });
    });
    describe("should not copy files in symlink directory when `--dereference` option was not given:", () => {
        beforeEach(async () => {
            await setupTestDir({
                "test-ws/src/a/hello.txt": "Symlinked",
                "test-ws/a/hello.txt": "Hello",
            });
            await fs.symlink(path.resolve("test-ws/src"), path.resolve("test-ws/a/link"), "junction");
        });
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            return verifyTestDir({
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/link/a/hello.txt": "Symlinked",
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/link/a/hello.txt": null,
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a/**/*.txt", "test-ws/b", {
                dereference: false,
            });
            await waitForReady();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a/**/*.txt" test-ws/b --watch --verbose');
            await waitForReady();
            await verifyFiles();
        });
    });
    describe("should copy specified files with globs at first even if the glob starts with `./`:", () => {
        beforeEach(() => setupTestDir({
            "test-ws/untouchable.txt": "untouchable",
            "test-ws/a/hello.txt": "Hello",
            "test-ws/a/b/this-is.txt": "A pen",
            "test-ws/a/b/that-is.txt": "A note",
            "test-ws/a/b/no-copy.dat": "no-copy",
        }));
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            return verifyTestDir({
                "test-ws/untouchable.txt": "untouchable",
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/b/this-is.txt": "A pen",
                "test-ws/a/b/that-is.txt": "A note",
                "test-ws/a/b/no-copy.dat": "no-copy",
                "test-ws/b/untouchable.txt": null,
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/b/this-is.txt": "A pen",
                "test-ws/b/b/that-is.txt": "A note",
                "test-ws/b/b/no-copy.dat": null,
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("./test-ws/a/**/*.txt", "test-ws/b");
            await waitForReady();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"./test-ws/a/**/*.txt" test-ws/b --watch --verbose');
            await waitForReady();
            await verifyFiles();
        });
    });
    describe("should clean and copy specified file blobs at first when give clean option:", () => {
        beforeEach(() => setupTestDir({
            "test-ws/untouchable.txt": "untouchable",
            "test-ws/a/hello.txt": "Hello",
            "test-ws/a/b/this-is.txt": "A pen",
            "test-ws/a/b/that-is.txt": "A note",
            "test-ws/a/b/no-copy.dat": "no-copy",
            "test-ws/b/b/remove.txt": "remove",
            "test-ws/b/b/no-remove.dat": "no-remove",
        }));
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            return verifyTestDir({
                "test-ws/untouchable.txt": "untouchable",
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/b/this-is.txt": "A pen",
                "test-ws/a/b/that-is.txt": "A note",
                "test-ws/a/b/no-copy.dat": "no-copy",
                "test-ws/b/untouchable.txt": null,
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/b/this-is.txt": "A pen",
                "test-ws/b/b/that-is.txt": "A note",
                "test-ws/b/b/no-copy.dat": null,
                "test-ws/b/b/remove.txt": null,
                "test-ws/b/b/no-remove.dat": "no-remove",
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a/**/*.txt", "test-ws/b", {
                clean: true,
            });
            await waitForReady();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a/**/*.txt" test-ws/b --clean --watch --verbose');
            await waitForReady();
            await verifyFiles();
        });
    });
    describe("should not copy specified files with globs at first when `--no-initial` option was given:", () => {
        beforeEach(() => setupTestDir({
            "test-ws/untouchable.txt": "untouchable",
            "test-ws/a/hello.txt": "Hello",
            "test-ws/a/b/this-is.txt": "A pen",
            "test-ws/a/b/that-is.txt": "A note",
            "test-ws/a/b/no-copy.dat": "no-copy",
        }));
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            return verifyTestDir({
                "test-ws/untouchable.txt": "untouchable",
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/b/this-is.txt": "A pen",
                "test-ws/a/b/that-is.txt": "A note",
                "test-ws/a/b/no-copy.dat": "no-copy",
                "test-ws/b/untouchable.txt": null,
                "test-ws/b/hello.txt": null,
                "test-ws/b/b/this-is.txt": null,
                "test-ws/b/b/that-is.txt": null,
                "test-ws/b/b/no-copy.dat": null,
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a/**/*.txt", "test-ws/b", {
                initialCopy: false,
            });
            await waitForReady();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a/**/*.txt" test-ws/b --no-initial --watch --verbose');
            await waitForReady();
            await verifyFiles();
        });
    });
    /** @type {TWatchTestContext[]} */
    const patterns = [
        {
            description: "should copy on file added:",
            initialFiles: { "test-ws/a/hello.txt": "Hello" },
            action() {
                return writeFile("test-ws/a/b/added.txt", "added");
            },
            verify: {
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/b/added.txt": "added",
            },
            wait: waitForCopy,
        },
        {
            description: "should do nothing on file added if unmatch file globs:",
            initialFiles: { "test-ws/a/hello.txt": "Hello" },
            action() {
                return (async () => {
                    await writeFile("test-ws/a/b/not-added.dat", "added");
                    await writeFile("test-ws/a/a.txt", "a");
                })();
            },
            verify: {
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/b/not-added.dat": null,
            },
            wait: waitForCopy,
        },
        {
            description: "should copy on file changed:",
            initialFiles: { "test-ws/a/hello.txt": "Hello" },
            action() {
                return writeFile("test-ws/a/hello.txt", "changed");
            },
            verify: { "test-ws/b/hello.txt": "changed" },
            wait: waitForCopy,
        },
        {
            description: "should do nothing on file changed if unmatch file globs:",
            initialFiles: {
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/hello.dat": "Hello",
            },
            action() {
                return (async () => {
                    await writeFile("test-ws/a/hello.dat", "changed");
                    await writeFile("test-ws/a/a.txt", "a");
                })();
            },
            verify: {
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/hello.dat": null,
            },
            wait: waitForCopy,
        },
        {
            description: "should remove in the destination directory on file removed:",
            initialFiles: { "test-ws/a/hello.txt": "Hello" },
            action() {
                return removeFile("test-ws/a/hello.txt");
            },
            verify: { "test-ws/b/hello.txt": null },
            wait: waitForRemove,
        },
        {
            description: "should do nothing on file removed if unmatch file globs:",
            initialFiles: {
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/hello.dat": "Hello",
            },
            action() {
                return (async () => {
                    await removeFile("test-ws/a/hello.dat");
                    await writeFile("test-ws/a/hello.txt", "changed");
                })();
            },
            verify: {
                "test-ws/b/hello.txt": "changed",
                "test-ws/b/hello.dat": null,
            },
            wait: waitForCopy,
        },
    ];
    for (const pattern of patterns) {
        //eslint-disable-next-line no-loop-func
        // @ts-ignore 2022/3/17 20:50:18 - NOTE: author の意図なのか?, 
        //  以前に `describe.only` を使用していたのか?...
        (pattern.only ? describe.only : describe)(pattern.description, () => {
            beforeEach(() => setupTestDir(pattern.initialFiles));
            it("lib version.", async () => {
                watcher = cpx.watch("test-ws/a/**/*.txt", "test-ws/b");
                await waitForReady();
                await pattern.action();
                await pattern.wait();
                await verifyTestDir(pattern.verify);
            });
            it("command version.", async () => {
                command = execCommand('"test-ws/a/**/*.txt" test-ws/b --watch --verbose');
                await waitForReady();
                await pattern.action();
                await pattern.wait();
                await verifyTestDir(pattern.verify);
            });
        });
    }
    describe("should do reactions of multiple events:", () => {
        beforeEach(() => setupTestDir({
            "test-ws/a/hello.txt": "Hello",
            "test-ws/a/hello.dat": "Hello",
        }));
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            return verifyTestDir({
                "test-ws/b/hello.txt": null,
                "test-ws/b/hello.dat": null,
                "test-ws/b/added.txt": "added",
                "test-ws/b/added.dat": null,
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a/**/*.txt", "test-ws/b");
            await waitForReady();
            await removeFile("test-ws/a/hello.dat");
            await removeFile("test-ws/a/hello.txt");
            await writeFile("test-ws/a/added.dat", "added_data");
            await writeFile("test-ws/a/added.txt", "added");
            await waitForCopy();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a/**/*.txt" test-ws/b --watch --verbose');
            await waitForReady();
            await removeFile("test-ws/a/hello.dat");
            await removeFile("test-ws/a/hello.txt");
            await writeFile("test-ws/a/added.dat", "added_data");
            await writeFile("test-ws/a/added.txt", "added");
            await waitForCopy();
            await verifyFiles();
        });
    });
    describe("should copy it when an empty directory is added when '--include-empty-dirs' option was given:", () => {
        beforeEach(() => setupTestDir({
            "test-ws/a/hello.txt": "Hello",
            "test-ws/a/b/hello.txt": "Hello",
        }));
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            assert(fs.statSync("test-ws/b/c").isDirectory());
            return verifyTestDir({
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/b/hello.txt": "Hello",
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a/**", "test-ws/b", {
                includeEmptyDirs: true,
            });
            await waitForReady();
            await ensureDir("test-ws/a/c");
            await waitForCopy();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a/**" test-ws/b --include-empty-dirs --watch --verbose');
            await waitForReady();
            await ensureDir("test-ws/a/c");
            await waitForCopy();
            await verifyFiles();
        });
    });
    describe("should remove it on destination when an empty directory is removed when '--include-empty-dirs' option was given:", () => {
        beforeEach(() => setupTestDir({
            "test-ws/a/hello.txt": "Hello",
            "test-ws/a/b/hello.txt": "Hello",
            "test-ws/a/c": null,
        }));
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            assert.throws(() => fs.statSync("test-ws/b/c"), /ENOENT/u);
            return verifyTestDir({
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/b/hello.txt": "Hello",
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a/**", "test-ws/b", {
                includeEmptyDirs: true,
            });
            await waitForReady();
            await remove("test-ws/a/c");
            await waitForRemove();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a/**" test-ws/b --include-empty-dirs --watch --verbose');
            await waitForReady();
            await remove("test-ws/a/c");
            await waitForRemove();
            await verifyFiles();
        });
    });
    describe("should copy it when a file is added even if '--no-initial' option was given:", () => {
        beforeEach(() => setupTestDir({
            "test-ws/a/hello.txt": "Hello",
            "test-ws/a/b/hello.txt": "Hello",
        }));
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            return verifyTestDir({
                "test-ws/b/hello.txt": null,
                "test-ws/b/b/hello.txt": null,
                "test-ws/b/added.txt": "added",
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a/**", "test-ws/b", {
                initialCopy: false,
            });
            await waitForReady();
            await writeFile("test-ws/a/added.txt", "added");
            await waitForCopy();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a/**" test-ws/b --no-initial --watch --verbose');
            await waitForReady();
            await writeFile("test-ws/a/added.txt", "added");
            await waitForCopy();
            await verifyFiles();
        });
    });
    describe("should copy it when a file is modified even if there are parentheses in path:", () => {
        beforeEach(() => setupTestDir({
            //
            "test-ws/a(paren)/hello.txt": "Hello",
        }));
        /**
         * Verify.
         * @returns {Promise<any>} ok
         */
        function verifyFiles() {
            return verifyTestDir({
                "test-ws/a(paren)/hello.txt": "Hello 2",
                "test-ws/b/hello.txt": "Hello 2",
            });
        }
        it("lib version.", async () => {
            watcher = cpx.watch("test-ws/a(paren)/**", "test-ws/b", {
                initialCopy: false,
            });
            await waitForReady();
            await writeFile("test-ws/a(paren)/hello.txt", "Hello 2");
            await waitForCopy();
            await verifyFiles();
        });
        it("command version.", async () => {
            command = execCommand('"test-ws/a(paren)/**" test-ws/b --no-initial --watch --verbose');
            await waitForReady();
            await writeFile("test-ws/a(paren)/hello.txt", "Hello 2");
            await waitForCopy();
            await verifyFiles();
        });
    });
});
