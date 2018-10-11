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
import { P2PLink, IfP2PLinkOptions, IfP2PLinkEnd, InP2PLink, OutP2PLink } from './p2plink';
import * as Events from 'events';
import * as net from 'net';
import { cl, clerror, clinfo, clmark } from '../tools/formator'


export interface IfP2PNetOptions {
    role: string;
    peer_id: string;
    p2p_port: number;
    p2p_end: IfP2PLinkEnd[];
    max_connection: number;
    restart_delay: number; // ms
}
export class P2PNet {
    public em: Events.EventEmitter;
    private inLinkLst: InP2PLink[];
    // private outLinkLst: P2PLink[];
    private server: net.Server;
    private p2pPort: number;
    private p2pEnd: OutP2PLink[];
    private RESTART_DELAY: number;
    private MAX_IN_CONNECTION: number;

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
        options.p2p_end.forEach((item: IfP2PLinkEnd) => {
            this.p2pEnd.push(new OutP2PLink({
                em: this.em,
                end: item
            }))
        })

        this.RESTART_DELAY = options.restart_delay;
        this.MAX_IN_CONNECTION = options.max_connection;
    }
    broadcast() {

    }
    clearLinkLst() {
        this.inLinkLst = [];
        // delete this.inLinkLst;
    }
    start() {
        this.startServer();
        this.startClient();
    }
    // 链路的重连由p2plink层去做
    startClient() {
        this.p2pEnd.forEach((item: OutP2PLink) => {
            item.start();
        })
    }
    startServer() {
        this.clearLinkLst()

        this.server = net.createServer((connection) => {
            // cl('hello', 'hi')
            clmark('Hello, connected from ', connection.remoteAddress, ':', connection.remotePort);
            // console.log(connection)

            if (this.inLinkLst.length >= this.MAX_IN_CONNECTION) {
                clerror('Exceed maximum p2p connection number:',
                    this.MAX_IN_CONNECTION);
                return;
            }
            let inLink: InP2PLink = new InP2PLink({
                em: this.em,
                connection: connection
            });
            inLink.start();
            this.inLinkLst.push(inLink);

        });
        this.server.listen({ port: this.p2pPort, host: 'localhost' }, () => {
            clinfo('server is listening on:', this.p2pPort);
        });
        this.server.on('error', (err) => {
            clerror('Server ==>', err);
        })

        this.server.on('close', () => {
            setTimeout(() => {
                this.startServer();
            }, this.RESTART_DELAY)

            clinfo('Restart server after ' + this.RESTART_DELAY + ' m seconds');
        });

        this.em.on('linkclose', (d) => {
            let index = this.inLinkLst.findIndex(function (o) {
                return o.getAddr() === d.data.addr && o.getPort() === d.data.port;
            });
            if (index !== -1) this.inLinkLst.splice(index, 1);
            clinfo('Link Removed: ', d.data.addr, d.data.port);
        });
        this.em.on('packet', (rcvStuff) => {
            clinfo('Packet rev:', rcvStuff.addr, rcvStuff.port);
        });
    }
}
