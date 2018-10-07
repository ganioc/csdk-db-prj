import { Node, NodeInterface } from './node';
import { CONFIG, BOOT_NODE_STATE } from '../config'
import * as colors from 'colors';

export class NodeBoot extends Node implements NodeInterface {
    private state: BOOT_NODE_STATE;

    constructor(options: any) {
        super(options)
        this.state = BOOT_NODE_STATE.INIT;
    }
    init() {
        console.log(this.id, '-->init')

        this.ee.on('data', (data) => {
            console.log(data.toString())
        })
    }
    // run the work periodic
    async run() {
        console.log(this.id, '-->run')

        setInterval(() => {
            this.broadcast('hi');
        }, 5000);
    }
    startServer() {
        this.init();
        console.log(this.id, '-->started');

        this.createServer((connection) => {

        });

        this.run();
    }


    /*
    startServer = () => {
        var connectionLsts: net.Socket[] = [];
        var server = net.createServer(function (connection) {
            console.log('client connected');
    
            if (connectionLsts.length >= CONFIG.maxP2pConnection) {
                console.log('Exceed maximum p2p connection number:',
                    CONFIG.maxP2pConnection);
                return;
            }
    
            setInterval(() => {
                connection.write(colors.yellow('Hello World!\r\n'));
            }, 1500)
    
    
            connectionLsts.push(connection);
    
            connection.pipe(connection);
            // console.log(connection);
            console.log(connection.remoteAddress);
            console.log(connection.remotePort)
    
            connection.on('data', (data) => {
                // sockets.forEach(function(sock, index, array) {
                //     sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n');
                // });
            })
    
            connection.on('end', function () {
                console.log(colors.red('-'.repeat(20)));
                console.log('客户端关闭连接');
            });
            connection.on('close', () => {
                console.log('closed')
    
                let index = connectionLsts.findIndex(function (o) {
                    return o.remoteAddress === connection.remoteAddress && o.remotePort === connection.remotePort;
                })
                if (index !== -1) connectionLsts.splice(index, 1);
                console.log('CLOSED: ' + connection.remoteAddress + ' ' + connection.remotePort);
    
            })
            connection.on('error', (err) => {
                console.log(colors.red('-'.repeat(20)));
                console.log(err)
            })
        });
        server.listen(this.port, function () {
            console.log('server is listening');
        });
        server.on('error', (err) => {
            console.log(colors.red('Server ==>'), err);
            setTimeout(() => {
                this.startServer();
            }, 2000)
    
            console.log(colors.blue('Restart server after ' + 2 + ' seconds'));
        })
        server.on('close', () => {
            setTimeout(() => {
                this.startServer();
            }, 2000)
    
            console.log(colors.blue('Restart server after ' + 2 + ' seconds'));
        })
    }
    */

}
