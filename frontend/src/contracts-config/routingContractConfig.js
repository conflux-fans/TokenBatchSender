import { default as routing } from "../../../build/contracts/TransferToken.json";

// specify TransferToken.json address
// 修改下面两个变量的值可以修改批量转账合约地址
// 要求分别为 CIP-37 格式的测试网地址与主网地址
const testnetRoutingContractAddress =
  "cfxtest:acfx9x18b7f6fa5at8eg7j6f3b2bdax112fhspm4h8";
const mainnetRoutingContractAddress =
"cfx:achen057u31ndkmkwm3e4mytj1mxxgaubu84m209rk";

const routingContractConfig = {
  1: {
    abi: routing.abi,
    bytecode: routing.bytecode,
    address: testnetRoutingContractAddress,
  },
  1029: {
    abi: routing.abi,
    bytecode: routing.bytecode,
    address: mainnetRoutingContractAddress,
  },
};

export default routingContractConfig;
