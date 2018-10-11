/**
 * 只维护一条tcp连接
 * 实现对连接的重连，中断检测，重新连接
 */

import * as Events from 'events';
import * as net from 'net';
import { clmark, clerror } from '../tools/formator';
import { LinkBuffer } from './linkbuffer';
import { ErrorCode } from '../error_code'

const LINK_RECONNECT_DELAY = 5000;

export interface IfP2PLinkOptions {
    em: Events.EventEmitter;

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
export abstract class P2PLink {
    protected em: Events.EventEmitter;
    // protected connection: net.Socket;
    protected dataBuffer: LinkBuffer;

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
        })
    }
    abstract start(): void;
    abstract getRemoteAddress(): string;
    abstract getRemotePort(): number;


    abstract send(data: Buffer): Promise<ErrorCode>;
    // abstract getLocalAddress(): string;
    // abstract getLocalPort(): number;
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

}
// 无须管重连的事情
export class InP2PLink extends P2PLink {
    private connection: net.Socket;

    constructor(options: IfInP2PLinkOptions) {
        super(options as IfP2PLinkOptions);
        this.connection = options.connection;
    }
    start(): void {
        this.onData(this.connection);

        this.onError(this.connection);

        // this.connection.on('error', (err) => {
        //     clerror('InP2PLink error:', err)
        // })

        this.connection.on('end', () => {
            clerror("Link ended from ", this.connection.remoteAddress, this.connection.remotePort);
        })
        this.connection.on('close', () => {
            clerror('Link closed from ', this.connection.remoteAddress, this.connection.remotePort);
            this.em.emit('linkclose', {
                status: 'NOK',
                data: {
                    addr: this.connection.remoteAddress,
                    port: this.connection.remotePort
                }
            })
        })
    }
    getAddr() {
        return this.connection.remoteAddress;
    }
    getPort() {
        return this.connection.remotePort;
    }
    getRemoteAddress(): string {
        return this.connection.remoteAddress as string;
    }
    getRemotePort(): number {
        return this.connection.remotePort as number;
    }
    send(data: Buffer): Promise<ErrorCode> {
        return new Promise<ErrorCode>((resolve) => {
            this.connection.write(data, () => {
                return resolve(ErrorCode.RESULT_OK);
            });
        });
    }
}
// 需要管理重连
export class OutP2PLink extends P2PLink {
    private end: IfP2PLinkEnd;
    private connection: net.Socket;

    constructor(options: IfOutP2PLinkOptions) {
        super({
            em: options.em,
        });
        this.end = options.end;
        this.connection = Object.create(null);
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

        this.connection.on('close', () => {
            clerror('Link closed ', this.end.addr, this.end.port);

            setTimeout(() => {
                this.connect();
            }, LINK_RECONNECT_DELAY)
        });
        this.onData(this.connection);
        this.onError(this.connection);

    }
    getRemoteAddress(): string {
        return this.connection.remoteAddress as string;
    }
    getRemotePort(): number {
        return this.connection.remotePort as number;
    }
    send(data: Buffer): Promise<ErrorCode> {
        return new Promise<ErrorCode>((resolve) => {
            this.connection.write(data, () => {
                return resolve(ErrorCode.RESULT_OK);
            });
        });
    }
}
