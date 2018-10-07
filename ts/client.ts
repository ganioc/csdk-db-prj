import * as net from 'net';
import * as colors from 'colors';
import * as events from 'events';

let ee = new events.EventEmitter();

const P2P_PORT = 8083;

var connect = () => {
    var client = net.connect({ port: P2P_PORT }, function () {
        console.log('连接到服务器！');
    });
    client.on('data', function (data) {
        let t = new Date();
        console.log(colors.green(t.toTimeString()))
        console.log(colors.yellow('<--' + 'Rev from ' + client.remoteAddress + ':' + client.remotePort))
        console.log(data.toString());
        ee.emit('data', data);
        // client.write('got it!')

        // client.end();
    });
    client.on('end', function () {
        console.log('断开与服务器的连接');
        setTimeout(() => {
            connect();
        }, 2000);
    });
    client.on('error', (err) => {
        console.log(colors.red('-'.repeat(20)))
        console.log(err);
        setTimeout(() => {
            connect();
        }, 2000);
    })

    ee.on('data', (data) => {
        client.write(data);
    });
}

connect();

