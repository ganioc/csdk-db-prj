import * as colors from 'colors';
// import * as mocha from 'mocha';
import 'mocha';
import * as chai from 'chai';
const assert = require('assert');
import * as base58 from '../lib/core/lib/base58';
var expect = require('chai').expect;

import * as formator from '../lib/core/tools/formator'
import { LocalDB, IfDBOptions } from '../lib/core/db/localdatabase';
import { ErrorCode } from '../lib/core/error_code'

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

    describe('Test sqlite3', () => {
        let db = new LocalDB({ name: 'testdb.db', tables: [] });


        // Promise.resolve('OK')
        //     .then((fb) => {
        //         formator.clinfo('test sqlite3')
        //     })
        //     .then((fb) => { }, (err) => {

        //     })
        //     .then((fb) => {
        //         it('Test db create table', () => {
        //             chai.expect(feedback.toString(), ErrorCode.RESULT_OK.toString());
        //         })
        //     })
        //     .catch((err) => {
        //         feedback = ErrorCode.RESULT_FAILED;
        //         it('Test db create table', () => {
        //             chai.expect(feedback.toString(), ErrorCode.RESULT_OK.toString());
        //         })
        //     });

        /*
                async function funcTest() {
                    feedback = await db.init();
                }
                funcTest();
        
                it('Test db open', () => {
                    chai.expect(feedback.toString(), ErrorCode.RESULT_OK.toString());
                })
        
                async function funcTest3() {
                    feedback = await db.initTable('people');
                }
                funcTest3();
                it('Test db create table', () => {
                    chai.expect(feedback.toString(), ErrorCode.RESULT_OK.toString());
                })
        
                async function funcTest4() {
                    feedback = await db.insertToTable('people', 'Philips');
                    feedback = await db.insertToTable('people', 'Tracy');
                }
                funcTest4();
                it('Test db insert to table', () => {
                    chai.expect(feedback.toString(), ErrorCode.RESULT_OK.toString());
                })
        
                async function funcTest5() {
                    feedback = await db.readTable('people');
                }
                funcTest5();
                it('Test db read from table', () => {
                    chai.expect(feedback.toString(), ErrorCode.RESULT_OK.toString());
                })
        
                async function funcTest2() {
                    feedback = await db.close();
                }
                funcTest2();
        
                it('Test db close', () => {
                    chai.expect(feedback.toString(), ErrorCode.RESULT_OK.toString());
                })
                */

    });



});
