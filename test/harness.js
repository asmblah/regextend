/*
 * Extended regexes
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/regextend/
 *
 * Released under the MIT license
 * https://github.com/asmblah/regextend/raw/master/MIT-LICENSE.txt
 */

'use strict';

var chai = require('chai'),
    sinonChai = require('sinon-chai');

global.expect = chai.expect;
chai.use(sinonChai);
