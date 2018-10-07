import { parseCommand as funcParseCommand, Command } from '../simple_command'
import * as net from 'net';
import { CONFIG, NodeState, NODE_TYPE } from '../config';
import * as colors from 'colors'
import * as events from 'events'

export abstract class Node {
    protected id: string;
    protected port: number;
    protected connectionLst: net.Socket[];
    protected server: net.Server;
    protected RESTART_DELAY: number;
    protected maxP2pConnection: number;
    protected ee: events.EventEmitter;

    constructor(options: any) {
        if (options.p2p_id === undefined || typeof options.p2p_id !== 'string') {
            throw new Error('Wrong --p2p_id:' + options.p2p_id);
        }
        this.id = options.p2p_id;

        if (options.p2p_port === undefined) {
            throw new Error('Wrong --p2p_port:' + options.p2p_port)
        }

        this.port = parseInt(options.p2p_port);

        this.connectionLst = [];

        this.server = Object.create(null);

        console.log(colors.yellow('->' + this.id + ' ' + this.port))

        this.RESTART_DELAY = (options.restart_delay === undefined) ? CONFIG.defaultRestartDelay : options.restart_delay;

        this.maxP2pConnection = (options.max_connection === undefined) ? CONFIG.defaultMaxP2pConnection : options.max_connection;

        this.ee = new events.EventEmitter();
    }
    abstract startServer(): void;

    emptyConnectionLst(): void {
        this.connectionLst = [];
    }
    public createServer(connectionCB: (conn: net.Socket) => void): void {
        this.emptyConnectionLst();

        this.server = net.createServer((connection) => {
            console.log('client connected');

            if (this.connectionLst.length >= this.maxP2pConnection) {
                console.log('Exceed maximum p2p connection number:',
                    this.maxP2pConnection);
                return;
            }
            this.connectionLst.push(connection);
            // 这个是什么意思呢？
            // connection.pipe(connection);

            connection.on('data', (data) => {
                console.log(colors.green('<--Recv from ' + connection.remoteAddress + ':' + connection.remotePort))
                console.log(data.toString());
                this.ee.emit('data', data)
                // sockets.forEach(function(sock, index, array) {
                //     sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n');
                // });
            })

            connection.on('end', () => {
                console.log(colors.red('-'.repeat(20)));
                console.log(this.id, '客户端关闭连接');
            });

            connection.on('close', () => {
                console.log('closed')

                let index = this.connectionLst.findIndex(function (o) {
                    return o.remoteAddress === connection.remoteAddress && o.remotePort === connection.remotePort;
                })
                if (index !== -1) this.connectionLst.splice(index, 1);
                console.log('CLOSED: ' + connection.remoteAddress + ' ' + connection.remotePort);

            })
            connection.on('error', (err) => {
                console.log(colors.red('-'.repeat(20)));
                console.log(err)
            })
        });

        this.server.listen(this.port, () => {
            console.log('server is listening on:', this.port);
        });
        this.server.on('error', (err) => {
            console.log(colors.red('Server ==>'), err);
            setTimeout(() => {
                this.createServer(connectionCB);
            }, this.RESTART_DELAY)

            console.log(colors.blue('Restart server after ' + 2 + ' seconds'));
        })
        this.server.on('close', () => {
            setTimeout(() => {
                this.createServer(connectionCB);
            }, this.RESTART_DELAY)

            console.log(colors.blue('Restart server after ' + 2 + ' seconds'));
        })

    }
    public broadcast(data: string) {
        this.connectionLst.forEach(function (sock, index, array) {
            sock.write(data);
            let t = new Date();
            console.log(colors.green(t.toTimeString()))
            console.log(colors.yellow('-->' + 'Write to ' + sock.remoteAddress + ':' + sock.remotePort))
            console.log(data);
        });
    }
}
export interface NodeInterface {
    init: () => void,
    run: () => void,
}
