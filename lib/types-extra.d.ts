
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
    function subarg(args: string[], opts: minimist.Opts): ReturnType<typeof minimist>;
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
