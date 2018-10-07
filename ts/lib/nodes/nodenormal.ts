import { Node, NodeInterface } from './node';

export class NodeNormal extends Node implements NodeInterface {
    constructor(options: any) {
        super(options)
    }
    init() {
        console.log(this.id, '-->init')
    }
    run() {
        console.log('-->run')
    }
    startServer() {
        this.init();

        console.log(this.id, '-->started');
    }
}
