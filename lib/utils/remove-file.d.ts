/**
 * Remove a file or a directory asynchronously.
 * Additionally, remove the parent directory if it's empty.
 * @param {string} target The path to the target file.
 * @returns {Promise<void>}
 * @private
 */
export declare function removeFile(target: string): Promise<void>;
