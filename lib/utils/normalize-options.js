"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = void 0;
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
// @ts-ignore 
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
 * @private
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
 * @param {TCopyOptions} [options] The options.
 * @returns {Required<TNormalizeOption>} The normalized options.
 * @private
 */
function normalizeOptions(source, outputDir, options) {
    const normalizedSource = (0, normalize_path_1.normalizePath)(source);
    const baseDir = getBasePath(normalizedSource);
    const normalizedOutputDir = (0, normalize_path_1.normalizePath)(outputDir);
    const toDestination = baseDir === "."
        ? (/** @type {string} */ sourcePath) => path.join(normalizedOutputDir, sourcePath)
        : (/** @type {string} */ sourcePath) => sourcePath.replace(baseDir, normalizedOutputDir);
    const transforms = options && options.transform || [];
    return {
        clean: Boolean(options && options.clean),
        dereference: Boolean(options && options.dereference),
        includeEmptyDirs: Boolean(options && options.includeEmptyDirs),
        initialCopy: (options && options.initialCopy) !== false,
        preserve: Boolean(options && options.preserve),
        transform: transforms.filter(Boolean),
        // @ts -ignore
        // transform: [].concat(options && options.transform).filter(Boolean),
        update: Boolean(options && options.update),
        baseDir,
        outputDir,
        source: normalizedSource,
        toDestination,
    };
}
exports.normalizeOptions = normalizeOptions;
