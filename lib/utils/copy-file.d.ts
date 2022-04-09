/**
 * Copy a file asynchronously.
 * Additionally, copy file attributes also by options.
 * @function
 * @param {string} source - A path of the source file.
 * @param {string} output - A path of the destination file.
 * @param {Required<Pick<TNormalizedCpxOption, "update" | "transform" | "preserve">>} options - Options.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 * @private
 */
export declare function copyFile(source: string, output: string, options: Required<Pick<TNormalizedCpxOption, "update" | "transform" | "preserve">>): Promise<void>;
