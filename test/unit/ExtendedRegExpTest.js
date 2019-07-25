/*
 * Extended regexes
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/regextend/
 *
 * Released under the MIT license
 * https://github.com/asmblah/regextend/raw/master/MIT-LICENSE.txt
 */

'use strict';

var ExtendedRegExp = require('../../src/ExtendedRegExp');

describe('ExtendedRegExp', function () {
    describe('exec()', function () {
        it('should record only the offset of the full capture when there are no capturing groups', function () {
            var regex = new ExtendedRegExp('ab?c'),
                match = regex.exec('start ac');

            expect([].slice.call(match)).to.deep.equal([
                'ac'
            ]);
            expect(match.input).to.equal('start ac');
            expect(match.index).to.equal(6);
            expect(match.offsets).to.deep.equal([
                6
            ]);
        });

        it('should record the offset of each capturing group', function () {
            var regex = new ExtendedRegExp('ab?(cd)e(f)g'),
                match = regex.exec('start acdefg then abcdefg and end');

            expect([].slice.call(match)).to.deep.equal([
                'acdefg',
                'cd',
                'f'
            ]);
            expect(match.input).to.equal('start acdefg then abcdefg and end');
            expect(match.index).to.equal(6);
            expect(match.offsets).to.deep.equal([
                6,
                7,
                10
            ]);
        });

        it('should record the offset of each capturing group when there is a character class with an opening parenthesis', function () {
            var regex = new ExtendedRegExp('ab[c(d]e(f)g'),
                match = regex.exec('start abcefg then ab(efg then abdefg and end');

            expect([].slice.call(match)).to.deep.equal([
                'abcefg',
                'f'
            ]);
            expect(match.input).to.equal('start abcefg then ab(efg then abdefg and end');
            expect(match.index).to.equal(6);
            expect(match.offsets).to.deep.equal([
                6,
                10
            ]);
        });

        it('should record the offset of each capturing group when there is an escaped opening square bracket that looks like a character class with an opening parenthesis', function () {
            var regex = new ExtendedRegExp('ab\\[c(d]e)(f)g'),
                match = regex.exec('start ab[cd]efg then ab[cd]efg and end');

            expect([].slice.call(match)).to.deep.equal([
                'ab[cd]efg',
                'd]e',
                'f'
            ]);
            expect(match.input).to.equal('start ab[cd]efg then ab[cd]efg and end');
            expect(match.index).to.equal(6);
            expect(match.offsets).to.deep.equal([
                6,
                10,
                13
            ]);
        });

        it('should start matching from the lastIndex when using the "g" flag', function () {
            var regex = new ExtendedRegExp('a([bc]?)d', 'g'),
                match;

            regex.lastIndex = 10; // Skip to the first "then"
            match = regex.exec('start abd then acd then ad end');

            expect([].slice.call(match)).to.deep.equal([
                'acd',
                'c'
            ]);
            expect(match.input).to.equal('start abd then acd then ad end');
            expect(match.index).to.equal(15);
            expect(match.offsets).to.deep.equal([
                15,
                16
            ]);
        });

        it('should use -1 as the offset for an capturing group that did not match', function () {
            var regex = new ExtendedRegExp('not (this)|hello (wo)rld'),
                match = regex.exec('well hello world!');

            expect([].slice.call(match)).to.deep.equal([
                'hello world',
                undefined,
                'wo'
            ]);
            expect(match.input).to.equal('well hello world!');
            expect(match.index).to.equal(5);
            expect(match.offsets).to.deep.equal([
                5,
                -1,
                11
            ]);
        });

        it('should preserve backreferences', function () {
            var regex = new ExtendedRegExp('a(bc)d?\\1z'),
                match = regex.exec('start abcdbcz then abcbcz and end');

            expect([].slice.call(match)).to.deep.equal([
                'abcdbcz',
                'bc'
            ]);
            expect(match.input).to.equal('start abcdbcz then abcbcz and end');
            expect(match.index).to.equal(6);
            expect(match.offsets).to.deep.equal([
                6,
                7
            ]);
        });

        it('should return null when there was no match', function () {
            var regex = new ExtendedRegExp('some? pattern');

            expect(regex.exec('not a match')).to.be.null;
        });
    });

    describe('replace()', function () {
        it('should support basic replacement', function () {
            var regex = new ExtendedRegExp('abc', 'g');

            expect(regex.replace('start abc then abc end', 'zzz')).to.equal('start zzz then zzz end');
        });

        it('should support replacement with backreferences', function () {
            var regex = new ExtendedRegExp('a(.)c', 'g');

            expect(regex.replace('start abc then ayc end', 'z$1z')).to.equal('start zbz then zyz end');
        });
    });

    describe('test()', function () {
        it('should return true when there is a match', function () {
            var regex = new ExtendedRegExp('my x?string');

            expect(regex.test('my string')).to.be.true;
        });

        it('should return false when there is not a match', function () {
            var regex = new ExtendedRegExp('my x?string');

            expect(regex.test('this is not going to match')).to.be.false;
        });
    });
});
