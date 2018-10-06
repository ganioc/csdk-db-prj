import { parseCommand as funcParseCommand, Command } from './lib/simple_command'
import * as net from 'net';
import * as colors from 'colors';

import { Node } from './lib/nodes/node'
import { NodeFactory } from './lib/nodes/nodefactory'

console.log('hi')
const SERVER_PORT = 8081;
const P2P_PORT = 8082;
// const sql = `INTO`;

// console.log(sql);
let global_node: Node;

//var net = require('net');



async function run(argv: string[]) {
    let command = funcParseCommand(argv);
    console.log(command);
    if (command === undefined) {
        throw new Error('Empty command');
    }
    let factory = new NodeFactory();
    // global_node = factory.createNode(command.command as string, command.options);

    // global_node.startServer();

}
if (require.main === module) {
    run(process.argv);
}
