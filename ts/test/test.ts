import * as colors from 'colors';
// import * as mocha from 'mocha';
import 'mocha';
import * as chai from 'chai';
const assert = require('assert');
import * as base58 from '../lib/core/lib/base58';



// console.log(colors.red('-'.repeat(40)))

describe('Test lib\/', () => {
    describe('base58', () => {
        let str = 'hi';
        let bufStr = Buffer.from(str);
        let encodeStr = base58.encode(bufStr);
        let decodeStr = base58.decode(encodeStr);
        console.log('encodeStr', encodeStr)
        console.log('decodeStr', decodeStr.toString())

        it('encode hi Should return  8wr', () => {
            chai.expect(encodeStr, '8wr')
        })

    });


});
