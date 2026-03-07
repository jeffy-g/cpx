
/**
 * #### module definition of "minimist"
 */
declare module "minimist" {
    function minimist(args: string[], opts?: minimist.Opts): minimist.ParsedArgs;
    function minimist<T>(args: string[], opts?: minimist.Opts): T & minimist.ParsedArgs;
    function minimist<T extends minimist.ParsedArgs>(args: string[], opts?: minimist.Opts): T;

    namespace minimist {
        interface Opts {
            string?: string | string[] | undefined;
            boolean?: boolean | string | string[] | undefined;
            alias?: { [key: string]: string | string[] } | undefined;
            default?: { [key: string]: any } | undefined;
            stopEarly?: boolean | undefined;
            unknown?: ((arg: string) => boolean) | undefined;
            "--"?: boolean | undefined;
        }

        interface ParsedArgs {
            [arg: string]: any;
            "--"?: string[] | undefined;
            _: string[];
        }
    }

    export = minimist;
}

/**
 * #### module definition of "glob2base"
 */
declare module "glob2base" {
    import * as m from "minimatch";
    function g2b(glob: { minimatch: m.Minimatch }): string;
    export = g2b;
}
/**
 * #### module definition of "subarg"
 */
declare module "subarg" {
    import * as minimist from "minimist";
    function subarg(args: string[], opts?: minimist.Opts): minimist.ParsedArgs;
    export = subarg;
}
/**
 * #### module definition of "duplexer"
 */
declare module "duplexer" {
    import * as stream from "stream";
    // import Stream, { Readable, Writable } from "stream";
    function duplexer(output: stream.Writable, input: stream.Readable): stream;
    export = duplexer;
}

declare type TStreamTransform = import("stream").Transform;
declare type TTransformerParam1 = TMinimistParsedArgs & { _flags: Record<string, any> };
declare type TTransformer = (file: string, opt: TTransformerParam1) => TStreamTransform;
declare type TTransformFactory = (file: string, opts: Record<string, any>) => TStreamTransform;
