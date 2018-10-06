import { parseCommand as funcParseCommand, Command } from '../simple_command'
import * as net from 'net';
import { CONFIG, NodeState, NODE_TYPE } from '../config';
import * as colors from 'colors'

const P2P_PORT = 8082;

export class Node {
    private name: string;
    private state: number;
    constructor(options: any) {

        this.name = options.name;
        this.state = 0;
    }
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
        server.listen(P2P_PORT, function () {
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


}
export interface NodeInterface {
    init: () => void,
    run: () => void,
}
