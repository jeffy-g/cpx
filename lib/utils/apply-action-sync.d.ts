/**
 * Apply the given action to every file which matches to the given pattern.
 *
 * @param {string} pattern - The pattern to find files.
 * @param {Pick<TCopyOptions, "includeEmptyDirs" | "dereference">} options - The option object.
 * @param {(src: string) => void} action - The action function to apply.
 * @returns {void} The promise which will go fulfilled after done.
 * @private
 */
export declare function applyActionSync(pattern: string, options: Pick<TCopyOptions, "includeEmptyDirs" | "dereference">, action: (src: string) => void): void;
