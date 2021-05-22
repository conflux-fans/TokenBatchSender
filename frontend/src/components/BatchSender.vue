<template>
  <div>
    <el-row type="flex" justify="center">
      <el-col :span="20">
        <el-card shadow="hover">
          <el-row v-if="!isNativeToken">
            <el-col :span="7">代币选择</el-col>
            <el-col :span="11">
              <el-select
                v-model="selectedToken"
                filterable
                placeholder="下拉选择或键入搜索"
                @change="changeToken"
                size="mini"
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
            <el-col :offset="1" :span="3">
              <el-button
                type="info"
                size="mini"
                :disabled="!isFreeState"
                @click="isNativeToken ^= 1"
              >
                切换至CFX转账
              </el-button>
            </el-col>
          </el-row>

          <el-row v-if="isNativeToken">
            <el-col :span="7">代币选择</el-col>
            <el-col :span="11"> 测试网CFX </el-col>
            <el-col :offset="1" :span="3">
              <el-button
                type="info"
                size="mini"
                :disabled="!isFreeState"
                @click="isNativeToken ^= 1"
              >
                切换至ERC777代币转账
              </el-button>
            </el-col>
          </el-row>

          <el-row type="flex">
            <el-col :span="7">代币余额</el-col>
            <el-col :span="10">
              <div class="full-width">
                {{ queryingBalance }}
              </div>
            </el-col>
            <el-col :span="1">
              <el-tooltip
                v-if="isNativeToken?cfxBalance:tokenBalance"
                class="item"
                effect="dark"
                :content="isNativeToken?cfxBalance:tokenBalance"
                placement="right"
              >
                <div class="right-align bold-font">
                  <label class="main-background"> ... </label>
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
          v-bind:csvError="errors['csvError']"
          v-bind:selectedToken="selectedToken"
          v-on:process-error="processError"
          v-on:set-csv="setCsv"
          v-on:reset-csv="resetCsv"
          v-on:transfer="transfer"
        >
        </csv-panel>
      </el-col>
    </el-row>
    <el-row type="flex" justify="center" v-if="!isFreeState">
    <!-- <el-row type="flex" justify="center" v-if="hasTask"> -->
      <el-col :span="20">
        <current-transaction-panel
          v-bind:latestTransactionInfo="latestTransactionInfo"
          v-bind:tagTheme="tagTheme"
          v-bind:stateType="stateType"
          v-bind:txState="txState"
          v-on:show-tx-state="showTxState"
        ></current-transaction-panel>
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
  </div>
</template>

<script>
import { config, routingContractConfig } from "../contracts/contracts-config";
import { hexStringToArrayBuffer } from "../utils/utils.js";
import TxState from "../enums/tx-state";
import ErrorType from "../enums/error-type";
import Web3 from "web3";
import CsvPanel from "./CsvPanel.vue";
import HistoryTransactionPanel from "./HistoryTransactionPanel.vue";
import CurrentTransactionPanel from "./CurrentTransactionPanel.vue";

