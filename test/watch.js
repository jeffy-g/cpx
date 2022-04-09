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
const assert = require("assert");
const path = require("path");
const fs = require("fs-extra");
// import { pEvent }  from "p-event";
const pEvent = require("p-event");
const ensureDir = fs.ensureDir;
const remove = fs.remove;
const cpx = require("../lib");
const util = require("./util/util");
const isCommand = util.isCommand;
const delay = util.delay;
const setupTestDir = util.setupTestDir;
const teardownTestDir = util.teardownTestDir;
const verifyTestDir = util.verifyTestDir;
const writeFile = util.writeFile;
const removeFile = util.removeFile;
const execCpx = util.execCpx;
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
        else if (command) {
            // @ts-ignore maybe not null
            command.stdin.write("KILL");
            await pEvent(command, "exit");
            //eslint-disable-next-line require-atomic-updates
            command = null;
        }
        await teardownTestDir("test-ws");
    });
    /**
     * @param {string} event
     * @param {string} criteria
     * @returns {() => Promise<void>}
     */
    function createWaiter(event, criteria) {
        return async () => {
            if (watcher) {
                await pEvent(watcher, event);
            }
            else if (command) {
                while (true) {
                    const chunk = await pEvent(/** @type {NonNullable<ChildProcess["stdout"]>} */ (command.stdout), "data");
                    if (chunk.indexOf(criteria) >= 0) {
                        break;
                    }
                }
            }
            await delay(TEST_WATCH_DELAY);
        };
    }
    /**
     * Wait for ready.
     * @returns {Promise<void>} The promise which will go fulfilled after done.
     */
    const waitForReady = createWaiter("watch-ready", "Be watching");
    /**
     * Wait for a copy.
     * @returns {Promise<void>} The promise which will go fulfilled after done.
     */
    const waitForCopy = createWaiter("copy", "Copied:");
    /**
     * Wait for a remove.
     * @returns {Promise<void>} The promise which will go fulfilled after done.
     */
    const waitForRemove = createWaiter("remove", "Removed:");
    //==========================================================================
    /** @type {TCpxTestEntry[]} */
    const testEntries = [{
            // #1
            testTitle: "should copy specified files with globs at first:",
            setupData: {
                "test-ws/untouchable.txt": "untouchable",
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/b/this-is.txt": "A pen",
                "test-ws/a/b/that-is.txt": "A note",
                "test-ws/a/b/no-copy.dat": "no-copy",
            },
            verifyData: {
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
            },
            entries: [
                {
                    type: 2 /* LIB */,
                    patternOrCmd: "test-ws/a/**/*.txt",
                    dest: "test-ws/b"
                }, {
                    type: 1 /* CMD */,
                    patternOrCmd: '"test-ws/a/**/*.txt" test-ws/b --watch --verbose'
                }
            ]
        }, {
            // #2
            testTitle: "should copy files in symlink directory at first when `--dereference` option was given:",
            setupData: {
                "test-ws/src/a/hello.txt": "Symlinked",
                "test-ws/a/hello.txt": "Hello",
            },
            onBeforeEach: () => fs.symlink(path.resolve("test-ws/src"), path.resolve("test-ws/a/link"), "junction"),
            verifyData: {
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/link/a/hello.txt": "Symlinked",
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/link/a/hello.txt": "Symlinked",
            },
            entries: [
                {
                    type: 2 /* LIB */,
                    patternOrCmd: "test-ws/a/**/*.txt",
                    dest: "test-ws/b",
                    opts: {
                        dereference: true,
                    }
                }, {
                    type: 1 /* CMD */,
                    patternOrCmd: '"test-ws/a/**/*.txt" test-ws/b --watch --dereference --verbose'
                }
            ]
        }, {
            // #3
            testTitle: "should not copy files in symlink directory when `--dereference` option was not given:",
            setupData: {
                "test-ws/src/a/hello.txt": "Symlinked",
                "test-ws/a/hello.txt": "Hello",
            },
            onBeforeEach: () => fs.symlink(path.resolve("test-ws/src"), path.resolve("test-ws/a/link"), "junction"),
            verifyData: {
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/link/a/hello.txt": "Symlinked",
                "test-ws/b/hello.txt": "Hello",
                "test-ws/b/link/a/hello.txt": null,
            },
            entries: [
                {
                    type: 2 /* LIB */,
                    patternOrCmd: "test-ws/a/**/*.txt",
                    dest: "test-ws/b",
                    opts: {
                        dereference: false,
                    }
                }, {
                    type: 1 /* CMD */,
                    patternOrCmd: '"test-ws/a/**/*.txt" test-ws/b --watch --verbose'
                }
            ]
        }, {
            // #4
            testTitle: "should copy specified files with globs at first even if the glob starts with `./`:",
            setupData: {
                "test-ws/untouchable.txt": "untouchable",
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/b/this-is.txt": "A pen",
                "test-ws/a/b/that-is.txt": "A note",
                "test-ws/a/b/no-copy.dat": "no-copy",
            },
            verifyData: {
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
            },
            entries: [
                {
                    type: 2 /* LIB */,
                    patternOrCmd: "./test-ws/a/**/*.txt",
                    dest: "test-ws/b",
                }, {
                    type: 1 /* CMD */,
                    patternOrCmd: '"./test-ws/a/**/*.txt" test-ws/b --watch --verbose'
                }
            ]
        }, {
            // #5
            testTitle: "should clean and copy specified file blobs at first when give clean option:",
            setupData: {
                "test-ws/untouchable.txt": "untouchable",
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/b/this-is.txt": "A pen",
                "test-ws/a/b/that-is.txt": "A note",
                "test-ws/a/b/no-copy.dat": "no-copy",
                "test-ws/b/b/remove.txt": "remove",
                "test-ws/b/b/no-remove.dat": "no-remove",
            },
            verifyData: {
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
            },
            entries: [
                {
                    type: 2 /* LIB */,
                    patternOrCmd: "./test-ws/a/**/*.txt",
                    dest: "test-ws/b",
                    opts: {
                        clean: true,
                    }
                }, {
                    type: 1 /* CMD */,
                    patternOrCmd: '"test-ws/a/**/*.txt" test-ws/b --clean --watch --verbose'
                }
            ]
        }, {
            // #6
            testTitle: "should not copy specified files with globs at first when `--no-initial` option was given:",
            setupData: {
                "test-ws/untouchable.txt": "untouchable",
                "test-ws/a/hello.txt": "Hello",
                "test-ws/a/b/this-is.txt": "A pen",
                "test-ws/a/b/that-is.txt": "A note",
                "test-ws/a/b/no-copy.dat": "no-copy",
            },
            verifyData: {
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
            },
            entries: [
                {
                    type: 2 /* LIB */,
                    patternOrCmd: "test-ws/a/**/*.txt",
                    dest: "test-ws/b",
                    opts: {
                        initialCopy: false,
                    }
                }, {
                    type: 1 /* CMD */,
                    patternOrCmd: '"test-ws/a/**/*.txt" test-ws/b --no-initial --watch --verbose'
                }
            ]
        }];
    for (const te of testEntries) {
        describe(te.testTitle, () => {
            beforeEach(async () => {
                await setupTestDir(te.setupData);
                if (typeof te.onBeforeEach === "function") {
                    await te.onBeforeEach();
                }
            });
            for (const e of te.entries) {
                const iscmd = isCommand(e);
                const text = (iscmd ? "command" : "lib") + " version.";
                it(text, async () => {
                    if (iscmd) {
                        command = execCpx(e.patternOrCmd);
                    }
                    else {
                        watcher = cpx.watch(e.patternOrCmd, /** @type {string} */ (e.dest), e.opts);
                    }
                    await waitForReady();
                    await verifyTestDir(te.verifyData);
                });
            }
        });
    }
    /** @type {TWatchTestEntry[]} */
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
            async action() {
                // return (async () => {
                //     await writeFile("test-ws/a/b/not-added.dat", "added");
                //     await writeFile("test-ws/a/a.txt", "a");
                // })();
                await writeFile("test-ws/a/b/not-added.dat", "added");
                await writeFile("test-ws/a/a.txt", "a");
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
            async action() {
                // return (async () => {
                //     await writeFile("test-ws/a/hello.dat", "changed");
                //     await writeFile("test-ws/a/a.txt", "a");
                // })();
                await writeFile("test-ws/a/hello.dat", "changed");
                await writeFile("test-ws/a/a.txt", "a");
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
            async action() {
                // return (async () => {
                //     await removeFile("test-ws/a/hello.dat");
                //     await writeFile("test-ws/a/hello.txt", "changed");
                // })();
                await removeFile("test-ws/a/hello.dat");
                await writeFile("test-ws/a/hello.txt", "changed");
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
        // @ts-ignore 
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
                command = execCpx('"test-ws/a/**/*.txt" test-ws/b --watch --verbose');
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
            command = execCpx('"test-ws/a/**/*.txt" test-ws/b --watch --verbose');
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
            command = execCpx('"test-ws/a/**" test-ws/b --include-empty-dirs --watch --verbose');
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
            command = execCpx('"test-ws/a/**" test-ws/b --include-empty-dirs --watch --verbose');
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
            command = execCpx('"test-ws/a/**" test-ws/b --no-initial --watch --verbose');
            await waitForReady();
            await writeFile("test-ws/a/added.txt", "added");
            await waitForCopy();
            await verifyFiles();
        });
    });
    describe("should copy it when a file is modified even if there are parentheses in path:", () => {
        beforeEach(() => setupTestDir({
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
            command = execCpx('"test-ws/a(paren)/**" test-ws/b --no-initial --watch --verbose');
            await waitForReady();
            await writeFile("test-ws/a(paren)/hello.txt", "Hello 2");
            await waitForCopy();
            await verifyFiles();
        });
    });
});
