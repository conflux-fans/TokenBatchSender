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
          <el-col  :offset="15" :span="4"  v-if="!accountConnected" > 
            <el-button   class="full-width" round v-on:click="authorize">连接钱包</el-button>
          </el-col>
          <el-col :offset="15" :span="2" v-if="accountConnected">
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
          <el-col :span="2" v-if="accountConnected" > 
            <el-button class="full-width" type="warning" v-on:click="authorize">重新连接</el-button>
          </el-col>
        </el-row>
      </el-header>

      <el-main style="background: #E4E7ED">

        <el-card shadow="hover">
          <el-row type="flex">
            <el-col :span="2">代币</el-col>
            <el-col :span="5">
              <el-select
                v-model="selectedToken"
                filterable
                placeholder="下拉选择或键入搜索"
                @change="changeToken"
                size="small"
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

          <el-row v-if="!existOldTokenBalance" type="flex">
            <el-col :span="2">账户代币余额</el-col>
            <el-col :span="5">{{ queryingTokenBalance }}</el-col>
          </el-row>
          <el-row v-if="existOldTokenBalance" type="flex">
            <el-col :span="2">账户代币余额</el-col>
            <el-col :span="5">（前： {{ oldTokenBalance }} =>）{{ queryingTokenBalance }}</el-col>
          </el-row>
        </el-card>

        <el-card shadow="hover">
          <el-row type="flex">
            <el-upload
              class="upload-demo"
              drag
              action="/hello"
              :before-upload="handlePreview"
              v-if="fileUploaded"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将CSV文件拖到此处，或<em>点击上传</em>
              </div>
              <div class="el-upload__tip" slot="tip">只能解析csv格式文件</div>
              <div class="el-upload__tip" slot="tip">每行为一组数据，第一列为地址，第二列为转账代币数量</div>
            </el-upload>
          </el-row>
          
          <el-row v-if="!fileUploaded">
            <el-table
              :data="tableData"
              height="283">
              <el-table-column fixed prop="address" label="转账地址" width="400"></el-table-column>
              <el-table-column fixed prop="value" label="转账代币数量" width="150"></el-table-column>
            </el-table>
          </el-row>
          <el-row v-if="!fileUploaded" style="text-align: left">
            <el-button type="info" @click="resetCSV" :disabled="!isFreeState" style="display: inline-block">重置CSV文件</el-button>
            <el-button type="danger" @click="transfer" :disabled="!isFreeState" style="display: inline-block">批量转帐</el-button>
          </el-row>
            <!-- <el-button @click="testMethod"> test </el-button> -->

        </el-card>
      </el-main>

      <el-footer
      :style="stateBackgroundStyle"
      >
        <el-row type="flex" align="middle" class="full-height bold-font" >
          <el-tag :effect="tagTheme" type="info" class="bold-font">Running state </el-tag>
          <el-tag :effect="tagTheme" :type="stateType">{{ state }}</el-tag>
          <el-tag :effect="tagTheme" type="info">{{ stateMessage }}</el-tag>
        </el-row>

      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { config, routingContractAddress } from "./contracts/contracts-config";
