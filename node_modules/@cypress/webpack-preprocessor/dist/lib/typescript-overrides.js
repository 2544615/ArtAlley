"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideSourceMaps = void 0;
var debug_1 = __importDefault(require("debug"));
var lodash_1 = __importDefault(require("lodash"));
var lt_1 = __importDefault(require("semver/functions/lt"));
var debug = (0, debug_1.default)('cypress:webpack');
var patched = false;
var getProgramOptions = function (rootNamesOrOptions, options) {
    return lodash_1.default.isArray(rootNamesOrOptions) ? options : rootNamesOrOptions.options;
};
var overrideSourceMaps = function (sourceMap, typescriptPath) {
    // when using webpack-preprocessor as a local filesystem dependency (`file:...`),
    // require(typescript) will resolve to this repo's `typescript` devDependency, not the
    // targeted project's `typescript`, which breaks monkeypatching. resolving from the
    // CWD avoids this issue.
    try {
        var projectTsPath = require.resolve(typescriptPath || 'typescript', {
            paths: [process.cwd()],
        });
        var typescript_1 = require(projectTsPath);
        var createProgram_1 = typescript_1.createProgram;
        // NOTE: typescript.createProgram can only be monkey-patched in TypeScript versions 4 and under.
        // This is due to TypeScript v5 being an ESM package build with ESBuild, meaning the exports are
        // unmodifiable.
        // For TypeScript 5, we are currently setting sourceMaps in @cypress/webpack-batteries-included-preprocessor.
        // If you are using @cypress/webpack-preprocessor as a standalone package, you will need to set sourceMaps=true
        // inside your cypress/tsconfig.json file in order to get full codeFrame support.
        if ((0, lt_1.default)(typescript_1.version, '5.0.0')) {
            try {
                if (patched) {
                    debug('typescript.createProgram() already overridden');
                    return;
                }
                debug('typescript %s found, overriding typescript.createProgram()', typescript_1.version);
                typescript_1.createProgram = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var rootNamesOrOptions = args[0], _options = args[1];
                    var options = getProgramOptions(rootNamesOrOptions, _options);
                    debug('typescript unmodified createProgram options %o', options);
                    // if sourceMap has been set then apply
                    // these overrides to force typescript
                    // to generate the right sourcemaps
                    options.sourceMap = sourceMap;
                    delete options.inlineSources;
                    delete options.inlineSourceMap;
                    debug('typescript modified createProgram options %o', options);
                    return createProgram_1.apply(typescript_1, args);
                };
                patched = true;
            }
            catch (err) {
                debug('error overriding `typescript.createProgram()', err);
                // for testing purposes
                return err;
            }
        }
        else {
            debug("typescript version ".concat(typescript_1.version, " is not supported for monkey-patching"));
        }
    }
    catch (err) {
        debug("error sourcing typescript from ".concat(typescriptPath || 'typescript'), err);
        return err;
    }
};
exports.overrideSourceMaps = overrideSourceMaps;
