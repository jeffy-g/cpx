type TErrorHandler = (err: Error | null) => any;
/**
 * @typedef {(err: Error | null) => any} TErrorHandler
 */
/**
 * Copy files asynchronously.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCpxOptions | TErrorHandler} [options] The options.
 * @param {TErrorHandler} [callback] The callback function which will go fulfilled after done.
 * @returns {Promise<void | Promise<void>>} The promise which will go fulfilled after done.
 * @see {@link TCpxOptions}
 */
export declare function copy(source: string, outputDir: string, options?: TCpxOptions | TErrorHandler, callback?: TErrorHandler): Promise<void | Promise<void>>;
export {};
