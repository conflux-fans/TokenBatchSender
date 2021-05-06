<template>
  <div id="app">
    <!-- <img alt="Conflux logo" src="./assets/conflux.png" /> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <el-container style="height: 100%" direction="vertical">

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
            <!-- <el-button type="primary" v-on:click="authorize">ConfluxPortal 授权</el-button> -->

          </el-row>

          <!-- <el-row v-if="!existOldTokenBalance" type="flex">
            <el-col :span="2">账户代币余额</el-col>
            <el-col :span="5">{{ queryingTokenBalance }}</el-col>
          </el-row>
          <el-row v-if="existOldTokenBalance" type="flex">
            <el-col :span="2">账户代币余额</el-col>
            <el-col :span="5">（前： {{ oldTokenBalance }} =>）{{ queryingTokenBalance }}</el-col>
          </el-row> -->

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

        <el-card shadow="hover">
          <el-row type="flex">
            <el-upload
              class="upload-demo"
              drag
              action="/hello"
              :before-upload="handlePreview"
              v-if="!fileUploaded && !isCsvError"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将CSV文件拖到此处，或<em>点击上传</em>
              </div>
              <div class="el-upload__tip" slot="tip">只能解析csv格式文件</div>
              <div class="el-upload__tip" slot="tip">每行为一组数据，第一列为地址，第二列为转账代币数量（单位为e18）</div>
            </el-upload>
          </el-row>
          
          <el-row v-if="fileUploaded && !isCsvError">
            <el-table
              :data="tableData"
              height="283">
              <el-table-column fixed prop="address" label="转账地址(16进制)" width="400"></el-table-column>
              <el-table-column fixed prop="value" label="转账代币数量（e18）" width="300"></el-table-column>
            </el-table>
          </el-row>
          <el-row v-if="isCsvError">
              <div v-html="csvErrorMessage" style="color:red"></div>
          </el-row>
          <el-row v-if="isCsvError || fileUploaded" style="text-align: left">
            <el-button type="info" v-if="isCsvError || fileUploaded" @click="resetCSV" :disabled="!isFreeState" style="display: inline-block">重置CSV文件</el-button>
            <el-button type="danger" v-if="fileUploaded" @click="transfer" :disabled="!isFreeState" style="display: inline-block">批量转帐</el-button>
          </el-row>
            <!-- <el-button @click="testMethod"> test </el-button> -->

        </el-card>
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
import Web3 from "web3";

