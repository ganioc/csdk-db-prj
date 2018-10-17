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
import * as fs from 'fs';
import { LinkBuffer } from '../lib/core/net/linkbuffer';
import { NetBuffer, MSG_MODE } from '../lib/core/net/netbuffer';


// console.log(colors.red('-'.repeat(40)))

describe('Test lib\/', () => {
    describe('base58', () => {
        let str = 'hi';
        let bufStr = Buffer.from(str);
        let encodeStr = base58.encode(bufStr);
        let decodeStr = base58.decode(encodeStr);
        // console.log('encodeStr', encodeStr)
        // console.log('decodeStr', decodeStr.toString())

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
        let FILE_DB = 'testdb-random-00.db';

        async function checkFile() {
            if (fs.existsSync(FILE_DB)) {
                await new Promise((resolve, reject) => {
                    fs.unlinkSync(FILE_DB);
                    resolve();
                });
            }
        }
        checkFile();


        let db = new LocalDB({ name: FILE_DB, tables: [] });

        it('test open db', (done) => {
            db.open()
                .then(() => {
                    return Promise.resolve(ErrorCode.RESULT_OK)
                }, () => {
                    return Promise.resolve(ErrorCode.RESULT_FAILED)
                })
                .then((d) => {
                    expect(d).to.equal(ErrorCode.RESULT_OK);
                }).then(done);
        })

        it('test open table', (done) => {
            db.openTable('tectron')
                .then(() => {
                    return Promise.resolve(ErrorCode.RESULT_OK)
                }, () => {
                    return Promise.resolve(ErrorCode.RESULT_FAILED)
                })
                .then((d) => {
                    expect(d).to.equal(ErrorCode.RESULT_OK);
                }).then(done);
        })

        it('test insert into table', (done) => {
            db.insertToTable('tectron', "leechs")
                .then((data) => {
                    return Promise.resolve(ErrorCode.RESULT_OK)
                }, (err) => {
                    return Promise.resolve(ErrorCode.RESULT_FAILED)
                })
                .then((d) => {
                    expect(d).to.equal(ErrorCode.RESULT_OK);
                }).then(done);
        })
        it('test read table', (done) => {
            db.readTable('tectron')
                .then((d) => {
                    return Promise.resolve(ErrorCode.RESULT_OK)
                }, () => {
                    return Promise.resolve(ErrorCode.RESULT_FAILED)
                })
                .then((d) => {
                    expect(d).to.equal(ErrorCode.RESULT_OK);
                }).then(done);
        })
        it('test close table', (done) => {
            db.close()
                .then(() => {
                    return Promise.resolve(ErrorCode.RESULT_OK)
                }, () => {
                    return Promise.resolve(ErrorCode.RESULT_FAILED)
                })
                .then((d) => {
                    expect(d).to.equal(ErrorCode.RESULT_OK);
                }).then(done);
        })



    });

    describe('Test buf to uint', () => {
        // it('buffer to uint', (done) => {

        // });
        it('uint to buffer, time conversion', () => {
            let valTime = new Date().getTime();
            let oldTime = new Date(valTime).toLocaleString();

            formator.clwarn(oldTime);
            console.log('initial time:', valTime);
            let buf: Buffer = formator.uintToBuf(valTime);
            console.log(buf);
            let val = formator.bufToUInt(buf);

            console.log('decoded time:', val);
            let newTime = new Date(val).toLocaleString();
            formator.clwarn(newTime);

            chai.expect(oldTime, newTime);
        })
    })
    describe('Test pack and unpack', () => {
        it('Test link pack', () => {
            let data = Buffer.from('helloworld');
            let linkBuf = new LinkBuffer();
            let dataEncode = linkBuf.pack(data);
            formator.clmark('test pack and unpack', dataEncode.length);
            console.log(dataEncode);

            let dataDecode = linkBuf.unpack(dataEncode);

            // formator.cl(dataDecode);

            chai.expect(dataDecode.len.toString(), data.length.toString());
        })
        it('Test net pack', () => {
            let data = Buffer.from('helloworld');
            let netBuf = new NetBuffer();
            let dataEncode = netBuf.pack("1", "2", MSG_MODE.bMode, data);
            formator.clmark('test net pack and unpack', dataEncode.length);
            console.log(dataEncode);

            let dataDecode = netBuf.unpack(dataEncode);
            formator.cl(dataDecode);

            chai.expect("1", "1")
        })

    })

});
