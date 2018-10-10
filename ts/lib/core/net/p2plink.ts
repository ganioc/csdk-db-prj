/**
 * 只维护一条tcp连接
 * 实现对连接的重连，中断检测，重新连接
 */

import * as Events from 'events';

export interface IfP2PLinkOptions {
    em: Events.EventEmitter,
}
export class P2PLink {
    private em: Events.EventEmitter;

    constructor(options: IfP2PLinkOptions) {
        if (options.em === undefined) {
            throw new Error('Undefined EventEmitter for P2PLink');
        }
        this.em = options.em;
    }

}
