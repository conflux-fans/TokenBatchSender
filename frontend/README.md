# Conflux ERC777 Token Transfer DAPP

## Project setup
```
npm install
```
and Chrome extension `Conflux Portal` is required.

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### TODOs
- [x] 切换主网  
- [x] 所有配置从config导入
- [x] 测试切换合约相关功能
- [ ] 网络错误?
- [ ] ~~用户手动添加代币合约地址~~
- [ ] 在 conflux scan 上查看
- [ ] 重构，划分component
- [ ] 窄屏 分辨率调整

### feedback

- [x] 去掉重新连接按钮；参考moonswap的连接钱包
- [x] bug: 断开连接后不改变状态
- [x] 代币余额显示单位为cfx，可以为小数；可参考moonswap
- [x] 账户代币余额只展示余额即可
- [ ] 转账完成输出转账结果；转账条数及代币数量
- [ ] 交易执行过程中的状态显示弹窗展示，参考moonswap
- [x] csv文件中转账代币数量单位为cfx, 可以为小数
- [x] 任意网络都支持hex地址格式和主网cip37地址；非主网还支持该网络地址格式
如测试网支持 cfxtest:..., 0x..., cfx:...; 主网只支持 0x..., cfx:...; 
- [x] load完csv文件后，检查全部地址格式，如果有错误下方打印错误结果并统一返回错误结果；否则执行转账
- [x] 根据是否在1820注册过，筛选出官方支持的erc777代币；做为可批量发送的tokenlist

### sdk problems

api报错信息太少
