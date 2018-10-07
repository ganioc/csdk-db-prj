# 新特点
- 总长度是有限长度的
- 对资源要求有限的
- 靠数量取胜
- dpos减少对能源的依赖
- 依靠投票机制
- 

# 输入命令行方式
command boot|normal|wallet

--p2p_port

--rpc_port
--p2p_end xx.xx.xx.xx:port
--p2p_id 
--restart_delay 1000 // 1 s
--max_connection //

examples:

```
// boot node
node dist/index.js boot --p2p_port 8083  --p2p_id bootnode

node dist/index.js normal --p2p_port 8084 --p2p_end 127.0.0.1:8083 --p2p_id node1

node dist/index.js normal --p2p_port 8084 --p2p_end 127.0.0.1:8083 --p2p_id node2

```

# Dpos实现
## 初始节点的Heart beat


