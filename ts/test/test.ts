import * as colors from 'colors';
// import * as mocha from 'mocha';
import 'mocha';
import * as chai from 'chai';
const assert = require('assert');
import * as base58 from '../lib/core/lib/base58';

import * as formator from '../lib/core/tools/formator'

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
    describe('formator colors', () => {
        formator.clerror('error is red')
        formator.clinfo('info is green')
        formator.clwarn('warning is yellow')

        it('Please take a look at the colors', () => {
            chai.expect('ok', 'ok')
        })

        formator.strLoopObject({
            role: 'root',
            peer_id: "monsterid",
            person: {
                nose: 'red',
                legs: 'long',
                head: {
                    eyebrow: 2,
                    tesths: [1, 2, 3, 4, 5]
                }
            }
        });

        it('Test loopObj function', () => {
            chai.expect('ok', 'ok')
        })
    });



});
