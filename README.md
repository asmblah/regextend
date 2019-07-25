Regextend
=========

Regexes, only extended.

Features
--------
All the features native `RegExp` instances have, but with an added `.offsets`
property. In theory this follows [an earlier draft of the Match indices proposal](https://github.com/tc39/proposal-regexp-match-indices/tree/d13edded4216331eaa444fb8535b8aa304df44cf)
but without the nested `.groups` property. In future we need to either deprecate
this package and switch to the polyfill created there or implement this as a complete
polyfill:
- `.groups` has (since this was built) been renamed to `.indices`
- `.indices` is now a nested array so that it can contain the end index too
- Named capturing groups are not supported.

See also
--------
- [XRegExp](http://xregexp.com/)
- [Match indices proposal](https://github.com/tc39/proposal-regexp-match-indices)