export default {
  name: "App",
  // components: {
  //   HelloWorld
  // }
  data() {
    return {
      conflux: null,
      account: null,
      contract: null,
      // csv = {tos, vals} 为csv中提供的原始数据 其中vals 单位为1e18
      csv: null,
      tokenBalance: null,
      cfxBalance: null,
      // oldTokenBalance: null,
      config: null,
      txHash: null,
      txState: TxState.NoTask,
      errorMessage: "",
      errorType: "",
      errors: {
        csvError: null,
        transactionError: null,
        balanceError: null
      },
      tagTheme: "plain",
      routingContract: null,
      test: true,
      fixed: 4,
      // options 的初始值不会被使用， 而是在初始化时由config决定
      options: [
        {
          value: "GLDToken", // 该值与json文件中contractName一致
          label: "测试Token GLD",
        },
        {
          value: "选项2",
          label: "cEth",
          disabled: true,
        },
        {
          value: "DMDToken", // 该值与json文件中contractName一致
          label: "测试Token DMD",
        },
      ],
      selectedToken: "",
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
    // computed may lead to 'undefined' bug ?
    networkVersion() {
      // console.log(this.conflux)
      // console.log(this.conflux.networkVersion)
      // console.log(this.conflux.chainId)
      return this.conflux.networkVersion;
    },
    fileUploaded() {
      return this.csv !== null;
    },
    queryingTokenBalance() {
      return this.tokenBalance === null ? "请连接钱包并选择代币种类" : this.sdk.Drip(this.tokenBalance).toCFX();
    },
    // existOldTokenBalance() {
    //   return this.oldTokenBalance !== null;
    // },
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
      // let style = "";
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
    tableData() {
      if (this.csv == null) return null
      const tmp = []
      for (let i = 0; i < this.csv.tos.length; i++) {
        tmp.push({
          address: this.csv.tos[i],
          value: this.csv.vals[i]
        });
      }
      return tmp;
    },
    accountConnected() {
      return this.account !== null;
    },
    isCsvError() {
      return this.errors['csvError']
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
          // disabled: !this.isValidAddressForNet(config[option].address)
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
    testMethod() {
      console.log('test')
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

        // if (isUpdate) {
        //   this.oldTokenBalance = this.tokenBalance;
        // } else {
        //   this.oldTokenBalance = null;
        // }
        if (!this.isValidAddressForNet(this.contract.address)) {
          throw new Error('Token contract address does not match network id ' + this.networkVersion)
        }
        const tokenBalance = (await this.contract.balanceOf(this.account)).toString();
        this.tokenBalance = tokenBalance;
        console.log("Account tokenBalance: ");
        
        console.log(tokenBalance);
      } catch (e) {
        e._type = "balanceError";
        throw e;
      }
    },
    async changeToken() {
      // on invoke, selectedToken has been changed
      console.log("Selected token changed to %s", this.selectedToken);
      // this.config[this.selectedToken]  { bytecode, abi, address }
      try {
        this.contract = this.confluxJS.Contract(this.config[this.selectedToken]);
        await this.updateTokenBalance();
      } catch (e) {

        this.processError(e)
      }
    },
    fromCfxToDrip(cfx) {
      return this.sdk.Drip.fromCFX(cfx).toString()
    },
    async transfer() {
      try {
        // 重新获取授权
        await this.authorize();
        // TODO: 检查合约地址是否与当前选择的网络匹配
        const data = this.web3.eth.abi.encodeParameters(
          ["address[]", "uint256[]"],
          [this.csv.tos, this.csv.vals.map(element => this.fromCfxToDrip(element))]
        );

        const tx = this.contract.send(
          this.routingContract,
          this.fromCfxToDrip(this.csv.vals.reduce((a, b) => a + b, 0)),
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

        let receipt =  await pendingTx.executed()
        this.txHash = receipt.transactionHash;
        this.txState = TxState.Executed;
        // this.txState = "Executed. Not confirmed yet. txHash: " + this.txHash;
        await this.updateTokenBalance();

        receipt = await pendingTx.confirmed()
        this.txHash = receipt.transactionHash;
        this.txState = TxState.Confirmed;
      } catch (err) {
        // console.log(err);
        // this.errorMessage = err.message;
        // this.txState = TxState.Error;
        err._type = 'transactionError'
        this.processError(err);
      }
    },
    processError(err) {
      console.log(err);
      console.log(err._type)
      // balanceError csvError transactionError
      switch (err._type) {
        case 'balanceError':
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
        case 'csvError': 
          this.errors[err._type] = err
          break;
        case 'transactionError':
          this.errors[err._type] = err
          this.txState = TxState.Error;
          break;
        default:
          // this.errorType =err._type;
          // this.errorMessage = err.message;
      }
      console.log(this.errors)
    },
    
    handlePreview(file) {
      // console.log(file);
      this.processCSV(file);
      // return false, then upload action will not be triggered
      return false;
    },
    getNetId(address) {
      try{
        return this.sdk.address.decodeCfxAddress(address).netId;
      } catch (e) {
        return 999999
      }
    },
    // 0x address (999999) can be used anywhere
    // mainnet (1029) address can be used in test net (1)
    isValidAddressForNet(accountAddress) {
      const id = this.getNetId(accountAddress);
      // console.log(id)
      // console.log(this.networkVersion)
      return parseInt(id) >= parseInt(this.networkVersion)
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

    async processCSV(file) {
      try {
        const c = await file.text();
        console.log(c);
        const rows = c.split("\n");
        let tos = [];
        let vals = [];

        let csv_msg = []

        for (let i = 0; i < rows.length; ++i) {
          const row = rows[i];
          const results = row.split(",");
          // sdk error message is confusing
          // tos.push(this.sdk.format.hexAddress(results[0].trim()));
          const addr = results[0].trim()
          const val = results[1].trim()

          if (!this.isValidAddressForNet(addr) || isNaN(val)) {
            csv_msg.push('CSV row ' + (i+1) + ' address/value is not valid: ' + row)
          } else {
            tos.push(this.sdk.format.hexAddress(addr));
            vals.push(parseFloat(val));
          }
        }

        if(csv_msg.length !== 0) {
          // console.log(csv_msg)
          const msg = csv_msg.join("<br>")
          // console.log(msg)
          // this.errorMessage = msg
          // this.csvError = msg
          const tmp = new Error(msg)
          tmp._type = "csvError"
          throw tmp
        }
        this.csv = {
          tos,
          vals,
        };
        console.log(this.csv);
      } catch (err) {
        this.processError(err);
      }
    },
    resetCSV() {
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
</style>
