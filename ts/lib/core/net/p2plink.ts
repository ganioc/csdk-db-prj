/**
 * 只维护一条tcp连接
 * 实现对连接的重连，中断检测，重新连接
 */

import * as Events from 'events';
import * as net from 'net';
import { clmark, clerror } from '../tools/formator';
import { LinkBuffer } from './linkbuffer';
import { ErrorCode } from '../error_code'

const FILENAME = '[p2plink.ts]';
const LINK_RECONNECT_DELAY = 5000;

export interface IfP2PLinkOptions {
    em: Events.EventEmitter;

}
export interface IfP2PLinkPacket {
    addr: string,
    port: number,
    data: Buffer,
}
type IfInP2PLinkOptions = IfP2PLinkOptions & {
    connection: net.Socket;
};
type IfOutP2PLinkOptions = IfP2PLinkOptions & {
    end: IfP2PLinkEnd;
};
export interface IfP2PLinkEnd {
    addr: string;
    port: number;
}
export interface IfP2PLinkPacket {
    addr: string;
    port: number;
    data: Buffer;
}
export abstract class P2PLink {
    protected em: Events.EventEmitter;
    // protected connection: net.Socket;
    protected dataBuffer: LinkBuffer;

    protected _bRunning: boolean;
    protected connection: net.Socket;

    constructor(options: IfP2PLinkOptions) {
        if (options.em === undefined) {
            throw new Error('Undefined EventEmitter for P2PLink');
        }
        this.em = options.em;

        this.dataBuffer = new LinkBuffer();

        this.dataBuffer.on('packet', (data: Buffer) => {
            this.em.emit('packet',
                {
                    addr: this.getRemoteAddress(),
                    port: this.getRemotePort(),
                    data: data
                });
        });

        this._bRunning = false;
        this.connection = Object.create(null);
    }
    abstract start(): void;
    // abstract send(data: Buffer): Promise<ErrorCode>;

    onData(connection: net.Socket): void {
        connection.on('data', (data) => {
            this.dataBuffer.parse(data);
        })
    };
    onError(connection: net.Socket): void {
        connection.on('error', (err) => {
            clerror(err);
        })
    }
    setRunning() {
        this._bRunning = true;
    }
    unsetRunning() {
        this._bRunning = false;
    }
    getRunning(): boolean {
        return this._bRunning;
    }
    getRemoteAddress(): string {
        return this.connection.remoteAddress as string;
    }
    getRemotePort(): number {
        return this.connection.remotePort as number;
    }

    send(data: Buffer): Promise<ErrorCode> {
        return new Promise<ErrorCode>((resolve) => {
            this.connection.write(this.dataBuffer.pack(data), () => {
                return resolve(ErrorCode.RESULT_OK);
            });
        });
    }

}
// 无须管重连的事情
export class InP2PLink extends P2PLink {

    constructor(options: IfInP2PLinkOptions) {
        super(options as IfP2PLinkOptions);
        this.connection = options.connection;
    }
    start(): void {
        this.onData(this.connection);

        this.onError(this.connection);

        this.connection.on('end', () => {
            clerror("Link ended from ", this.connection.remoteAddress, this.connection.remotePort);
        })
        this.connection.on('close', () => {
            clerror('Link closed from ', this.connection.remoteAddress, this.connection.remotePort);
            this.unsetRunning();

            this.em.emit('linkclose', {
                status: 'NOK',
                data: {
                    addr: this.connection.remoteAddress,
                    port: this.connection.remotePort
                }
            })
        })
    }

    // send(data: Buffer) {
    //     // return new Promise<ErrorCode>((resolve) => {
    //     //     this.connection.write(data, () => {
    //     //         return resolve(ErrorCode.RESULT_OK);
    //     //     });
    //     // });
    // }
}
// 需要管理重连
export class OutP2PLink extends P2PLink {
    private end: IfP2PLinkEnd;
    // private connection: net.Socket;

    constructor(options: IfOutP2PLinkOptions) {
        super({
            em: options.em,
        });
        this.end = options.end;
    }
    start(): void {
        this.connect();
    }

    connect() {
        this.connection = net.connect(
            {
                host: this.end.addr,
                port: this.end.port
            },
            () => {
                clmark('Connected to ', this.end.addr, this.end.port);
                this.setRunning();

                this.em.emit('linkconnect',
                    {
                        status: 'OK',
                        data: this.end
                    });
            }
        );
        this.connection.on('end', () => {
            clerror('Connection end to ', this.end.addr, this.end.port);
            this.em.emit('linkend',
                {
                    status: 'NOK',
                    data: this.end
                }
            )

        });

        this.connection.on('error', (err) => {
            clerror(FILENAME, 'outLink:', err);
        });

        this.connection.on('close', () => {
            clerror('Link closed ', this.end.addr, this.end.port);
            this.unsetRunning();
            setTimeout(() => {
                this.connect();
            }, LINK_RECONNECT_DELAY)
        });
        this.onData(this.connection);
        this.onError(this.connection);

    }


}
