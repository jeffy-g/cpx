import * as minimist from "minimist";
import { Transform } from "stream";
import { ThroughStream as throughstream } from "through";


declare global {

    type TMinimistParsedArgs = ReturnType<typeof minimist>;

    type TCopyOptions = {
        clean?: boolean;
        /** The flag to dereference symbolic links. */
        dereference?: boolean;
        /** The flag to include empty directories to copy. */
        includeEmptyDirs?: boolean;
        initialCopy?: boolean;
        /** The flag to copy attributes. */
        preserve?: boolean;
        transform?: Array<((input: string, ...args: any[]) => Transform)>;
        /** The flag to disallow overwriting. */
        update?: boolean;
    }

    type TNormalizeOption = TCopyOptions & {
        baseDir: string;
        outputDir: string;
        source: string;
        toDestination: (path: string) => string;
    }

    //
    // types for test
    //
    type TWatchTestContext = {
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
