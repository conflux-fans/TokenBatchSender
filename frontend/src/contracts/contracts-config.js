// import ERC777 Token .json files
import {default as ERC777} from "../../../build/contracts/ERC777.json";

/* specify token to select in Dapp.
 contractName: primary key
 label: label displayed in Dapp frontend
 address: specify contract address
 disabled: disable option will be displayed as 'disabled' in Dapp frontend (defalut to false)
*/ 
const options = [
  {
    contractName: "GLD",
    label: "测试Token GLD",
    address: "cfxtest:type.contract:ace59n3pj2ev5f1j3vdcfr39nm9kc8dgde1d83a384"
  },
  {
    contractName: "DMD",
    label: "测试Token DMD",
    address: "cfxtest:type.contract:acg4kb024uwn2cr9682s5ar0yk7zx2vuja20bwrx46",
    disabled: false
  }
]

// specify TransferToken.json address
const routingContractAddress = "cfxtest:type.contract:acawv88xs994f2f7ur4g7mewtcptdk2mfy63vupcys"

let config = {}
options.forEach((option) => {
  config[option.contractName] = {
      abi: ERC777.abi,
      bytecode: ERC777.bytecode,
      address: option.address,
      label: option.label,
      disabled: option.disabled
  }
})

export { config, routingContractAddress };
