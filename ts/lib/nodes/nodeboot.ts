import { Node, NodeInterface } from './node';

export class NodeBoot extends Node implements NodeInterface {
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
