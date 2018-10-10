/**
 * 调用net模块，实现socket的连接和管理，提供的调用接口有:
 * 
 * Broadcast()
 * 实现对发送来的数据包的
 * 过滤，
 * 转发，blood over，发给上层
 * 
 * 
 */
import { P2PLink, IfP2PLinkOptions } from './p2plink';
import * as Events from 'events';
import * as net from 'net';
import { cl, clerror, clinfo, clmark } from '../tools/formator'

export interface IfP2PNetEnd {
    addr: string;
    port: number;
}
export interface IfP2PNetOptions {
    role: string;
    peer_id: string;
    p2p_port: number;
    p2p_end: IfP2PNetEnd[];
    max_connection: number;
    restart_delay: number; // ms
}
export class P2PNet {
    public em: Events.EventEmitter;
    private inLinkLst: P2PLink[];
    // private outLinkLst: P2PLink[];
    private server: net.Server;
    private p2pPort: number;
    private p2pEnd: IfP2PNetEnd[];
    private RESTART_DELAY: number;

    constructor(options: IfP2PNetOptions) {
        clinfo('global config:')
        cl(options);
        // console.log(options)

        this.em = new Events.EventEmitter();
        this.inLinkLst = [];
        this.server = Object.create(null);

        if (options.p2p_port === undefined) {
            throw new Error('Undefined p2pPort')
        }
        this.p2pPort = options.p2p_port
        this.p2pEnd = [];

        if (options.p2p_end === undefined) {
            throw new Error("Undefined p2p end ip:port");
        }
        options.p2p_end.forEach((item: IfP2PNetEnd) => {
            this.p2pEnd.push(item)
        })

        this.RESTART_DELAY = options.restart_delay;
    }
    broadcast() {

    }
    clearLinkLst() {
        this.inLinkLst = [];
        delete this.inLinkLst;
    }
    startServer() {
        this.clearLinkLst()

        this.server = net.createServer((connection) => {
            // cl('hello', 'hi')
            clmark('Hello, connected from ', connection.remoteAddress, ':', connection.remotePort);
            // console.log(connection)

        });
        this.server.listen({ port: this.p2pPort, host: 'localhost' }, () => {
            clinfo('server is listening on:', this.p2pPort);
        });
        this.server.on('error', (err) => {
            clerror('Server ==>', err);
            // setTimeout(() => {
            //     this.startServer();
            // }, this.RESTART_DELAY)

            // clinfo('Restart server after ' + 2 + ' seconds');
        })

        this.server.on('close', () => {
            setTimeout(() => {
                this.startServer();
            }, this.RESTART_DELAY)

            clinfo('Restart server after ' + this.RESTART_DELAY + ' m seconds');
        })
    }
}
