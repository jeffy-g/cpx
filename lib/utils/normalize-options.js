"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
/**
 * @author Toru Nagashima
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const path = require("path");
const m = require("minimatch");
// @ts-ignore avoid ts(2497) (2026/03/04 21:32:37)
const glob2base = require("glob2base");
const normalize_path_1 = require("./normalize-path");
const { Minimatch } = m;
//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
/**
 * Get non-magic part of the given glob pattern.
 * @param {string} source The glob pattern to get base.
 * @returns {string} The non-magic part.
 */
function getBasePath(source) {
    const minimatch = new Minimatch(source);
    return (0, normalize_path_1.normalizePath)(glob2base({ minimatch }));
}
//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------
/**
 * Normalize options.
 * @param {string} source The glob pattern of target files.
 * @param {string} outputDir The output directory.
 * @param {TCpxOptions} [options] The options.
 * @returns {Required<TNormalizedCpxOption>} The normalized options.
 */
function normalizeOptions(source, outputDir, options) {
    const normalizedSource = (0, normalize_path_1.normalizePath)(source);
    const baseDir = getBasePath(normalizedSource);
    const normalizedOutputDir = (0, normalize_path_1.normalizePath)(outputDir);
    /** @type {(path: string) => string} */
    const toDestination = baseDir === "."
        ? (sourcePath) => path.join(normalizedOutputDir, sourcePath)
        : (sourcePath) => sourcePath.replace(baseDir, normalizedOutputDir);
    //! options ||= {}; /* node v15 */
    options = options || {};
    const transforms = options.transform || [];
    return {
        clean: !!options.clean,
        dereference: !!options.dereference,
        includeEmptyDirs: !!options.includeEmptyDirs,
        includeDotFiles: !!options.includeDotFiles,
        initialCopy: options.initialCopy !== false,
        preserve: !!options.preserve,
        transform: transforms.filter(Boolean),
        update: !!options.update,
        baseDir,
        outputDir,
        source: normalizedSource,
        toDestination,
    };
}