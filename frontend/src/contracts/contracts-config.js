// import ERC777 Token .json files
import { default as ERC777 } from "../../../build/contracts/ERC777.json";
import { default as routing } from "../../../build/contracts/TransferToken.json";

/* specify token to select in Dapp.
 contractName: primary key
 label: label displayed in Dapp frontend
 address: specify contract address
 disabled: disable option will be displayed as 'disabled' in Dapp frontend (defalut to false)
*/

const options = [
  {
    address: "cfx:achc8nxj7r451c223m18w2dwjnmhkd6rxawrvkvsy2",
    label: "FansCoin",
    contractName: "FC",
  },
  {
    address: "cfx:acf2rcsh8payyxpg6xj7b0ztswwh81ute60tsw35j7",
    label: "conflux USDT",
    contractName: "cUSDT",
  },
  {
    address: "cfxtest:achkx35n7vngfxgrm7akemk3ftzy47t61yk5nn270s",
    label: "FansCoin",
    contractName: "FC-testnet",
  },
  {
    address: "cfxtest:acab179g4xj369s16ufuaaku2bh6n52wwju2845cda",
    label: "conflux USDT",
    contractName: "cUSDT-testnet",
  },
  {
    contractName: "GLD",
    label: "测试Token GLD",
    address: "cfxtest:ace0ea1x6st1spm1jwfces43tder2yewz2vtx8hxrt",
  },
  {
    contractName: "D6",
    label: "测试Token Decimal6", // ERC777 的非法实现
    address: "cfxtest:aca6v0d4k90ys8ymfuk1ay0hubs0h7yhdje2ht916e",
  },
  // {
  //   address: 'cfx:achcuvuasx3t8zcumtwuf35y51sksewvca0h0hj71a',
  //   label: 'conflux MOON',
  //   contractName: 'cMOON'
  // },
  // {
  //   address: 'cfx:acdrf821t59y12b4guyzckyuw2xf1gfpj2ba0x4sj6',
  //   label: 'conflux ETH',
  //   contractName: 'cETH'
  // },
  // {
  //   address: 'cfx:acg158kvr8zanb1bs048ryb6rtrhr283ma70vz70tx',
  //   label: 'Wrapped Conflux',
  //   contractName: 'WCFX'
  // },

  // {
  //   address: 'cfx:acdkyd8tmezzs6cvmfwtpkg7y9k8cnhdapfcganwt9',
  //   label: 'conflux AMP',
  //   contractName: 'cAMP'
  // },
  // {
  //   address: 'cfx:acbb225r9wc7a2kt1dz9gw0tuv5v1kgdjuh5akdh3t',
  //   label: 'conflux BTC',
  //   contractName: 'cBTC'
  // },
  // {
  //   address: 'cfx:aca13suyk7mbgxw9y3wbjn9vd136swu6s21tg67xmb',
  //   label: 'conflux USDC',
  //   contractName: 'cUSDC'
  // },
  // {
  //   address: 'cfx:acekx06rp1bcdkup1ubr2vw77tsrw81ysy0d3n7x5s',
  //   label: 'conflux DPI',
  //   contractName: 'cDPI'
  // },
  // {
  //   address: 'cfx:acd3fhs4u0yzx7kpzrujhj15yg63st2z6athmtka95',
  //   label: 'conflux DAI',
  //   contractName: 'cDAI'
  // },
  // {
  //   address: 'cfx:accedvremfhmym60f9u4nghb8utxcgbtb2acewunwh',
  //   label: 'conflux COMP',
  //   contractName: 'cCOMP'
  // },
  // {
  //   address: 'cfx:acbyc3ahvctpx5cabfw6n1s9fv40trur6ydbu1zr4x',
  //   label: 'conflux BAND',
  //   contractName: 'cBAND'
  // },
  // {
  //   address: 'cfx:accuj4mt4kmnhzr1b3xe653n63694tc0cjuzkj5t94',
  //   label: 'conflux LINK',
  //   contractName: 'cLINK'
  // },
  // {
  //   address: 'cfx:acczy0zs2fu03pnx0w1u19pkprsm6r50spkz7eg4c3',
  //   label: 'conflux Binance Coin',
  //   contractName: 'cBNB'
  // },
  // {
  //   address: 'cfx:acdkf73rh2ewwm3hbwddd00wy3v3fyau3ew61jbrbj',
  //   label: 'conflux SWRV',
  //   contractName: 'cSWRV'
  // },
  // {
  //   address: 'cfx:accxdrf7c3vntwyyhj8ws8mcatd433k8sjvrjbx39r',
  //   label: 'conflux YFII',
  //   contractName: 'cYFII'
  // },
  // {
  //   address: 'cfx:acc3hzr7e570ccnrb91wgufwcs6a171jvuax68krfm',
  //   label: 'conflux DF',
  //   contractName: 'cDF'
  // },
  // {
  //   address: 'cfx:acfezfepc4wuxj2fmfya1w9kwjutk7wtaudbz0k6dj',
  //   label: 'conflux YFI',
  //   contractName: 'cYFI'
  // },
  // {
  //   address: 'cfx:ach3cmt7wze9tkhxctkdzfsaf0azcppgvpfwfdzmku',
  //   label: 'conflux UMA',
  //   contractName: 'cUMA'
  // },
  // {
  //   address: 'cfx:acdcap62vh2km00y4fh117ngz8jauj19g618km65m6',
  //   label: 'conflux KP3R',
  //   contractName: 'cKP3R'
  // },
  // {
  //   address: 'cfx:acamc98zc1a93ap8u9xaruc2kefpd6mpy6089w6yv0',
  //   label: 'conflux KNC',
  //   contractName: 'cKNC'
  // },
  // {
  //   address: 'cfx:acg797d4c6v007y46hj1juk7z0ac86m04uc13n4bcg',
  //   label: 'conflux SNX',
  //   contractName: 'cSNX'
  // },
  // {
  //   address: 'cfx:acff13n54n4t02cy6uc8xfdxrf4enanr5jh6vy761g',
  //   label: 'conflux LEND',
  //   contractName: 'cLEND'
  // },
  // {
  //   address: 'cfx:acc1uh4ftd4jhser99uk8nk8unkbz8ykmyxt0n27v5',
  //   label: 'conflux FOR',
  //   contractName: 'cFOR'
  // },
  // {
  //   address: 'cfx:achj7swfxkg634hcvg70ttywtgyn2w619jxscmjdp3',
  //   label: 'conflux sUSD',
  //   contractName: 'csUSD'
  // },
  // {
  //   address: 'cfx:acc8599utu7nayj50w393eycznhv4e23g2ys6xmvf5',
  //   label: 'conflux Ins3.Finance Coin',
  //   contractName: 'cITF'
  // },
  // {
  //   address: 'cfx:acgbjtsmfpex2mbn97dsygtkfrt952sp0psmh8pnvz',
  //   label: 'conflux Flux Protocol',
  //   contractName: 'cFLUX'
  // },
  // {
  //   address: 'cfx:ace09320r53kxk8tx07wz1mx5dwhcaumk2etx52tt6',
  //   label: 'conflux HBTC',
  //   contractName: 'cHBTC'
  // },
  // {
  //   address: 'cfx:acdz7hfvku8fm0j8k065urs2n59k0e33npbjtyp2bv',
  //   label: 'conflux Bytom minted',
  //   contractName: 'cMBTM'
  // }
];

// specify TransferToken.json address
const testnetRoutingContractAddress =
  "cfxtest:acfx9x18b7f6fa5at8eg7j6f3b2bdax112fhspm4h8";
const mainnetRoutingContractAddress =
"cfx:achen057u31ndkmkwm3e4mytj1mxxgaubu84m209rk";

let config = {};
options.forEach((option) => {
  config[option.contractName] = {
    abi: ERC777.abi,
    bytecode: ERC777.bytecode,
    address: option.address,
    label: option.label,
    disabled: option.disabled,
  };
});

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
  }
};

export { config, routingContractConfig };
