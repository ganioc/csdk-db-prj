import { Node, NodeInterface } from './node';

export class NodeNormal extends Node implements NodeInterface {
    constructor(options: any) {
        super(options)
    }
    init() {
        console.log('init')
    }
    run() {
        console.log('run')
    }
}
