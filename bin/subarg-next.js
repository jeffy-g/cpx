"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subarg = subarg;
/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2026 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file bin/subarg-next.ts
 */
const mm = require("./minimist-next");
const { minimist } = mm;
/**
 * @typedef {string | number | boolean | null | undefined} Primitive
 * @typedef {Primitive | mm.ParsedArgs} SubargValue
 * @typedef {readonly SubargValue[]} SubargInput
 */
const OPEN_BRACKET_RE = /^\[/u;
const CLOSE_BRACKET_RE = /\]$/u;
/** @type {(v: SubargValue) => v is string} */
function isOpenBracket(v) {
    return typeof v === "string" && OPEN_BRACKET_RE.test(v);
}
/** @type {(v: SubargValue) => v is string} */
function isCloseBracket(v) {
    return typeof v === "string" && CLOSE_BRACKET_RE.test(v);
}
/**
 * + Trim `[` / `]` and return undefined if it is an empty string
 * @type {(s: string, re: RegExp) => string | undefined}
 */
function trimBracket(s, re) {
    const trimmed = s.replace(re, "");
    return trimmed === "" ? undefined : trimmed;
}
/**
 * + Returns a sub-array of `args[start..end]` with `[` `]` removed.
 * + Elements that are empty are excluded.
 * @type {function(SubargInput, number, number): SubargValue[]}
 */
function extractSubArgs(args, start, end) {
    const sub = /** @type {SubargValue[]} */ ([...args.slice(start, end + 1)]);
    const head = trimBracket(/** @type {string} */ (sub[0]), OPEN_BRACKET_RE);
    sub[0] = head;
    const tail = trimBracket(/** @type {string} */ (sub[sub.length - 1]), CLOSE_BRACKET_RE);
    sub[sub.length - 1] = tail;
    return sub.filter((v) => v !== undefined);
}
/**
 * __`subarg`__ - Recursively parse nested brackets `[ ... ]` as subcommand arguments.
 *
 * @example
 * subarg(["-x", "[", "--foo", "bar", "]"])
 * // => { _: [], x: true, 0: { _: [], foo: "bar" } }
 *
 * subarg(["--transform", "[", "babelify", "--presets", "es2015", "]"])
 * // => { _: [], transform: { _: ["babelify"], presets: "es2015" } }
 *
 * @type {(args: SubargInput, opts?: mm.Opts) => mm.ParsedArgs}
 */
function subarg(args, opts) {
    let level = 0;
    let openIndex = -1;
    /** @type {SubargValue[]} */
    const normalized = [];
    for (let i = 0; i < args.length; i++) {
        const entry = args[i];
        if (isOpenBracket(entry) && level++ === 0) {
            openIndex = i;
        }
        if (isCloseBracket(entry)) {
            if (--level > 0)
                continue;
            const sub = extractSubArgs(args, openIndex, i);
            normalized.push(subarg(sub));
            continue;
        }
        if (level === 0)
            normalized.push(entry);
    }
    return minimist(/** @type {string[]} */ (normalized), opts);
}