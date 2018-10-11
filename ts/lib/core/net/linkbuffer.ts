import { clerror } from "../tools/formator";
import * as events from 'events';

const MAX_DATA_SIZE = 2 * 1024 * 1024;


enum STATE {
    idle = 0,
    head0,
    head1,
    magic0,
    magic1,
    magic2,
    magic3,
    len0,
    len1,
    len2,
    len3,
    body, // body length
    tail0,
    tail1,
}

const HEAD0 = 0xFE;
const HEAD1 = 0xFE;
const MAGIC0 = 'R'.charCodeAt(0);
const MAGIC1 = 'U'.charCodeAt(0);
const MAGIC2 = 'F'.charCodeAt(0);
const MAGIC3 = 'F'.charCodeAt(0);
const TAIL0 = 'E'.charCodeAt(0);
const TAIL1 = 'N'.charCodeAt(0);

export class LinkBuffer extends events.EventEmitter {
    private dataBuffer: Buffer;
    private dataIndex: number;
    private state: STATE;
    private counterBody: number;

    constructor() {
        super();
        this.dataBuffer = Buffer.alloc(MAX_DATA_SIZE, 0);
        this.dataIndex = 0;
        this.state = STATE.idle;
        this.counterBody = 0;
    }
    parse(data: Buffer) {
        let bLoop: boolean = true;
        let i: number;

        let bJump = (inNum: number, expect: number, nextState: number): boolean => {
            if (inNum === expect) {
                this.state = nextState;
                this.dataBuffer[this.dataIndex++] = inNum;
            } else {
                this.state = STATE.idle;
                this.dataIndex = 0;
            }
            return true;
        }

        for (i = 0; i < data.length; i++) {
            let d = data[i];
            switch (this.state) {
                case STATE.idle:
                    bJump(d, HEAD0, STATE.head0);
                    break;
                case STATE.head0:
                    bJump(d, HEAD1, STATE.head1);
                    // if (d === HEAD1) {
                    //     this.state = STATE.head1;
                    //     this.dataBuffer[this.dataIndex++] = d;
                    // } else {
                    //     this.state = STATE.idle;
                    //     this.dataIndex = 0;
                    // }

                    break;
                case STATE.head1:
                    bJump(d, MAGIC0, STATE.magic0);
                    // if (d === MAGIC0) {
                    //     this.state = STATE.head1;
                    //     this.dataBuffer[this.dataIndex++] = d;
                    // } else {
                    //     this.state = STATE.idle;
                    //     this.dataIndex = 0;
                    // }
                    break;
                case STATE.magic0:
                    bJump(d, MAGIC1, STATE.magic1);
                    break;
                case STATE.magic1:
                    bJump(d, MAGIC2, STATE.magic2);
                    break;
                case STATE.magic2:
                    bJump(d, MAGIC3, STATE.magic3);
                    break;
                case STATE.magic3:
                    this.counterBody = d << 24;
                    this.state = STATE.len0;
                    this.dataBuffer[this.dataIndex++] = d;
                    break;
                case STATE.len0:
                    this.counterBody += d << 16;
                    this.state = STATE.len1;
                    this.dataBuffer[this.dataIndex++] = d;
                    break;
                case STATE.len1:
                    this.counterBody += d << 8;
                    this.state = STATE.len2;
                    this.dataBuffer[this.dataIndex++] = d;
                    break;
                case STATE.len2:
                    this.counterBody += d;
                    this.state = STATE.len3;
                    this.dataBuffer[this.dataIndex++] = d;
                    break;
                case STATE.len3:
                    if (this.counterBody > (MAX_DATA_SIZE - 20)) {
                        this.state = STATE.idle;
                        this.dataIndex = 0;
                        clerror('link body too large:', this.counterBody)
                    } else {
                        this.counterBody--;
                        this.state = STATE.body;
                        this.dataBuffer[this.dataIndex++] = d;
                    }
                    break;
                case STATE.body:
                    this.counterBody--;
                    this.state = STATE.body;
                    this.dataBuffer[this.dataIndex++] = d;
                    if (this.counterBody === 0) {
                        this.state = STATE.tail0;
                    }
                    break;
                case STATE.tail0:
                    bJump(d, TAIL0, STATE.tail1)
                    break;
                case STATE.tail1:
                    if (d === TAIL1) {
                        this.dataBuffer[this.dataIndex++] = d;

                        let buf = this.dataBuffer.slice(0, this.dataIndex);

                        // send it through linkbuffer
                        this.emit('packet', buf);
                    }
                    this.state = STATE.idle;
                    this.dataIndex = 0;

                    break;
                default:
                    clerror('Wrong link parse state:', this.state);
                    break;
            }
        }
    }
    verify(packet: Buffer): boolean {

        return true;
    }
}
