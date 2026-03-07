"use strict";
/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2026 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file bin/minimist-next.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.minimist = minimist;
/**
 * @typedef {Record<string, boolean>} TFlagMap
 * @typedef {Record<string, string[]>} TAliases
 * @typedef {((arg: string) => boolean | void) | null} TUnknownFn
 * @typedef {ParsedArgs & Record<string, any>} TArgv
 */
/**
 * @typedef {{
 *  string?: string | string[] | undefined;
 *  boolean?: boolean | string | string[] | undefined;
 *  alias?: { [key: string]: string | string[] } | undefined;
 *  default?: { [key: string]: any } | undefined;
 *  stopEarly?: boolean | undefined;
 *  unknown?: ((arg: string) => boolean) | undefined;
 *  "--"?: boolean | undefined;
 * }} Opts
 *
 * @typedef {{
 *   [arg: string]: any;
 *   "--"?: string[] | undefined;
 *   _: string[];
 * }} ParsedArgs
 */
/**
 * @param {Record<string, any>} obj
 * @param {string[]} keys don't worry!, this array object will no modify
 * @returns
 */
function hasKey(obj, keys) {
    let current = obj;
    keys.slice(0, -1).forEach((key) => {
        current = current[key] || {};
    });
    const key = keys[keys.length - 1];
    return key in current;
}
/** @type {(value: string | number) => boolean} */
function isNumber(value) {
    if (typeof value === "number" || /^0x[0-9a-f]+$/i.test(value)) {
        return true;
    }
    return re_floatOrDigit.test(value);
}
/** @type {(obj: Record<string, any>, key: string) => boolean} */
function isConstructorOrProto(obj, key) {
    return (key === "constructor" && typeof obj[key] === "function") || key === "__proto__";
}
/**
 * @typedef TInternalFlags
 * @prop {TFlagMap} bools
 * @prop {TFlagMap} strings
 * @prop {boolean} [allBools]
 * @prop {TUnknownFn} unknownFn
 */
/** @type {<T>(value: T) => boolean} */
const boolFilter = (value) => !!value;
/** @type {(flags: TInternalFlags, aliases: TAliases, key: string, arg: string) => boolean} */
const argDefined = (flags, aliases, key, arg) => !!((flags.allBools && /^--[^=]+$/.test(arg))
    || flags.strings[key]
    || flags.bools[key]
    || aliases[key]);
/** @type {(flags: TInternalFlags, aliases: TAliases, argv: TArgv, key: string, value: any, arg?: string) => void} */
const setArg = (flags, aliases, argv, key, value, arg) => {
    if (arg && flags.unknownFn && !argDefined(flags, aliases, key, arg)) {
        /* v8 ignore else -- @preserve */
        if (flags.unknownFn(arg) === false) {
            return;
        }
    }
    const parsedValue = !flags.strings[key] && isNumber(value)
        ? +value
        : value;
    setKey(flags, argv, key.split("."), parsedValue);
    (aliases[key] || []).forEach((alias) => {
        setKey(flags, argv, alias.split("."), parsedValue);
    });
};
/**
 * @typedef {(key: string, value: any, arg?: string) => void} TSetArgBridge
 */
const isa = Array.isArray;
/** @type {(flags: TInternalFlags, obj: TArgv, keys: string[], value: any) => void} */
const setKey = (flags, obj, keys, value) => {
    /** @type {Record<string, any>} */
    let current = obj;
    for (let i = 0, limit = keys.length - 1; i < limit; i++) {
        const key = keys[i];
        if (isConstructorOrProto(current, key))
            return;
        const cv = current[key];
        if (cv === undefined) {
            current[key] = {};
        }
        else if (cv === Object.prototype || cv === Number.prototype || cv === String.prototype) {
            /* v8 ignore next -- @preserve */
            current[key] = {};
        }
        else if (cv === Array.prototype) {
            /* v8 ignore next -- @preserve */
            current[key] = [];
        }
        current = current[key];
    }
    const lastKey = keys[keys.length - 1];
    /* v8 ignore if -- @preserve */
    if (isConstructorOrProto(current, lastKey))
        return;
    /* v8 ignore if -- @preserve */
    if (current === Object.prototype || current === Number.prototype || current === String.prototype) {
        current = {};
    }
    else if (current === Array.prototype) {
        /* v8 ignore next -- @preserve */
        current = [];
    }
    if (current[lastKey] === undefined || flags.bools[lastKey] || typeof current[lastKey] === "boolean") {
        current[lastKey] = value;
    }
    else if (isa(current[lastKey])) {
        /* v8 ignore next -- @preserve */
        current[lastKey].push(value);
    }
    else {
        current[lastKey] = [current[lastKey], value];
    }
};
/** @type {(flags: TInternalFlags, aliases: TAliases, key: string) => boolean} */
const aliasIsBoolean = (flags, aliases, key) =>
/* v8 ignore next -- @preserve branch not covered */ (aliases[key] || []).some((alias) => flags.bools[alias]);
/**
 * @param {string[]} args
 * @param {Opts?=} opts
 * @returns {ParsedArgs}
 */