import TxState from "./enums/tx-state";
import Web3 from "web3";
// import { parse } from '@fast-csv/parse'

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
      csv: null,
      tokenBalance: null,
      cfxBalance: null,
      oldTokenBalance: null,
      config: null,
      txHash: null,
      state: TxState.NoTask,
      errorMessage: "",
      // stateColorCss: "background: red",
      // stateType: "danger",
      tagTheme: "plain",
      routingContract: null,
        // "cfxtest:type.contract:accuzc2frpfwasccp1p342sj7ujrd02dyp5avd3znt",
        // "cfxtest:type.contract:acg57vxa3dr801u8vuc0tytmk5ye7wgzeaj72r8gjc", // origin contract
      test: true,
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
    fileUploaded() {
      return this.csv === null;
    },
    queryingTokenBalance() {
      return this.tokenBalance === null ? "请连接钱包并选择代币种类" : this.tokenBalance;
    },
    existOldTokenBalance() {
      return this.oldTokenBalance !== null;
    },
    stateBackgroundStyle() {
      let style = "background: ";
      switch (this.state) {
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
      switch (this.state) {
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
      switch (this.state) {
        case TxState.Error:
          return TxState.Error + ":" + this.errorMessage;
        case TxState.Executed:
          return (
            TxState.Executed +
            ", Not Confirmed yet. TransactionHash: " +
            this.txHash
          );
        default:
          return this.state;
      }
    },
    isFreeState() {
      return TxState.isFree(this.state);
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
    }
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
      }
    });
  },
  methods: {
    initTokenOptions(config) {
      const tmp = []
      Object.keys(config).forEach((key) => {
        // console.log(key);
        tmp.push({
          value: key,
          label: config[key].label,
          disabled: config[key].disabled
        })
      })
      this.options = tmp;
    },
    authorize: async function() {
      // if (this.conflux === null) {
      //   if (typeof window.conflux !== "undefined") {
      //     this.conflux = window.conflux;
      //     // this.contract = window.confluxJS.Contract({ abi, bytecode });
      //     // this.contract.address = 'CFXTEST:TYPE.CONTRACT:ACFD3KZZZ4R408USNP0TWD4WG5PNPF7VPJC71GVYFW'
      //     // this.contract.address = this.tokenContract;
      //   } else {
      //     window.alert("未安装portal插件！");
      //     return;
      //   }
      //   window.alert("problem");
      // }
      // assert()
      // window.alert('portal detected')
      const accounts = await this.conflux.enable();
      this.account = accounts[0];
      this.updateTokenBalance(false);
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
      // this.$alert(
      //   this.account.toString(),
      //   '当前账户',
      //   {
      //     // confirmButtonText: '确定',
      //     // callback: action => {
      //     //   this.$message({
      //     //     type: 'info',
      //     //     message: `action: ${ action }`
      //     //   });
      //     // }
      //     showClose: 'false',
      //     showCancelButton: 'false',
      //     showConfirmButton: 'false'
      //   }
      // )
    },
    // isUpdate set to false if invoked to init
    updateTokenBalance: async function(isUpdate) {
      // console.log(this.account)
      if (!this.account) {
        return;
      }
      this.cfxBalance = (await this.confluxJS.getBalance(this.account)).toString();

      if (!this.contract) {
        return;
      }

      if (isUpdate) {
        this.oldTokenBalance = this.tokenBalance;
      } else {
        this.oldTokenBalance = null;
      }
      const tokenBalance = await this.contract.balanceOf(this.account);
      this.tokenBalance = tokenBalance;
      console.log("Account tokenBalance: ");
      
      console.log(tokenBalance);
    },
    async changeToken() {
      // on invoke, selectedToken has been changed
      console.log("Selected token changed to %s", this.selectedToken);
      this.contract = this.confluxJS.Contract(this.config[this.selectedToken]);
      // if (this.account) {
      //   this.tokenBalance = await this.contract.balanceOf(this.account);
      // }
      this.updateTokenBalance(false);
    },
    transfer: async function() {
      // 重新获取授权
      await this.authorize();
      const data = this.web3.eth.abi.encodeParameters(
        ["address[]", "uint256[]"],
        [this.csv.tos, this.csv.vals]
      );

      const tx = this.contract.send(
        this.routingContract,
        this.csv.vals.reduce((a, b) => a + b, 0),
        this.hexStringToArrayBuffer(data)
      );
      try {
        const estimate = await tx.estimateGasAndCollateral({
          from: this.account,
        });
        // wrong sdk usage
        // const estimate1 = await this.confluxJS.estimateGasAndCollateral({
        //   from: this.account,
        // });
        console.log(estimate);
        // console.log(estimate1);

        const pendingTx = tx.sendTransaction({
          from: this.account,
          value: 0,
          gasPrice: 100,
          gas: estimate.gasLimit,
          // gas: estimate.gasUsed,
          // gas: 67812
          // gas: 70666
        });

        await pendingTx;
        this.state = TxState.Pending;

        let receipt =  await pendingTx.executed()
        this.txHash = receipt.transactionHash;
        this.state = TxState.Executed;
        // this.state = "Executed. Not confirmed yet. txHash: " + this.txHash;
        this.updateTokenBalance(true);

        receipt = await pendingTx.confirmed()
        this.txHash = receipt.transactionHash;
        this.state = TxState.Confirmed;
      } catch (err) {
        console.log(err);
        this.errorMessage = err.message;
        this.state = TxState.Error;
      }
    },
    
    handlePreview(file) {
      console.log(file);
      this.processCSV(file);
      // return false, then upload action will not be triggered
      return false;
    },
    // tool function
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
      const c = await file.text();
      console.log(c);
      const rows = c.split("\n");
      let tos = [];
      let vals = [];
      rows.forEach(function(row) {
        console.log(row);
        const results = row.split(",");
        tos.push(results[0].trim());
        vals.push(parseInt(results[1].trim()));
      });
      this.csv = {
        tos,
        vals,
      };
      console.log(this.csv);
    },
    resetCSV() {
      this.csv = null;
      this.state = TxState.NoTask;
    },
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

.full-height {
  height: 100%;
  /* align: middle; */
}

.full-width {
  width: 100%;
}

.bold-font {
  font-weight: bold;
}

.white-font {
  color: white;
}
</style>
