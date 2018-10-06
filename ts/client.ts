import * as net from 'net';
import * as colors from 'colors';

const P2P_PORT = 8082;

var connect = () => {
    var client = net.connect({ port: P2P_PORT }, function () {
        console.log('连接到服务器！');
    });
    client.on('data', function (data) {
        console.log(data.toString());
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
}

connect();

