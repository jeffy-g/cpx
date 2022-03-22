
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
    import Stream, { Readable, Writable } from "stream";
    function duplexer(output: Writable, input: Readable): Stream;
    export = duplexer;
}
