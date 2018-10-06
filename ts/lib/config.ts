/**
 * 只有3种节点类型
 */

export enum NODE_TYPE {
    BOOT_NODE = 0,
    NORMAL_NODE, //  可以转换成BP, 或退出
    WALLET_NODE, // 只能连接节点，发送transaction
    // BP_NODE, 
}
/**
 * 节点拥有的状态只有以下几种
 */

export enum BOOT_NODE_STATE {
    INIT = 0, // 启动节点，此时可以生成块，但是
    VOTE_COMPLETED,
    DIE_OUT,
}
/**
 * 根据vote表中所有节点的stake的数量进行排序
 * bp前21位开始轮流生产块，其它的节点处于备选状态
 * 每隔一段时间进行状态切换
 */
export enum NORMAL_NODE_STATE {
    INIT = 0,
    VOTE_INCOMPLETE,
    VOTE_COMPLETED,
}

export const CONFIG = {
    author: 'Yang Jun',
    version: 'V1.0',
    beatPeriodGrain: 1000, // 每1s执行一次队列检查任务
    beatPeriod: 10000, // 10s启动一次动作
    maxP2pConnection: 12,

}

export interface NodeState {
    type: NODE_TYPE;
    name: string;
    p2pPort: number;
}
