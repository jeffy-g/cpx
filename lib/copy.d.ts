/**
 * Copy files asynchronously.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCpxOptions | ((arg0: Error | null) => any)} [options] The options.
 * @param {(arg0: Error | null) => any} [callback] The callback function which will go fulfilled after done.
 * @returns {Promise<void | Promise<void>>} The promise which will go fulfilled after done.
 * @see {@link TCpxOptions}
 */
export declare function copy(source: string, outputDir: string, options?: TCpxOptions | ((arg0: Error | null) => any), callback?: (arg0: Error | null) => any): Promise<void | Promise<void>>;