function minimist(args, opts) {
    /** @type {TInternalFlags} */
    const flags = {
        bools: {},
        strings: {},
        allBools: undefined,
        unknownFn: null,
    };
    const $boolFilter = boolFilter;
    opts = opts || {};
    if (typeof opts.unknown === "function") {
        flags.unknownFn = opts.unknown;
    }
    if (typeof opts.boolean === "boolean" && opts.boolean) {
        flags.allBools = true;
    }
    else {
        const ta = /** @type {string[]} */ ([]).concat(opts.boolean || []);
        if (ta.length) {
            ta.filter($boolFilter).forEach((key) => flags.bools[key] = true);
        }
    }
    /** @type {TAliases} */
    const aliases = {};
    Object.keys(opts.alias || {}).forEach((key) => {
        const avalues = aliases[key] =
        /** @type {string[]} */ ([]).concat(
        /* v8 ignore next -- @preserve branch not covered */ (opts.alias || {})[key]);
        avalues.forEach((alias) => {
            aliases[alias] = [key].concat(avalues.filter((candidate) => alias !== candidate));
        });
    });
    /** @type {string[]} */ ([])
        .concat(opts.string || [])
        .filter($boolFilter)
        .forEach((key) => {
        const stringFlagMap = flags.strings;
        stringFlagMap[key] = true;
        (aliases[key] || []).forEach(alias => stringFlagMap[alias] = true);
    });
    /** @type {TArgv} */
    const argv = { _: [] };
    const defaults = opts.default || {};
    /**
     * + __`setArg`__ bridge
     *
     * @type {TSetArgBridge}
     */
    const setArgBridge = (key, value, arg) => {
        setArg(flags, aliases, argv, key, value, arg);
    };
    Object.keys(flags.bools).forEach((key) => {
        setArgBridge(key, defaults[key] === undefined
            ? false
            : /* v8 ignore next -- @preserve branch not covered */ defaults[key]);
    });
    /** @type {string[]} */
    let notFlags = [];
    const terminatorIndex = args.indexOf("--");
    if (terminatorIndex !== -1) {
        notFlags = args.slice(terminatorIndex + 1);
        args = args.slice(0, terminatorIndex);
    }
    /** @type {RegExpExecArray | null} */
    let match;
    for (let i = 0, argLen = args.length; i < argLen; i++) {
        /** @type {string} */
        let key;
        /** @type {string=} */
        let next;
        const arg = args[i];
        if (re_longOptWithValue.test(arg)) {
            match = re_longOptWithValueOf.exec(arg);
            /* v8 ignore if -- @preserve */
            if (!match)
                continue;
            key = match[1];
            /** @type {string | boolean} */
            let value = match[2];
            /* v8 ignore if -- @preserve */
            if (flags.bools[key]) {
                value = value !== "false";
            }
            setArgBridge(key, value, arg);
        }
        else if (re_longOptNot.test(arg)) {
            match = re_longOptNot.exec(arg);
            /* v8 ignore if -- @preserve */
            if (!match)
                continue;
            setArgBridge(match[1], false, arg);
        }
        else if (re_longOpt.test(arg)) {
            match = re_longOpt.exec(arg);
            /* v8 ignore if -- @preserve */
            if (!match)
                continue;
            key = match[1];
            next = args[i + 1];
            if (next !== undefined
                && !re_shortOrLongOptDetect.test(next)
                && !flags.bools[key]
                && !flags.allBools
                && (aliases[key] ? !aliasIsBoolean(flags, aliases, key) : true)) {
                setArgBridge(key, next, arg);
                i++;
            }
            else {
                setArgBridge(key, flags.strings[key] ? "" : true, arg);
            }
        }
        else if (re_shortOpt.test(arg)) {
            i = parseShortOpt(arg, flags, aliases, args, i, setArgBridge);
        }
        else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                /** @type {any[]} */ (argv._).push(flags.strings._ || !isNumber(arg) ? arg : +arg);
            }
            if (opts.stopEarly) {
                /** @type {any[]} */ (argv._).push(...args.slice(i + 1));
                break;
            }
        }
    }
    Object.keys(defaults).forEach((key) => {
        const parts = key.split(".");
        if (!hasKey(argv, parts)) {
            setKey(flags, argv, parts, defaults[key]);
            (aliases[key] || []).forEach((alias) => {
                setKey(flags, argv, alias.split("."), defaults[key]);
            });
        }
    });
    if (opts["--"]) {
        argv["--"] = notFlags.slice(0);
    }
    else {
        notFlags.forEach(value => argv._.push(value));
    }
    return argv;
}
/**
 * @type {(arg: string, flags: TInternalFlags, aliases: TAliases, args: string[], argsIdx: number, setArgOf: TSetArgBridge) => number}
 */
