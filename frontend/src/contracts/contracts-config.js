/*
  json为编译合约后生成的，包括bytecode与abi
  还需要手动指定合约的地址
*/

// 测试环境可以将引入路径设置为编译文件生成的绝对路径
import {default as GLD} from "./GLDToken.json";
import {default as DMD} from "./DMDToken.json";
// import {default as GLD} from "/Users/xxx/Conflux Studio/777/build/contracts/GLDToken.json";
// import {default as DMD} from "/Users/xxx/Conflux Studio/777/build/contracts/DMDToken.json";

GLD.label = "测试Token GLD"
GLD.address = "cfxtest:type.contract:ace59n3pj2ev5f1j3vdcfr39nm9kc8dgde1d83a384"

DMD.label = "测试Token DMD"
DMD.address = "cfxtest:type.contract:acg4kb024uwn2cr9682s5ar0yk7zx2vuja20bwrx46"

const routingContractAddress = "cfxtest:type.contract:accuzc2frpfwasccp1p342sj7ujrd02dyp5avd3znt"

const options = [GLD, DMD]

let config = {}

// select abi and bytecode form options
// 没查语法糖
options.forEach((option) => {
    // console.log(option.default);
    // console.log(option.contractName)
    // 键为contractName 所以不能设置两个contractName相同的
    config[option.contractName] = {
        abi: option.abi,
        bytecode: option.bytecode,
        address: option.address,
        label: option.label
    }
})

export { config, routingContractAddress };