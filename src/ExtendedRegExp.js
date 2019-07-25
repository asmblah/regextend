/*
 * Extended regexes
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/regextend/
 *
 * Released under the MIT license
 * https://github.com/asmblah/regextend/raw/master/MIT-LICENSE.txt
 */

'use strict';

/**
 * Emulates the native RegExp constructor, augmenting it with the ability to record
 * the offset of each capturing group in the match
 *
 * @param {string} pattern
 * @param {string} flags
 * @constructor
 */
function ExtendedRegExp(pattern, flags) {
    var addedGroups = 0;

    // TODO - handle 's' flag (dotall)

    // TODO - handle 'y' flag (sticky) - see https://github.com/slevithan/xregexp/blob/master/src/xregexp.js#L835

    this.flags = flags;
    this.pattern = pattern;

    // Before every normal capturing group, add a lookahead that contains a capturing group
    // that captures the entire rest of the string. Later, we can use this to determine
    // the offset of the group that it precedes by subtracting this length from the entire input length.
    pattern = pattern.replace(
        /((?:^|[^\\])(?:\\{2})+|[^\\]|^)(?:(\[[^\]]*])|\((?!\?))|\\(\d\d?)/g,
        function (all, escapePrefix, characterClass, backrefNumber) {
            if (characterClass) {
                // Don't match parentheses inside character classes
                return all;
            }

            if (backrefNumber) {
                // Increment all backreferences to account for the extra capture groups we're adding
                return '\\' + (backrefNumber * 1 + addedGroups);
            }

            addedGroups++;

            return escapePrefix + '(?=([\\s\\S]*))(';
        }
    );

    this.nativeRegex = new RegExp(pattern, flags);
}

/**
 * Executes a search for a match in a specified string. Returns a result array or null.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec}
 *
 * @param {string} string
 * @return {Array|null}
 */
ExtendedRegExp.prototype.exec = function (string) {
    var index,
        match = this.nativeRegex.exec(string),
        offsets;

    if (match === null) {
        return null;
    }

    offsets = [];

    for (index = match.length - 1; index >= 0; index--) {
        if ((index + 1) % 2 === 0) {
            // This capture is one of the special ones added in the constructor above -
            // use it to calculate the offset of the original capturing group it precedes

            if (match[index] !== undefined) {
                offsets.unshift(string.length - match[index].length);
            } else {
                // Nothing was captured (eg. the original capturing group and this special one
                // were part of an unmatched branch of an alternation) - so use -1 as the offset
                offsets.unshift(-1);
            }

            match.splice(index, 1);
        }
    }

    offsets.unshift(match.index); // Add the full capture offset

    // Add the custom `.offsets` property (based on https://github.com/tc39/proposal-regexp-match-indices/tree/d13edded4216331eaa444fb8535b8aa304df44cf)
    match.offsets = offsets;

    return match;
};

/**
 * Executes a search for a match in a specified string. Returns true if a match is found, false otherwise.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test}
 *
 * @param {string} string
 * @param {string|Function} replacement
 * @return {string}
 */
ExtendedRegExp.prototype.replace = function (string, replacement) {
    var originalNativeRegex = new RegExp(this.pattern, this.flags);

    return string.replace(originalNativeRegex, replacement);
};

/**
 * Executes a search for a match in a specified string. Returns true if a match is found, false otherwise.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test}
 *
 * @param {string} string
 * @return {Array|null}
 */
ExtendedRegExp.prototype.test = function (string) {
    return this.nativeRegex.test(string);
};

// Forward reads/writes of the the lastIndex property on to the wrapped native regex object
Object.defineProperty(ExtendedRegExp.prototype, 'lastIndex', {
    configurable: true,
    get: function () {
        return this.nativeRegex.lastIndex;
    },
    set: function (lastIndex) {
        this.nativeRegex.lastIndex = lastIndex;
    }
});

module.exports = ExtendedRegExp;
