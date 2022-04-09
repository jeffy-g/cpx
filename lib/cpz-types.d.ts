import * as minimist from "minimist";
import { Transform } from "stream";
import { ThroughStream as throughstream } from "through";


declare global {

    // DEVNOTE: 2022/03/24 - fix: [Critical dependency: the request of a dependency is an expression] at webpack build
    type TMinimistParsedArgs = minimist.ParsedArgs;

    type TCpxOptions = {
        /** The flag to remove files that copied on past before copy. Default: `false`. */
        clean?: boolean;
        /** The flag to follow symbolic links when copying from them. Default: `false`. */
        dereference?: boolean;
        /** The flag to copy empty directories which is matched with the glob. Default: `false`. */
        includeEmptyDirs?: boolean;
        /** The flag to not copy at the initial time of watch. This is for `cpx.watch()`. Default: `true`. */
        initialCopy?: boolean;
        /** The flag to copy uid, gid, atime, and mtime of files. Default: `false`. */
        preserve?: boolean;
        /** Functions that creates a `stream.Transform` object to transform each copying file. */
        transform?: Array<((input: string, ...args: any[]) => Transform)>;
        /** The flag to not overwrite files on destination if the source file is older. Default: `false`. */
        update?: boolean;
    }

    type TNormalizedCpxOption = TCpxOptions & {
        baseDir: string;
        outputDir: string;
        source: string;
        toDestination: (path: string) => string;
    }

    //
    // types for test
    //
    declare const enum ETestEntryType {
        CMD = 1,
        LIB = CMD << 1,
        LIB_SYNC = CMD << 2
    }

    //
    // base test entry types
    //
    type TTestEntryItem = {
        type: ETestEntryType;
        explain?: string;
    };
    type TTestEntry<E = TTestEntryItem> = {
        /**
         * **title** for `describe`
         */
        testTitle: string;
        /**
         * `beforeEach` for `describe` if need.
         */
        onBeforeEach?: () => Promise<void>;
        /**
         * test entry params for `it`
         */
        entries: E[];
    };

    //
    // cpx test entry types
    //
    type TCpxTestEntry = TTestEntry<TCpxTestEntryItem> & {
        /**
         * **setup data** for `cpx` test
         */
        setupData: Record<string, string | null>;
        /**
         * **verify data** for `cpx` test
         */
        verifyData: Record<string, string | null>;
    };
    type TCpxTestEntryItem = TTestEntryItem & {
        patternOrCmd: string;
        dest?: string;
        opts?: TCpxOptions;
    };

    type TWatchTestEntry = {
        description: string;
        initialFiles: Record<string, string | null>;
        action(): Promise<void>;
        verify: Record<string, string | null>;
        wait(): Promise<void>;
    };
    type TArgEntry = {
        name: string;
        argv: TMinimistParsedArgs | null;
    }

    type ThroughStream = throughstream;
}
export default void 0;
