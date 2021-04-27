- [TokenBatchSender](#tokenbatchsender)
  - [Setup](#setup)
  - [Contracts](#contracts)
    - [Compiled Contracts](#compiled-contracts)
    - [Compile Contracts Manually](#compile-contracts-manually)
    - [Deploy contracts](#deploy-contracts)
  - [Dapp](#dapp)
    - [Manully change Dapp config file](#manully-change-dapp-config-file)
    - [Run Dapp](#run-dapp)
      - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
      - [Compiles and minifies for production](#compiles-and-minifies-for-production)
    - [Dapp input csv file format](#dapp-input-csv-file-format)
  - [Dapp usage](#dapp-usage)
# TokenBatchSender
TokenBatchSender is a Dapp for batch sending cfx token and erc777 token

English | [简体中文](./README-CN.md)

## Setup

Run
``` bash
npm install

cd ./frontend

npm install
```

Chrome extension `Conflux Portal` is required for Dapp

## Contracts

### Compiled Contracts

Compiled contracts are provided in dist folder `/build/contracts`.

### Compile Contracts Manually

You need to change `node_modules/@openzeppelin/contracts/token/ERC777/ERC777.sol` line33 to
``` solidity
IERC1820Registry constant internal _ERC1820_REGISTRY = IERC1820Registry(0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820);
```
Address of ERC1820 on Conflux is different from that of Ethereum. 

`DMDToken.sol` and `GLDToken.sol` are ERC777 sample contracts used for testing.`GLD20.sol` is a sample ERC20 contract. 

After that, run
``` bash
// truffle or cfxtruffle is required
truffle compile

// or

cfxtruffle compile
```


### Deploy contracts

`./build/contracts/TransferToken.json` can be deployed to conflux network (either mainnet or testnet) directly. `TransferToken.json` takes an address array `trusted_contracts` as the constructor parameter from which array the token batch sending request will be accepted.

## Dapp

### Manully change Dapp config file

You need to specify deployed contract address in [Deploy contracts](#deploy-contracts).
Change `options` and `routing contracts` to custom your Dapp.

``` javascript
//frontend/src/contracts-config.js

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
const routingContractAddress = "cfxtest:type.contract:acadtsb7z2s4j47rsgmpzhwx9v5bt0fyu227wxg0xk"
```

### Run Dapp
#### Compiles and hot-reloads for development

```
cd ./frontend
npm run serve
```

#### Compiles and minifies for production

```
cd ./frontend
npm run build
```

### Dapp input csv file format
Dapp input csv is an n-row-2-column csv.
An example is provided in `./frontend/src/example/example.csv`
``` csv
// address, token to transfer
0x1e0cc11e4dc7208e74e20ce3060fdffc88680514, 1300
0x1ed71ee0fe63300e0f966546fc5091ba971a3581, 1500
```

## Dapp usage
1. connect to your wallet
2. select token
3. select csv [Dapp input csv file format](#dapp-input-csv-file-format)
![](./image/2021-04-27-14-16-10.png)

4. send token
![](./image/2021-04-27-14-20-25.png)

5. wait until transaction is confirmed
![](./image/2021-04-27-14-22-28.png)
