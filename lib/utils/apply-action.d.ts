/**
 * Apply the given action to every file which matches to the given pattern.
 *
 * @param {string} pattern - The pattern to find files.
 * @param {Pick<TCpxOptions, "includeEmptyDirs" | "dereference">} options - The option object.
 * @param {function(string): Promise<void>} action - The action function to apply.
 * @returns {Promise<void>} The promise which will go fulfilled after done.
 * @private
 */
export declare function applyAction(pattern: string, options: Pick<TCpxOptions, "includeEmptyDirs" | "dereference">, action: (arg0: string) => Promise<void>): Promise<void>;
