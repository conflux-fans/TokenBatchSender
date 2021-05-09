<template>
  <div id="app">
    <el-container style="height: 100%" >

      <el-header style="background: #409EFF"
      >
        <el-row class="full-height" type="flex" align="middle" justify="left">
          <el-col :span="6">
            <label class="white-font bold-font">Conflux ERC777 Token 批量转账</label>
          </el-col>
          <el-col  :offset="12" :span="3">
            <el-tooltip effect="light" content="请在 Conflux Portal 中切换网络">
              <el-tag  >{{networkText}}</el-tag>
            </el-tooltip>
          </el-col>
          <el-col :span="4"  v-if="!accountConnected" > 
            <el-button   class="full-width" round v-on:click="authorize">连接钱包</el-button>
          </el-col>
          <el-col :span="4" v-if="accountConnected">
            <el-dropdown class="full-width" @command="handleCommand">
              <el-button class="full-width" type="success">
                已连接<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="showAccount">{{account}}</el-dropdown-item>
                <el-dropdown-item command="showCfxBalance">CFX余额</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
          <!-- <el-col :span="2" v-if="accountConnected" > 
            <el-button class="full-width" type="warning" v-on:click="authorize">重新连接</el-button>
          </el-col> -->
        </el-row>
      </el-header>

      <!-- <el-aside width="200px">Aside</el-aside> -->
      <el-main class="main-background">
        <el-card shadow="hover">
          <el-row type="flex">
            <el-col :span="3">代币选择</el-col>
            <el-col :span="5">
              <el-select
                v-model="selectedToken"
                filterable
                placeholder="下拉选择或键入搜索"
                @change="changeToken"
                size="small"
                class="full-width"
                :disabled="!isFreeState"
              >
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.disabled"
                >
                </el-option>
              </el-select>
            </el-col>

          </el-row>

          <el-row type="flex">
            <el-col :span="3">代币余额（e18）</el-col>
            <el-col :span="4">
              <div class="full-width"> 
                {{ queryingTokenBalance }}
              </div>
            </el-col>
            <el-col :span="1">
              <el-tooltip v-if="tokenBalance" class="item" effect="dark" :content="tokenBalance" placement="right">
                <div class="right-align bold-font" >
                  <label class="main-background">
                  ...
                  </label>
                </div>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-card>

        <csv-panel 
          v-bind:csv="csv"
          v-bind:isFreeState="isFreeState"
          v-bind:networkVersion="networkVersion"
          v-bind:sdk="sdk"
          v-bind:csvError="errors['csvError']"
          v-on:process-error="processError"
          v-on:set-csv="setCsv"
          v-on:reset-csv="resetCsv"
          v-on:transfer="transfer"
        >
        </csv-panel>
        <history-transaction-panel
          v-bind:transactionList="transactionList"
        ></history-transaction-panel>
      </el-main>

      <el-footer
      :style="stateBackgroundStyle"
      >
        <el-row type="flex" align="middle" class="full-height bold-font" >
          <el-tag :effect="tagTheme" type="info" class="bold-font">Transaction state </el-tag>
          <el-tag :effect="tagTheme" :type="stateType">{{ txState }}</el-tag>
          <el-tag :effect="tagTheme" v-if="stateMessage" type="info">{{ stateMessage }}</el-tag>
        </el-row>

      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { config, routingContractAddress } from "./contracts/contracts-config";
import TxState from "./enums/tx-state";
import ErrorType from './enums/error-type'
import Web3 from "web3";
import CsvPanel from './components/CsvPanel.vue';
import HistoryTransactionPanel from './components/HistoryTransactionPanel.vue';