export default {
  components: {
    CsvPanel,
    HistoryTransactionPanel,
    CurrentTransactionPanel,
  },
  name: "BatchSender",
  data() {
    return {
      // csv = {tos, vals} 为csv中提供的原始数据 其中vals单位为CFX
      csv: null,
      selectedToken: "",

      contract: null,
      tokenBalance: null,

      isNativeToken: false,

      txState: TxState.NoTask,
      transactionList: [],
      latestTransactionInfo: {
        hash: null,
        csv: null,
        selectedToken: null,
        tokenAddress: null,
        networkVersion: null,
        confirmDate: null,
        from: null,
        isNativeToken: null
      },

      errors: {
        csvError: null,
        transactionError: null,
        balanceError: null,
      },
      tagTheme: "dark",

      config: null,
      routingContract: null,

      DEBUG: process.env.NODE_ENV !== "production",
    };
  },
  computed: {
    account() {
      return this.$store.state.account;
    },
    conflux() {
      return this.$store.state.conflux;
    },
    confluxJS() {
      return this.$store.state.confluxJS;
    },
    sdk() {
      return this.$store.state.sdk;
    },
    cfxBalance() {
      return this.$store.state.cfxBalance;
    },
    csvErrorMessage() {
      return this.errors["csvError"]?.message;
    },
    networkVersion() {
      return this.conflux?.networkVersion;
    },
    queryingBalance() {
      if (this.isNativeToken) {
        return this.cfxBalance === null
          ? "请连接钱包"
          : this.sdk.Drip(this.cfxBalance).toCFX();
      }

      if (!this.account) {
        return "请连接钱包"
      }

      if(!this.selectedToken) {
        return "请选择代币种类"
      }

      // tokenBalance is updated using async function
      // check tokenBalance before presenting value
      return this.tokenBalance
        ? this.sdk.Drip(this.tokenBalance).toCFX()
        : "";
    },
    stateType() {
      switch (this.txState) {
        case TxState.Error:
          return "danger";
        case TxState.Confirmed:
          return "success";
        case TxState.Executed:
        case TxState.Pending:
          return "warning";
        default:
          return "info";
      }
    },
    stateMessage() {
      switch (this.txState) {
        case TxState.Error:
          return TxState.Error + ":" + this.errors["transactionError"].message;
        case TxState.Executed:
          return (
            TxState.Executed +
            ", Not Confirmed yet. TransactionHash: " +
            this.latestTransactionInfo.hash
          );
        default:
          return this.txState;
      }
    },
    isFreeState() {
      return TxState.isFree(this.txState);
    },

    hasTask() {
      return this.txState !== TxState.NoTask;
    },

    accountConnected() {
      return this.$store.state.account !== null;
    },
    options() {
      if (!config) {
        return [
          {
            label: null,
            value: null
          }
        ]
      }
      const tmp = [];
      Object.keys(config).forEach((option) => {
        tmp.push({
          value: option,
          label: config[option].label,
          // not strict equal
          disabled: this.$store.state.sdk?.address?.decodeCfxAddress(config[option].address)?.netId != this.$store.state.conflux?.networkVersion,
        });
      });
      // this.options = tmp;
      return tmp
    }
  },
  watch: {
    transactionList(newVal) {
      localStorage.transactionList = JSON.stringify(newVal);
    },
    account(newVal) {
      if(newVal) {
        // 异步操作
        this.updateTokenBalance()
      } else {
        this.resetBalance()
      }
    }
  },
  mounted() {
    if (localStorage.transactionList) {
      this.transactionList = JSON.parse(localStorage.transactionList);
    }

    // executed immediately after page is fully loaded
    this.$nextTick(function () {
      this.config = config;
      this.routingContract = window.confluxJS.Contract(routingContractConfig);
      this.web3 = new Web3();
    });
  },
  methods: {
    notifyTxState() {
      this.$notify({
        title: this.txState,
        // message: this.stateM,
        type: this.stateType,
        offset: 60,
        duration: 6000,
      });
    },
    async authorize() {
      try {
        await this.$store.dispatch("authorize");
        await this.updateTokenBalance();
      } catch (e) {
        this.processError(e);
      }
    },
    showTxState() {
      this.$alert(this.stateMessage, "当前交易执行状态", {
        showClose: false,
        showCancelButton: false,
        showConfirmButton: false,
        closeOnClickModal: true,
        closeOnPressEscape: true,
        callBack: () => {},
      }).catch(() => {
        // 点击框外触发
        // do nothing
      });
    },
    // TODO: error handling (network mismatch etc)
    async updateTokenBalance() {
      // console.log(this.account)
      try {
        if (!this.account || !this.contract) {
          return;
        }

        const tokenBalance = (
          await this.contract.balanceOf(this.account)
        ).toString();
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
        this.contract = this.confluxJS.Contract(
          this.config[this.selectedToken]
        );
        await this.updateTokenBalance();
      } catch (e) {
        this.processError(e);
      }
    },
    fromCfxToDrip(cfx) {
      return this.sdk.Drip.fromCFX(cfx);
    },
    async transfer() {
      this.resetLatestTransactionInfo();
      try {
        // 重新获取授权
        await this.authorize();
        this.latestTransactionInfo.from = this.account
        this.latestTransactionInfo.isNativeToken = this.isNativeToken

        const data = this.web3.eth.abi.encodeParameters(
          ["address[]", "uint256[]"],
          [
            this.csv.tos.map((addr) => this.sdk.format.hexAddress(addr)),
            this.csv.vals.map((element) =>
              this.fromCfxToDrip(element).toString()
            ),
          ]
        );

        // 高精度 e.g.
        // 1.3+1.5+2.9+22.9 = 28.599999999999998
        let sum = 0n;
        for (let i = 0; i < this.csv.vals.length; ++i) {
          // console.log(this.csv.vals[i])
          sum += window.BigInt(this.fromCfxToDrip(this.csv.vals[i]));
        }
        console.log(sum.toString());

        let pendingTx;
        this.latestTransactionInfo.csv = this.csv;
        this.latestTransactionInfo.networkVersion = this.networkVersion;

        if (!this.isNativeToken) {
          const tx = this.contract.send(
            this.routingContract.address,
            // this.fromCfxToDrip(this.csv.vals.reduce((a, b) => a + b, 0)),
            sum.toString(),
            hexStringToArrayBuffer(data)
          );

          const estimate = await tx.estimateGasAndCollateral({
            from: this.account,
          });
          console.log(estimate);

          pendingTx = tx.sendTransaction({
            from: this.account,
            value: 0,
            gasPrice: 1,
            gas: estimate.gasLimit,
          });

          this.latestTransactionInfo.selectedToken = this.selectedToken;
          this.latestTransactionInfo.tokenAddress = this.contract.address;
        } else {
          const tx = this.routingContract.distributeCfx(
            // this.fromCfxToDrip(this.csv.vals.reduce((a, b) => a + b, 0)),
            hexStringToArrayBuffer(data)
          );

          const estimate = await tx.estimateGasAndCollateral({
            from: this.account,
            value: sum.toString(),
          });
          console.log(estimate);

          pendingTx = tx.sendTransaction({
            from: this.account,
            value: sum.toString(),
            gasPrice: 1,
            gas: estimate.gasLimit,
          });

          this.latestTransactionInfo.selectedToken = "CFX";
          // 传 cfx 时下面这个字段不会展示，但暂且先保留
          this.latestTransactionInfo.tokenAddress = this.routingContract.address;
        }

        // this step will ask user for authorization
        await pendingTx;
        this.txState = TxState.Pending;

        this.notifyTxState();
        let receipt = await pendingTx.executed();
        this.latestTransactionInfo.hash = receipt.transactionHash;
        this.txState = TxState.Executed;

        await this.$store.dispatch("updateCfxBalance");
        await this.updateTokenBalance();

        // if (this.DEBUG){
        //   this.transactionList.push({
        //     hash: this.txHash,
        //     csv: this.csv,
        //     confirmDate: Date.now(),
        //     selectedToken: this.isNativeToken ? "原生CFX" : this.selectedToken,
        //     tokenAddress: this.isNativeToken ? this.routingContract.address : this.contract.address,
        //     networkVersion: this.networkVersion
        //   })
        // }
        this.notifyTxState();
        receipt = await pendingTx.confirmed();
        this.latestTransactionInfo.confirmDate = Date.now();

        // if (!this.DEBUG){
        // deep copy
        this.transactionList.push(
          JSON.parse(JSON.stringify(this.latestTransactionInfo))
        );
        // }

        this.txState = TxState.Confirmed;
        this.notifyTxState();

        this.resetCsv();
      } catch (err) {
        err._type = ErrorType.TransactionError;
        this.processError(err);
      }
    },
    processError(err) {
      console.log(err);
      console.log(err._type);
      // balanceError csvError transactionError
      switch (err._type) {
        case ErrorType.BalanceError:
          this.tokenBalance = null;
          this.$store.commit("resetCfxBalance");
          this.errors[err._type] = err;
          this.$alert(err.message, "错误");
          break;
        case ErrorType.CsvError:
          this.errors[err._type] = err;
          break;
        case ErrorType.TransactionError:
          this.errors[err._type] = err;
          this.txState = TxState.Error;
          this.$alert(err.message, "交易执行错误");
          break;
        default:
      }
      // console.log(this.errors)
    },
    setCsv(csv) {
      this.csv = csv;
    },
    resetCsv() {
      this.csv = null;
      this.errors[ErrorType.CsvError] = null;
    },
    resetBalance() {
      // this.$store.commit("resetCfxBalance");
      this.tokenBalance = null;
    },
    resetTransactionList() {
      this.transactionList = [];
    },
    resetLatestTransactionInfo() {
      this.latestTransactionInfo = {
        hash: null,
        csv: null,
        selectedToken: null,
        tokenAddress: null,
        networkVersion: null,
        confirmDate: null,
        from: null,
        isNativeToken: null
      };
    },
  },
};
</script>

<style scoped>

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
