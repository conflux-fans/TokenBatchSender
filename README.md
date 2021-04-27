# TokenBatchSender
TokenBatchSender is a Dapp for batch sending cfx token and erc777 token

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

After that, run
``` bash
// truffle or cfxtruffle is required
truffle compile

// or

cfxtruffle compile
```


### Deploy contracts

The `.json` files in `./build/contracts` can be deployed to conflux network (either mainnet or testnet) directly. `DMDToken.json` and `GLDToken.json` are ERC777 sample contracts. `TransferToken.json` takes an address array `trusted_contracts` as the constructor parameter from where the token batch sending request will be accepted.

## Dapp

### Manully change Dapp config file

Suppose you have get the deployed address in [Deploy contracts](#deploy-contracts)

``` javascript
//frontend/src/contracts-config.js

// import ERC777 Token .json files
import {default as GLD} from "../../../build/contracts/GLDToken.json";
import {default as DMD} from "../../../build/contracts/DMDToken.json";

// label will be displayed in Dapp.
// and you need to specify token addresses
GLD.label = "测试Token GLD"
GLD.address = "cfxtest:type.contract:ace59n3pj2ev5f1j3vdcfr39nm9kc8dgde1d83a384"

DMD.label = "测试Token DMD"
DMD.address = "cfxtest:type.contract:acg4kb024uwn2cr9682s5ar0yk7zx2vuja20bwrx46"

// specify TransferToken.json address
const routingContractAddress = "cfxtest:type.contract:accuzc2frpfwasccp1p342sj7ujrd02dyp5avd3znt"

// add supported token to options 
const options = [GLD, DMD]
```

### Run Dapp
#### Compiles and hot-reloads for development

```
npm run serve
```

#### Compiles and minifies for production

```
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
