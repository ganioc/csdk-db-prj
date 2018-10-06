import { Node } from './node';
import { NodeBoot } from './nodeboot';
import { NodeNormal } from './nodenormal';

export class NodeFactory {
    createNode(name: string, options: any): Node {
        let tempName = name.toLowerCase();
        if (tempName === 'normal') {
            return new NodeNormal(options);
        } else if (tempName === 'boot') {
            return new NodeBoot(options)
        } else {
            throw new Error('Unspecified name:' + name)
        }
    }
}