const parseShortOpt = (arg, flags, aliases, args, argsIdx, setArgOf) => {
    const letters = arg.slice(1, -1);
    let broken = false;
    for (let j = 0; j < letters.length; j += 1) {
        const next = arg.slice(j + 2);
        const shortOpt = letters[j];
        /** @type {string | boolean=} */
        let nextValue;
        if (next === "-") {
            nextValue = next;
        }
        else {
            $: do {
                /* v8 ignore else -- @preserve */
                if (re_shortOptFlagCandidate.test(shortOpt)) {
                    if (next[0] === "=") {
                        nextValue = next.slice(1);
                    }
                    else if (re_floatOrDigit.test(next)) {
                        nextValue = next;
                    }
                    if (nextValue !== void 0) {
                        broken = true;
                        break $;
                    }
                }
                if (letters[j + 1] && re_notWord.test(letters[j + 1])) {
                    nextValue = arg.slice(j + 2);
                    broken = true;
                }
            } while (0);
        }
        if (nextValue === void 0) {
            nextValue = flags.strings[shortOpt]
                ? /* branch not covered */ "" : true;
        }
        setArgOf(shortOpt, nextValue, arg);
        if (broken)
            break;
        nextValue = void 0;
    }
    const key = arg.slice(-1);
    if (!broken && key !== "-") {
        const nextArg = args[argsIdx + 1];
        let argValue = flags.strings[key] ? "" : true;
        if (nextArg !== undefined) {
            if (!re_shortOrLongOptDetect.test(nextArg) && !flags.bools[key] &&
                (aliases[key] ? !aliasIsBoolean(flags, aliases, key) : true)) {
                argValue = nextArg;
                argsIdx++;
            }
        }
        setArgOf(key, argValue, arg);
    }
    return argsIdx;
};
/**
 * Matches a short-option flag character that can trigger the numeric-tail rule.
 *
 * + alias: __`re_shortOptNumericTailFlagCandidate`__
 * ```
 * /[A-Za-z]/;
 * ```
 */
const re_shortOptFlagCandidate = /[A-Za-z]/;
/**
 * ```
 * /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/
 * ```
 */
const re_floatOrDigit = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/;
/**
 * ```
 * /\W/
 * ```
 */
const re_notWord = /\W/;
/**
 * ```
 * /^--.+=/
 * ```
 */
const re_longOptWithValue = /^--.+=/;
/**
 * ```
 * /^--(.+)/
 * ```
 */
const re_longOpt = /^--(.+)/;
/**
 * ```
 * /^-[^-]+/
 * ```
 */
const re_shortOpt = /^-[^-]+/;
/**
 * ```
 * /^--([^=]+)=([\s\S]*)$/;
 * ```
 */
const re_longOptWithValueOf = /^--([^=]+)=([\s\S]*)$/;
/**
 * ```
 * /^--no-(.+)/
 * ```
 */
const re_longOptNot = /^--no-(.+)/;
/**
 * ```
 * /^(-|--)[^-]/
 * ```
 */
const re_shortOrLongOptDetect = /^(-|--)[^-]/;