/**
 * Normalize options.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCopyOptions} [options] The options.
 * @returns {Required<TNormalizeOption>} The normalized options.
 * @private
 */
export declare function normalizeOptions(source: string, outputDir: string, options?: TCopyOptions): Required<TNormalizeOption>;