export default {
  components: {
    CsvPanel,
    HistoryTransactionPanel
  },
  name: "App",
  // components: {
  //   HelloWorld
  // }
  data() {
    return {
      conflux: null,
      sdk: null,

      // csv = {tos, vals} 为csv中提供的原始数据 其中vals单位为1e18
      csv: null,
      account: null,
      selectedToken: "",

      contract: null,
      tokenBalance: null,
      cfxBalance: null,

      txHash: null,
      txState: TxState.NoTask,
      transactionList: [],
      
      errors: {
        csvError: null,
        transactionError: null,
        balanceError: null
      },
      tagTheme: "plain",

      // options 的初始值不会被使用， 而是在初始化时由config决定
      options: [
        {
          value: "GLDToken", 
          label: "测试Token GLD",
        },
        {
          value: "选项2",
          label: "cEth",
          disabled: true,
        },
        {
          value: "DMDToken", 
          label: "测试Token DMD",
        },
      ],
      config: null,
      routingContract: null,
    };
  },
  computed: {
    csvErrorMessage() {
      return this.errors['csvError']?.message;
    },
    networkText() {
      switch (this.conflux?.networkVersion) {
        case '1029':
          return 'Conflux Tethys';
        case '1':
          return 'Conflux Testnet';
        case undefined:
          return 'Portal Not Detected';
      }

      return 'networkId: '+ this.conflux?.networkVersion;
    },
    networkVersion() {
      return this.conflux?.networkVersion;
    },
    queryingTokenBalance() {
      return this.tokenBalance === null ? "请连接钱包并选择代币种类" : this.sdk.Drip(this.tokenBalance).toCFX();
    },
    
    stateBackgroundStyle() {
      let style = "background: ";
      switch (this.txState) {
        case TxState.Error:
          return style + "#F56C6C";
        case TxState.Confirmed:
          return style + "#67C23A"
        case TxState.Executed:
        case TxState.Pending:
          return style + "#E6A23C"
        default:
          return this.style + "#909399";
      }
    },
    stateType() {
      switch (this.txState) {
        case TxState.Error:
          return 'danger';
        case TxState.Confirmed:
          return 'success'
        case TxState.Executed:
        case TxState.Pending:
          return 'warning'
        default:
          return "info";
      }
    },
    stateMessage() {
      switch (this.txState) {
        case TxState.Error:
          return TxState.Error + ":" + this.errors['transactionError'].message;
        case TxState.Executed:
          return (
            TxState.Executed +
            ", Not Confirmed yet. TransactionHash: " +
            this.txHash
          );
        default:
          return "";
      }
    },
    isFreeState() {
      return TxState.isFree(this.txState);
    },

    accountConnected() {
      return this.account !== null;
    },
  },
  mounted() {
    // executed immediately after page is fully loaded
    this.$nextTick(function() {
      if (typeof window.conflux !== "undefined") {
        this.conflux = window.conflux;
        this.confluxJS = window.confluxJS;
        this.sdk = window.ConfluxJSSDK;
        this.config = config;
        this.routingContract = routingContractAddress;
        this.web3 = new Web3();
        this.initTokenOptions(this.config);

        this.conflux.on("accountsChanged", (accounts) => {
          // console.log("accounts changed");
          if (accounts.length === 0) {
            this.account = null
            this.tokenBalance = null
          }
        })
      }
    });
  },
  methods: {
    
    initTokenOptions(config) {
      const tmp = []
      Object.keys(config).forEach((option) => {
        tmp.push({
          value: option,
          label: config[option].label,
          disabled: config[option].disabled
        })
      })
      this.options = tmp;
    },
    
    async authorize() {
      try {
        const accounts = await this.conflux.enable();
        this.account = accounts[0];
        await this.updateTokenBalance();
      } catch (e) {
        this.processError(e)
      }
    },
    showAccount() {
      this.$alert(
        this.account,
        '当前账户地址',
        {
          showClose: false,
          showCancelButton: false,
          showConfirmButton: false,
          closeOnClickModal: true,
          closeOnPressEscape: true,
          // callBack: ()=>{}
        }
      ).catch(()=>{
        // 点击框外触发
        // do nothing
      })
    },
    showCfxBalance() {
      this.$alert(
        this.sdk.Drip(this.cfxBalance).toCFX(),
        '当前账户CFX余额',
        {
          showClose: false,
          showCancelButton: false,
          showConfirmButton: false,
          closeOnClickModal: true,
          closeOnPressEscape: true,
          callBack: ()=>{},
        }
      ).catch(()=>{
        // 点击框外触发
        // do nothing
      })
    },
    handleCommand(c) {
      switch (c) {
        case "showAccount":
          this.showAccount();
          break;
        case "showCfxBalance":
          this.showCfxBalance();
          break;
        default:
          break;
      }
    },
    // TODO: error handling (network mismatch etc)
    async updateTokenBalance() {
      // console.log(this.account)
      try{
        if (!this.account) {
          return;
        }
        this.cfxBalance = (await this.confluxJS.getBalance(this.account)).toString();

        if (!this.contract) {
          return;
        }

        const tokenBalance = (await this.contract.balanceOf(this.account)).toString();
        this.tokenBalance = tokenBalance;
        console.log("Account tokenBalance: ");
        
        console.log(tokenBalance);
      } catch (e) {
        e._type = ErrorType.BalanceError;
        throw e;
      }
    },
    async changeToken() {
      console.log("Selected token changed to %s", this.selectedToken);
      try {
        this.contract = this.confluxJS.Contract(this.config[this.selectedToken]);
        await this.updateTokenBalance();
      } catch (e) {

        this.processError(e)
      }
    },
    fromCfxToDrip(cfx) {
      return this.sdk.Drip.fromCFX(cfx)
    },
    async transfer() {
      try {
        // 重新获取授权
        await this.authorize();
        const data = this.web3.eth.abi.encodeParameters(
          ["address[]", "uint256[]"],
          [this.csv.tos, this.csv.vals.map(element => this.fromCfxToDrip(element).toString())]
        );
        
        // 高精度 e.g.
        // 1.3+1.5+2.9+22.9 = 28.599999999999998
        let sum = 0n;
        for (let i = 0; i < this.csv.vals.length; ++i) {
          // console.log(this.csv.vals[i])
          sum += window.BigInt(this.fromCfxToDrip(this.csv.vals[i]))
        }
        console.log(sum.toString())

        const tx = this.contract.send(
          this.routingContract,
          // this.fromCfxToDrip(this.csv.vals.reduce((a, b) => a + b, 0)),
          sum.toString(),
          this.hexStringToArrayBuffer(data)
        );


        const estimate = await tx.estimateGasAndCollateral({
          from: this.account,
        });
        console.log(estimate);

        const pendingTx = tx.sendTransaction({
          from: this.account,
          value: 0,
          gasPrice: 1,
          gas: estimate.gasLimit,
        });

        // this step will ask user for authorization
        await pendingTx;
        this.txState = TxState.Pending;
        console.log("before execute")
        let receipt =  await pendingTx.executed()

        console.log("after execute")
        this.txHash = receipt.transactionHash;
        this.txState = TxState.Executed;

        this.transactionList.push({
          hash: this.txHash,
          csv: this.csv
        })
        // this.txState = "Executed. Not confirmed yet. txHash: " + this.txHash;
        console.log('before update')
        await this.updateTokenBalance();

        console.log('after update')

        // ! this line will incur an error
        // ! error message
        // ! not match any (path="", [big.js] Invalid number) or (path="", expected to be null, got 0xe666666666666666666666666666666666666666666666666666666666666665)
        receipt = await pendingTx.confirmed()

        this.txHash = receipt.transactionHash;
        this.txState = TxState.Confirmed;
      } catch (err) {
        err._type = ErrorType.TransactionError
        this.processError(err);
      }
    },
    processError(err) {
      console.log(err);
      console.log(err._type)
      // balanceError csvError transactionError
      switch (err._type) {
        case ErrorType.BalanceError:
          this.tokenBalance = null;
          this.cfxBalance = null;
          this.errors[err._type] = err
          // this.errorType =err._type;
          // this.errorMessage = err.message;
          this.$alert(
            err.message,
            '错误'
          )
          break;
        case ErrorType.CsvError: 
          this.errors[err._type] = err
          break;
        case ErrorType.TransactionError:
          this.errors[err._type] = err
          this.txState = TxState.Error;
          break;
        default:
          // this.errorType =err._type;
          // this.errorMessage = err.message;
      }
      // console.log(this.errors)
    },
    
    // util function
    hexStringToArrayBuffer(hexString) {
      // remove the leading 0x
      hexString = hexString.replace(/^0x/, "");

      // ensure even number of characters
      if (hexString.length % 2 != 0) {
        console.log(
          "WARNING: expecting an even number of characters in the hexString"
        );
      }

      // check for some non-hex characters
      var bad = hexString.match(/[G-Z\s]/i);
      if (bad) {
        console.log("WARNING: found non-hex characters", bad);
      }

      // split the string into pairs of octets
      var pairs = hexString.match(/[\dA-F]{2}/gi);

      // convert the octets to integers
      var integers = pairs.map(function(s) {
        return parseInt(s, 16);
      });

      var array = new Uint8Array(integers);
      // console.log(array);

      return array.buffer;
    },
    setCsv(csv) {
      this.csv = csv
    },
    resetCsv() {
      this.csv = null;
      this.errors['csvError'] = null
      // this.errorType = ""
      // this.txState = TxState.NoTask;
    },
    resetTokenBalance() {
      this.tokenBalance = null;
    }
  },
};
</script>

<style>
html,
body,
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  /* margin-top: 60px; */
  padding: 0px;
  margin: 0px;
  height: 100%
}

.main-background {
  background: #E4E7ED;
}

.full-height {
  height: 100%;
  /* align: middle; */
}

.full-width {
  width: 100%;
}

.right-align {
  text-align: right;
}

.center-align {
  text-align: center;
}

.bold-font {
  font-weight: bold;
}

.white-font {
  color: white;
}

.el-card {
  margin: 10px;
}
</style>
