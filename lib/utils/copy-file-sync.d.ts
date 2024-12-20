/**
 * Copy a file synchronously.
 * Additionally, copy file attributes also by options.
 * @param {string} source - A path of the source file.
 * @param {string} output - A path of the destination file.
 * @param {Pick<TCpxOptions, "preserve" | "update">} options - Options.
 * @returns {void}
 * @private
 */
export declare function copyFileSync(source: string, output: string, options: Pick<TCpxOptions, "preserve" | "update">): void;
