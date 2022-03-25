/**
 * Convert the given file path to use glob.
 * Glob doesn't support the delimiter of Windows.
 *
 * @param {string} originalPath - The path to convert.
 * @returns {string} The normalized path.
 * @private
 */
export declare function normalizePath(originalPath: string): string;
