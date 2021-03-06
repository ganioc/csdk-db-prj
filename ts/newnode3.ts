import { cl, cltime, clwarn, clerror, clinfo } from './lib/core/tools/formator'
import { P2PNet, IfP2PNetOptions } from './lib/core/net/p2pnet'

import * as globalConfig from './config/newnode3.json'

const config = (<any>globalConfig);

let p2pnet = new P2PNet(config as IfP2PNetOptions);

p2pnet.start();
