/**
 * Normalize options.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCpxOptions} [options] The options.
 * @returns {Required<TNormalizedCpxOption>} The normalized options.
 * @private
 */
export declare function normalizeOptions(source: string, outputDir: string, options?: TCpxOptions): Required<TNormalizedCpxOption>;
