/// <reference types="node" />
import * as EventEmitter from "events";
import * as m from "minimatch";
export declare type TDebounced = (() => void) & {
    clear(): void;
} & {
    flush(): void;
};
/**
 * Watcher class.
 *
 * The watcher observes files and directories which are matched to the given
 * glob pattern.
 *
 * @implements {NodeJS.EventEmitter}
 */
export declare class Watcher extends EventEmitter {
    baseDir: string;
    dereference: boolean | undefined;
    includeEmptyDirs: boolean | undefined;
    initialCopy: boolean | undefined;
    matcher: m.IMinimatch;
    outputDir: string;
    preserve: boolean | undefined;
    source: string;
    toDestination: (path: string) => string;
    transform: ((input: string, ...args: any[]) => import("stream").Transform)[] | undefined;
    update: boolean | undefined;
    initialCopyCount: number;
    onDoneInitialCopy: () => void;
    pending: boolean;
    queue: Map<any, any>;
    ready: boolean;
    retries: Map<any, any>;
    /** @type {TDebounced | null} */
    trigger: TDebounced | null;
    watchers: Map<any, any>;
    /**
     * Initialize this watcher.
     * @param {TNormalizeOption} options Normalized options.sform function's factories.
     */
    constructor(options: TNormalizeOption);
    /**
     * Open this watcher.
     * @returns {void}
     */
    open(): void;
    /**
     * Close this watcher.
     * @returns {void}
     */
    close(): void;
    /**
     * Start watching the files of the given directory.
     * @param {string} dirRoot The path to the root directory to watch.
     * @returns {Promise<void>} The promise which will go fulfilled after done.
     * @private
     */
    private addDirectory;
    /**
     * Stop watching the files of the given directory.
     * @param {string} dir The path to the root directory to watch.
     * @returns {void}
     * @private
     */
    private removeDirectory;
    /**
     * Classify the given file change.
     * @param {Map<string, fs.Stats>} files The current files.
     * @param {string} sourcePath The path to a changed file.
     * @param {fs.Stats | null} currStat The stats object of the changed file.
     * @returns {void}
     * @private
     */
    private classifyFileChange;
    /**
     * Called when this watcher got ready.
     * @returns {void}
     * @private
     */
    private onReady;
    /**
     * Called when this watcher detected that a file had been added.
     *
     * If this is ready, enqueue the file to copy the file.
     * Otherwise, copy the file immediately if `initialCopy` option is `true`.
     *
     * @param {string} sourcePath The path to the added file.
     * @returns {void}
     * @private
     */
    private onAdded;
    /**
     * Called when this watcher detected that a file had been removed.
     * @param {string} sourcePath The path to the removed file.
     * @returns {void}
     * @private
     */
    private onRemoved;
    /**
     * Called when this watcher detected that a file had been changed.
     * @param {string} sourcePath The path to the changed file.
     * @returns {void}
     * @private
     */
    private onChanged;
    /**
     * Called when this watcher threw an error.
     * @param {Error} error The thrown error.
     * @returns {void}
     * @private
     */
    private onError;
    /**
     * Called by `this.trigger()`.
     * If `this.trigger()` was called multiple times in 0.1 seconds, those are debounced.
     * This execute queued actions (copy or remove).
     * @returns {void}
     * @private
     */
    private onTrigger;
    /**
     * Check whether the given path should be retried.
     * @param {string} sourcePath The path to the target file.
     * @returns {boolean} `true` if the path should be retried.
     * @private
     */
    private shouldRetry;
    /**
     * Emit a `watch-ready` event if this is ready and done initial copies.
     * @returns {void}
     * @private
     */
    private emitReadyEventIfReady;
    /**
     * Enqueue the given file to copy it.
     * @param {string} sourcePath The path to the target file.
     * @returns {void}
     * @private
     */
    private enqueueAdd;
    /**
     * Enqueue the given file to remove it.
     * @param {string} sourcePath The path to the target file.
     * @returns {void}
     * @private
     */
    private enqueueRemove;
    /**
     * Enqueue the given file to copy it.
     * @param {string} sourcePath The path to the target file.
     * @returns {void}
     * @private
     */
    private enqueueChange;
    /**
     * Copy the given file.
     * @param {string} sourcePath The path to the target file.
     * @private
     */
    private copy;
    /**
     * Remove the given file.
     * @param {string} sourcePath The path to the target file.
     * @private
     */
    private remove;
    /**
     * @param {string | symbol} type
     * @param {any[]} args
     * @inheritdoc
     * @override
     */
    emit(type: string | symbol, ...args: any[]): boolean;
}
