import { Watcher } from "./utils/watcher";
/**
 * Watch files then copy the files on each change.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCopyOptions} [options] The options.
 * @returns {import("./utils/watcher").Watcher} The watcher object which observes the files.
 */
export declare function watch(source: string, outputDir: string, options?: TCopyOptions): Watcher;