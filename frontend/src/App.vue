<template>
  <div id="app">
    <el-container style="height: 100%" >

      <el-header style="background: #409EFF"
      >
        <el-row class="full-height" type="flex" align="middle" justify="left">
          <el-col :span="6">
            <label class="white-font bold-font">Conflux ERC777 Token 批量转账</label>
          </el-col>
          <el-col :offset="9" :span="2">
            <el-tag :effect="tagTheme" :type="stateType" @click="showTxState" style="cursor: pointer">{{ txState }}</el-tag>
          </el-col>
          <el-col :span="3">
            <el-tooltip effect="light" content="请在 Conflux Portal 中切换网络">
              <el-tag>{{networkText}}</el-tag>
            </el-tooltip>
          </el-col>
          
          <el-col :span="4" v-if="!accountConnected" > 
            <el-button   class="full-width" round v-on:click="authorize">连接钱包</el-button>
          </el-col>
          <el-col :span="4" v-if="accountConnected">
              <el-button class="full-width" type="success" @click="showAccount">
                {{simplifiedAccount}}<i class="el-icon-check el-icon--right"></i>
              </el-button>
          </el-col>
        </el-row>
      </el-header>

      <el-main class="main-background">

        <el-row type="flex" justify="center">
          <el-col :span="20">
            <el-card shadow="hover">
              <el-row type="flex" >
                <el-col :span="7">代币选择</el-col>
                <el-col :span="11">
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
                <el-col :span="7">代币余额</el-col>
                <el-col :span="10">
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
          </el-col>
        </el-row>

        <el-row type="flex" justify="center">
          <el-col :span="20">
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
          </el-col>
        </el-row>
        <el-row type="flex" justify="center">
          <el-col :span="20">
            <history-transaction-panel
              v-bind:transactionList="transactionList"
              v-on:reset-transaction-list="resetTransactionList"
            ></history-transaction-panel>
          </el-col>
        </el-row>
      </el-main>

      <!-- <el-footer
      :style="stateBackgroundStyle"
      >
        <el-row type="flex" align="middle" class="full-height bold-font" >
          <el-tag :effect="tagTheme" type="info" class="bold-font">Transaction state </el-tag>
          <el-tag :effect="tagTheme" :type="stateType">{{ txState }}</el-tag>
          <el-tag :effect="tagTheme" v-if="stateMessage" type="info">{{ stateMessage }}</el-tag>
        </el-row>

      </el-footer> -->
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

      /*
        注意 下面这行的注释不能取消，否则会在执行await tx.confirmed() 的时候会报错  
          path="", [big.js] Invalid number
          错误由ConfluxSDK.format.fixed64抛出

          没有下面这行时会有vue warn， 不过并不影响运行
      */
      // sdk: null,

      // csv = {tos, vals} 为csv中提供的原始数据 其中vals单位为CFX
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

      DEBUG: process.env.NODE_ENV !== 'production'
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
    simplifiedAccount() {
      if (!this.account) {
        return null;
      }
      const prefix = this.account.substr(0,6)
      const tail = this.account.substr(this.account.length-4)
      return prefix + "..." + tail
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
          return this.txState;
      }
    },
    isFreeState() {
      return TxState.isFree(this.txState);
    },

    accountConnected() {
      return this.account !== null;
    },
  },
  watch: {
    transactionList(newVal) {
      localStorage.transactionList = JSON.stringify(newVal)
    }
  },
  mounted() {
    if (localStorage.transactionList) {
      this.transactionList = JSON.parse(localStorage.transactionList)
    }

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
    notifyTxState() {
      this.$notify({
        title: this.txState,
        // message: this.stateM,
        type: this.stateType,
        offset: 60,
        duration: 6000
      })
    },
    
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
    // showCfxBalance() {
    //   this.$alert(
    //     this.sdk.Drip(this.cfxBalance).toCFX(),
    //     '当前账户CFX余额',
    //     {
    //       showClose: false,
    //       showCancelButton: false,
    //       showConfirmButton: false,
    //       closeOnClickModal: true,
    //       closeOnPressEscape: true,
    //       callBack: ()=>{},
    //     }
    //   ).catch(()=>{
    //     // 点击框外触发
    //     // do nothing
    //   })
    // },
    showTxState() {
      this.$alert(
        this.stateMessage,
        '当前交易执行状态',
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
    // handleCommand(c) {
    //   switch (c) {
    //     case "showAccount":
    //       this.showAccount();
    //       break;
    //     case "showCfxBalance":
    //       this.showCfxBalance();
    //       break;
    //     default:
    //       break;
    //   }
    // },
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

        this.notifyTxState()
        let receipt =  await pendingTx.executed()
        this.txHash = receipt.transactionHash;
        this.txState = TxState.Executed;

        
        await this.updateTokenBalance();

        if (this.DEBUG){
          this.transactionList.push({
            hash: this.txHash,
            csv: this.csv,
            confirmDate: Date.now(),
            selectedToken: this.selectedToken,
            tokenAddress: this.contract.address,
          })
        }
        this.notifyTxState()
        receipt = await pendingTx.confirmed()

        if (!this.DEBUG){
          this.transactionList.push({
            hash: this.txHash,
            csv: this.csv,
            confirmDate: Date.now(),
            selectedToken: this.selectedToken,
            tokenAddress: this.contract.address,
          })
        }
        

        this.txHash = receipt.transactionHash;
        this.txState = TxState.Confirmed;
        this.notifyTxState()

        this.resetCsv()
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
          this.$alert(
            err.message,
            '交易执行错误'
          )
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
    },
    resetTransactionList() {
      this.transactionList = [];
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
  /* background: #E4E7ED; */
  background: #EBEEF5;
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
