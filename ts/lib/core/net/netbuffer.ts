import { clerror, clinfo, bufToUInt, bufToStr } from "../tools/formator";
import * as events from 'events';

const FILENAME = '[netbuffer.ts]';

const MAX_ID_BUFFER_LENGTH = 50;
const MAX_ID_LENGTH = 24;
const B_MODE = 'b'.charCodeAt(0);
const T_MODE = 't'.charCodeAt(0);

export interface IfMsgId {
    srcId: string;
    dstId: string;
    msgId: number;
}
export enum MSG_MODE {
    bMode = B_MODE,
    tMode = T_MODE,
}
export interface IfNetUnpack {
    srcId: string;
    dstId: string;
    msgId: number;
    timestamp: number;
    mode: MSG_MODE;
    len: number;
    data: Buffer;
}

export class NetBuffer extends events.EventEmitter {
    private msgIdBuffer: IfMsgId[];
    private currentId: number;

    constructor() {
        super();
        this.msgIdBuffer = [];
        this.currentId = 0;
    }
    getId() {
        return this.currentId++;
    }
    unpack(data: Buffer): IfNetUnpack {
        let deco: IfNetUnpack = Object.create(null);
        deco.srcId = bufToStr(data.slice(0, MAX_ID_LENGTH));
        deco.dstId = bufToStr(data.slice(MAX_ID_LENGTH, 2 * MAX_ID_LENGTH));
        deco.msgId = data.readUIntBE(2 * MAX_ID_LENGTH, 4);
        deco.timestamp = data.readUIntBE(2 * MAX_ID_LENGTH + 4, 8);
        deco.mode = data[2 * MAX_ID_LENGTH + 12];
        deco.len = data.readUIntBE(2 * MAX_ID_LENGTH + 13, 4);
        deco.data = data.slice(2 * MAX_ID_LENGTH + 17, data.length);

        return deco;
    }
    pack(srcId: string, dstId: string, mode: MSG_MODE, data: Buffer): Buffer {
        let buf = new Buffer(2 * MAX_ID_LENGTH + 4 + 8 + 1 + 4 + data.length);

        let i = 0;
        let srcBuf = new Buffer(srcId);
        for (i = 0; i < MAX_ID_LENGTH; i++) {
            if (i < srcBuf.length) {
                buf[i] = srcBuf[i];
            }
        }
        let dstBuf = new Buffer(dstId);
        for (i = 0; i < MAX_ID_LENGTH; i++) {
            if (i < dstBuf.length) {
                buf[MAX_ID_LENGTH + i] = dstBuf[i];
            }
        }
        let msgId = this.getId();
        buf.writeUIntBE(msgId, 2 * MAX_ID_LENGTH, 4);

        let timestamp = new Date().getTime();
        buf.writeUIntBE(timestamp, 2 * MAX_ID_LENGTH + 4, 8);


        buf[2 * MAX_ID_LENGTH + 12] = mode;


        buf.writeUIntBE(data.length, 2 * MAX_ID_LENGTH + 13, 4);

        for (i = 0; i < data.length; i++) {
            buf[2 * MAX_ID_LENGTH + 17 + i] = data[i];
        }


        return buf;
    }
    exist(netMsg: IfNetUnpack): boolean {
        clinfo('List msgIdBuffer:');
        console.log(this.msgIdBuffer)

        let found = this.msgIdBuffer.find((item) => {
            return item.dstId === netMsg.dstId && item.srcId === netMsg.srcId && item.msgId === netMsg.msgId;
        });

        if (found) {
            console.log(found);
            return true;
        } else {
            console.log('not found');
            return false;
        }
    }
    insert(netMsg: IfNetUnpack) {
        let obj = {
            srcId: netMsg.srcId,
            dstId: netMsg.dstId,
            msgId: netMsg.msgId,
        };
        clinfo('insert into idBuffer')
        console.log(obj);
        this.msgIdBuffer.push(obj);

        if (this.msgIdBuffer.length > MAX_ID_BUFFER_LENGTH) {
            this.msgIdBuffer.shift();
        }

    }
}
