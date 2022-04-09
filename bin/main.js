"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
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
//TODO: remove.
/*eslint-disable no-process-exit, no-process-env */
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const path_1 = require("path");
const child_process_1 = require("child_process");
const resolve_1 = require("resolve");
const shell_quote_1 = require("shell-quote");
// @ts-ignore
const duplexer = require("duplexer");
const utils = require("../lib/utils");
const aa = require("../lib/utils/apply-action");
const cf = require("../lib/utils/copy-file");
const aas = require("../lib/utils/apply-action-sync");
const rfs = require("../lib/utils/remove-file-sync");
const watcher_1 = require("../lib/utils/watcher");
const { normalizeOptions } = utils;
const applyActionSync = aas.applyActionSync;
const removeFileSync = rfs.removeFileSync;
const applyAction = aa.applyAction;
const copyFile = cf.copyFile;
//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
/**
 * ```js
 * /^[./]/u;
 * ```
 */
const ABS_OR_REL = /^[./]/u;
/**
 * ```js
 * /^(?:-c|--command)$/u;
 * ```
 */
const C_OR_COMMAND = /^(?:-c|--command)$/u;
/**
 * ```js
 * /^(?:-t|--transform)$/u;
 * ```
 */
const T_OR_TRANSFORM = /^(?:-t|--transform)$/u;
//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
/**
 *
 * @param {string} source
 * @param {string} outDir
 * @param {TMinimistParsedArgs} args
 */
function main(source, outDir, args) {
    // Resolve Command.
    const commands = []
        .concat(args.command)
        .filter(Boolean)
        .map(command => {
        if (typeof command !== "string") {
            console.error("Invalid --command option");
            process.exit(1);
        }
        return (/** @type {string} */ file) => {
            const env = Object.create(process.env, {
                FILE: { value: file },
            });
            const parts = /** @type {string[]} */ (0, shell_quote_1.parse)(command, env);
            const child = (0, child_process_1.spawn)(parts[0], parts.slice(1), { env });
            const outer = duplexer(child.stdin, child.stdout);
            child.on("exit", code => {
                if (code !== 0) {
                    const error = new Error(`non-zero exit code in command: ${command}`);
                    outer.emit("error", error);
                }
            });
            child.stderr.pipe(process.stderr);
            return outer;
        };
    });
    // Resolve Transforms.
    /** @type {TTransformFactory[]} */
    const transforms = [].concat(args.transform).filter(Boolean)
        .map((/** @type {TMinimistParsedArgs | string} */ arg) => {
        if (typeof arg === "string") {
            return { name: /** @type {string} */ (arg), argv: null };
        }
        if (typeof arg._[0] === "string") {
            return { name: /** @type {string} */ (arg._.shift()), argv: arg };
        }
        console.error("Invalid --transform option");
        process.exit(1);
    })
        .map((/** @type {TArgEntry} */ item) => {
        const modId = ABS_OR_REL.test(item.name) ? (0, path_1.resolve)(item.name) : (0, resolve_1.sync)(item.name, { basedir: process.cwd() });
        /** @type {TTransformer} */
        const createStream = require(modId);
        return (file, opts) => createStream(file, Object.assign({ _flags: opts }, item.argv));
    });
    // Merge commands and transforms as same as order of process.argv.
    // DEVNOTE: 2022/03/17 - TODO: types
    const mergedTransformFactories = process.argv
        .map(part => {
        if (C_OR_COMMAND.test(part)) {
            return commands.shift();
        }
        if (T_OR_TRANSFORM.test(part)) {
            return transforms.shift();
        }
        return null;
    })
        .filter(Boolean);
    // Main.
    /** @type {typeof console.log} */
    const log = args.verbose ? console.log.bind(console) : () => { };
    const options = normalizeOptions(source, outDir, {
        // @ts-ignore TODO: types
        transform: mergedTransformFactories,
        dereference: args.dereference,
        includeEmptyDirs: args.includeEmptyDirs,
        initialCopy: args.initial,
        preserve: args.preserve,
        update: args.update,
    });
    if (args.clean) {
        const output = options.toDestination(options.source);
        if (output !== options.source) {
            log();
            log(`Clean: ${output}`);
            log();
            try {
                applyActionSync(output, options, targetPath => {
                    removeFileSync(targetPath);
                    log(`Removed: ${targetPath}`);
                });
            }
            catch ( /** @type {any} */err) {
                console.error(`Failed to clean: ${err.message}.`);
                process.exit(1);
            }
        }
    }
    if (args.watch) {
        if (options.initialCopy) {
            log();
            log(`Copy: ${source} --> ${outDir}`);
            log();
        }
        const watcher = new watcher_1.Watcher(options);
        watcher.on("copy", event => {
            log(`Copied: ${event.srcPath} --> ${event.dstPath}`);
        }).on("remove", event => {
            log(`Removed: ${event.path}`);
        }).on("watch-ready", () => {
            log();
            log(`Be watching ${options.source}`);
            log();
        }).on("watch-error", err => {
            console.error(err.message);
        }).open();
    }
    else {
        log();
        log(`Copy: ${source} --> ${outDir}`);
        log();
        applyAction(options.source, options, sourcePath => {
            const outputPath = options.toDestination(sourcePath);
            if (outputPath !== sourcePath) {
                return copyFile(sourcePath, outputPath, options).then(() => {
                    log(`Copied: ${sourcePath} --> ${outputPath}`);
                });
            }
            return Promise.resolve();
        }).catch(error => {
            console.error(`Failed to copy: ${error.message}.`);
            process.exit(1);
        });
    }
}
exports.main = main;
