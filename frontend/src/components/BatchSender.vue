<template>
  <div>
    <el-row type="flex" justify="center">
      <el-col :span="20">
        <el-card shadow="hover">
          <el-row class="bold-font">
            <el-col :span="5">{{ $t("message.token") }}</el-col>
            <el-col :offset="2" :span="11">
              {{ $t("message.tokenBalance") }} <i class="el-icon-refresh-right" style="cursor: pointer" @click="refreshBalance"></i>
            </el-col>
            <el-col :offset="2" :span="2">
              {{ $t("message.decimals") }}
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row type="flex">
            <el-col :span="5">

              <el-select
                v-model="selectedToken"
                filterable
                :placeholder="$t('message.selectText')"
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
            <el-col :offset="2" :span="10">
              <div class="full-width">
                {{ queryingBalance }}
              </div>
            </el-col>
            <el-col :span="1">
              <el-tooltip
                v-if="isNativeToken ? cfxBalance : tokenBalance"
                class="item"
                :effect="effect"
                :content="isNativeToken ? cfxBalance : tokenBalance"
                placement="bottom-end"
              >
                <div class="right-align bold-font">
                  <label class="main-background"> ... </label>
                </div>
              </el-tooltip>
            </el-col>
            <el-col :offset="2" :span="2">
              {{ decimals }}
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
          v-bind:chainId="chainId"
          v-bind:csvError="errors['csvError']"
          v-bind:transactionError="errors['transactionError']"
          v-bind:selectedToken="selectedToken"
          v-bind:pendingResults="pendingResults"
          v-on:process-error="processError"
          v-on:set-csv="setCsv"
          v-on:reset-csv="resetCsv"
          v-on:transfer="transfer"
          v-on:transfer-in-direct-sending-mode="transferInDirectSendingMode"
          v-on:resume-requests="openResumeDialog"
        >
        </csv-panel>
      </el-col>
    </el-row>
    <el-row type="flex" justify="center" v-if="!isFreeState || Boolean(errors['transactionError'])">
      <el-col :span="20">
        <current-transaction-panel
          v-bind:latestTransactionInfo="latestTransactionInfo"
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
    <el-dialog
      :visible.sync="txStateDialogVisible"
      :title="$t('message.currentTransactionStatus')"
      width="45%"
      :show-close="false"
    >
      <el-row class="no-break">
        {{ stateMessage }}
      </el-row>
    </el-dialog>
    <el-dialog
      :visible.sync="directSendingDiaglogVisible"
      :title="$t('message.command.sendInDirectSendingMode')"
      width="45%"
    >
      <div>
        <el-row>
          <el-col :span=12>
            <el-button
              @click="doTransferUsingBatch(0)"
              type="danger"
            >{{$t('message.command.sendInDirectSendingMode')}}</el-button>
          </el-col>
        </el-row>
      </div>
      <el-card>
        <el-tag type="danger">{{$t('message.tooltip.directSendingMode.warning')}}</el-tag>
        <ul>
          <li>
            {{$t('message.tooltip.directSendingMode.atomic')}}
          </li>
          <li>
            {{$t('message.tooltip.directSendingMode.secret')}}
          </li>
          <li>
            {{$t('message.tooltip.directSendingMode.error')}}
          </li>
        </ul>
      </el-card>
    </el-dialog>
    <el-dialog
      :visible.sync="resumeDialogVisible"
      :title="$t('message.command.doResume')"
      width="45%"
    >
      <div>
        <el-row> {{ $t('message.tooltip.doResume.progress', { 'last': pendingResults.length }) }} </el-row>
        <el-row>
          <el-col :span=12>
            <el-button
              @click="doResume"
              type="danger"
            >{{$t('message.command.doResume')}}</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- <el-card>
        <el-tag type="danger">{{$t('message.tooltip.doResume.warning')}}</el-tag>
        <ul>
          <li>
            {{$t('message.tooltip.doResume.forbids')}}
          </li>
        </ul>
      </el-card> -->
    </el-dialog>
  </div>
</template>

<script>
import { tokenConfig, routingContractConfig, sponsorContractConfig } from "../contracts-config";
import { hexStringToArrayBuffer, preciseSum, moveDecimal, executed, confirmed, BatchRequesterWrapper} from "../utils";
import { TxState, ErrorType } from "../enums";
import Web3 from "web3";
import CsvPanel from "./CsvPanel.vue";
import HistoryTransactionPanel from "./HistoryTransactionPanel.vue";
import CurrentTransactionPanel from "./CurrentTransactionPanel.vue";
import PromiseWorker from "promise-worker"
// import { default as sdk } from 'js-conflux-sdk'
import Worker from '../worker/requests.worker'
import { BATCHLIMIT, GlobalDefaultGasPrice } from "../utils/const"

const BigInt = window.BigInt

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
      decimals: "18",

      contract: null,
      tokenBalance: null,

      txState: TxState.NoTask,
      transactionList: [],
      latestTransactionInfo: {
        hash: null,
        hashesForDirectMode: null,
        csv: null,
        selectedToken: null,
        tokenAddress: null,
        chainId: null,
        confirmDate: null,
        from: null,
      },

      errors: {
        csvError: null,
        transactionError: null,
        balanceError: null,
      },

      txStateDialogVisible: false,
      directSendingDiaglogVisible: false,
      resumeDialogVisible: false,

      tmpConflux: null,
      // tmpAccount: null,

      pendingResults: [],
    };
  },
  computed: {
    effect() {
      return this.$store.state.effect;
    },
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
    privateKey() {
      return this.$store.state.privateKey;
    },
    // keystore() {
    //   return this.$store.state.privateKey;
    // },
    cfxBalance() {
      return this.$store.state.cfxBalance;
    },
    csvErrorMessage() {
      return this.errors["csvError"]?.message;
    },
    chainId() {
      return this.conflux?.chainId;
    },
    isNativeToken() {
      return this.selectedToken === "CFX";
    },
    queryingBalance() {
      if (this.isNativeToken) {
        return this.cfxBalance === null
          ? this.$t("message.warning.connectionWarning")
          : this.fromDripToCfxWithDecimals(this.cfxBalance);
      }

      if (!this.account) {
        return this.$t("message.warning.connectionWarning");
      }

      if (!this.selectedToken) {
        return this.$t("message.warning.tokenWarning");
      }

      // tokenBalance is updated using async function
      // check tokenBalance before presenting value
      return this.tokenBalance
        ? this.fromDripToCfxWithDecimals(this.tokenBalance)
        : this.$t("message.onRequest");
    },
    routingContract() {
      if (!this.confluxJS) return null;
      return this.confluxJS.Contract(
        routingContractConfig[parseInt(this.chainId)]
      );
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
          return TxState.Error + ":" + this.errors['transactionError'].message;
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
    accountConnected() {
      return this.$store.state.account !== null;
    },
    options() {
      const tmp = [
        {
          label: "CFX",
          value: "CFX",
        },
      ];
      if (!tokenConfig) {
        return tmp;
      }
      Object.keys(tokenConfig).forEach((option) => {
        // not strict equal
        if (
          this.$store.state.sdk?.address?.decodeCfxAddress(
            tokenConfig[option].address
          )?.netId == this.$store.state.conflux?.chainId
        ) {
          tmp.push({
            value: option,
            label: tokenConfig[option].label,
          });
        }
      });
      return tmp;
    },
  },
  watch: {
    transactionList(newVal) {
      localStorage.transactionList = JSON.stringify(newVal);
    },
    async account(newVal) {
      if (newVal) {
        // 异步操作
        await this.updateTokenBalance();
      } else {
        this.resetBalance();
      }
    },
    async selectedToken(newVal) {
      console.log("Selected token changed to %s", newVal);

      if (newVal === "CFX") {
        this.contract = null;
        this.decimals = 18;
        return;
      }

      try {
        this.contract = this.confluxJS.Contract(tokenConfig[newVal]);
        this.tokenBalance = null;
        await Promise.all([this.updateDecimals(), this.updateTokenBalance()]);
      } catch (e) {
        this.processError(e);
      }
    },
  },
  mounted() {
    this.fetchTransactionList();

    // executed immediately after page is fully loaded
    this.$nextTick(function () {
      this.web3 = new Web3();
    });
  },
  methods: {
    openResumeDialog() {
      this.resumeDialogVisible = true
    },
    fetchTransactionList() {
      if (localStorage.transactionList) {
        this.transactionList = JSON.parse(localStorage.transactionList);
      } else {
        this.transactionList = [];
      }
    },
    notifyTxState(message = null) {
      this.$notify({
        title: this.txState,
        type: this.stateType,
        offset: 60,
        duration: 6000,
        message
      });
    },
    async authorize() {
      try {
        // 下面两个步骤有先后关系 不能使用Promise.all
        await this.$store.dispatch("authorize");
        await this.updateTokenBalance();
      } catch (e) {
        this.processError(e);
      }
    },
    showTxState() {
      this.txStateDialogVisible = true;
    },
    async updateDecimals() {
      try {
        if (!this.contract) {
          return;
        }
        this.decimals = this.$t("message.onRequest");
        const decimals = (await this.contract.decimals()).toString();
        this.decimals = decimals;
      } catch (e) {
        // 事实上 decimals() 接口为可选的实现项，因此需要考虑未实现decimals()的情况
        e._type = ErrorType.BalanceError;
        throw e;
      }
    },
    async updateTokenBalance() {
      try {
        if (!this.account || !this.contract) {
          return;
        }

        const tokenBalance = (
          await this.contract.balanceOf(this.account)
        ).toString();
        this.tokenBalance = tokenBalance;
      } catch (e) {
        e._type = ErrorType.BalanceError;
        throw e;
      }
    },
    async refreshBalance() {
      if (!this.account) return
      try {
        await Promise.all([
          this.$store.dispatch("updateCfxBalance"),
          this.updateTokenBalance(),
        ]);
        this.$notify({
          title: this.$t("message.tooltip.balanceRefreshed"),
          type: "success",
          offset: 60,
          duration: 6000
        });
      } catch (e) {
        this.processError(e)
      }
    },
    fromDripToCfxWithDecimals(drip) {
      // e.g. decimals = 6, deltaDecimal = 12
      // then 1e18 token drip will be viewd as 1*10^1 token
      const deltaDecimal = 18 - this.decimals;
      return moveDecimal(this.sdk.Drip(drip).toCFX().toString(), deltaDecimal);
    },
    fromCfxToDripWithDecimals(cfx) {
      // e.g. decimals = 6, deltaDecimal = 12
      // then 1 token is actually 1e6 drip,
      const deltaDecimal = 18 - this.decimals;
      return this.sdk.Drip.fromCFX(moveDecimal(cfx, -deltaDecimal)).toString();
    },
    async transfer() {
      this.resetLatestTransactionInfo();
      this.errors[ErrorType.TransactionError] = null
      try {
        // 重新获取授权
        await this.authorize();
        this.latestTransactionInfo.from = this.account;

        const data = this.web3.eth.abi.encodeParameters(
          ["address[]", "uint256[]"],
          [
            this.csv.tos.map((addr) => this.sdk.format.hexAddress(addr)),
            this.csv.vals.map((element) =>
              this.fromCfxToDripWithDecimals(element).toString()
            ),
          ]
        );

        // 高精度 e.g.
        // 1.3+1.5+2.9+22.9 = 28.599999999999998
        const sum = this.fromCfxToDripWithDecimals(preciseSum(this.csv.vals));

        let pendingTx;
        this.latestTransactionInfo.csv = this.csv;
        this.latestTransactionInfo.chainId = this.chainId;
        this.latestTransactionInfo.selectedToken = this.selectedToken;

        // 根据选择的Token是否是CFX构造交易
        if (!this.isNativeToken) {
          const tx = this.contract.send(
            this.routingContract.address,
            sum.toString(),
            hexStringToArrayBuffer(data)
          );

          const estimate = await tx.estimateGasAndCollateral({
            from: this.account,
          });

          pendingTx = tx.sendTransaction({
            from: this.account,
            value: 0,
            gasPrice: GlobalDefaultGasPrice,
            gas: estimate.gasLimit,
          });

          this.latestTransactionInfo.tokenAddress = this.contract.address;
        } else {
          const tx = this.routingContract.distributeCfx(
            hexStringToArrayBuffer(data)
          );

          const estimate = await tx.estimateGasAndCollateral({
            from: this.account,
            value: sum.toString(),
          });

          pendingTx = tx.sendTransaction({
            from: this.account,
            value: sum.toString(),
            gasPrice: GlobalDefaultGasPrice,
            gas: estimate.gasLimit,
          });

          // 传 cfx 时下面这个字段不会展示，但暂且先保留
          this.latestTransactionInfo.tokenAddress =
            this.routingContract.address;
        }

        // this step will ask user for authorization
        await pendingTx;
        this.txState = TxState.Pending;

        this.notifyTxState();
        let receipt = await pendingTx.executed();
        this.latestTransactionInfo.hash = receipt.transactionHash;
        this.txState = TxState.Executed;

        await Promise.all([
          this.$store.dispatch("updateCfxBalance"),
          this.updateTokenBalance(),
        ]);
        // await this.$store.dispatch("updateCfxBalance");
        // await this.updateTokenBalance();

        this.notifyTxState();
        receipt = await pendingTx.confirmed();
        this.latestTransactionInfo.confirmDate = Date.now();

        // 不排除用户会同时开多个窗口的可能，因此需要在更新前拉取一下
        // 这样可以最大程度避免多开窗口造成的历史交易记录丢失
        this.fetchTransactionList();
        // deep copy
        this.transactionList.push(
          JSON.parse(JSON.stringify(this.latestTransactionInfo))
        );

        this.txState = TxState.Confirmed;
        this.notifyTxState();

        this.resetCsv();
      } catch (err) {
        err._type = ErrorType.TransactionError;
        this.processError(err);
      }
    },
    async transferInDirectSendingMode() {
      this.directSendingDiaglogVisible = true
    },
    /**
     * 用batch进行estimate
     */
    async doBatchEstimate(start) {
      // console.log(start)
      let worker = new Worker();
      let promiseWorker = new PromiseWorker(worker);
      const estimateBatcher = this.tmpConflux.BatchRequest()
      for (let i = start; i < this.csv.tos.length; i+=1){
        if (!this.isNativeToken) {
          // let tx

          // 计算drip不一定是这段计算中最占用资源的部分
          // 但是我们只需要分担一部分计算任务给worker就能避免页面卡死
          const drip = await promiseWorker.postMessage({
            type: "getDrip",
            data: {
              cfx: this.csv.vals[i],
              decimals: this.decimals
            }
          })
          const tx = this.contract.send(
            this.csv.tos[i],
            drip,
            "0x0"
          )

          tx.from = this.account
          estimateBatcher.add(this.tmpConflux.cfx.estimateGasAndCollateral.request(tx))
        }
      }
      // 进行 batch estimate
      const wrapper = new BatchRequesterWrapper(estimateBatcher)
      let estimateResults = await wrapper.execute()
      // console.log(estimateResults)
      return estimateResults
    },
    /**
     * 构造raw交易 并返回gas与storage cost
     * 需要使用之前estimate的结果
     */
    async constructReqsAndGetGasCostUsingEstimateResults(estimateResults, start) {
      let gasCostSum = BigInt(0)
      let storageSum = BigInt(0)
      let requests = []

      let worker = new Worker();
      let promiseWorker = new PromiseWorker(worker);

      const epochNumber = await this.tmpConflux.getEpochNumber("latest_state")
      const initNonce = await this.tmpConflux.getNextNonce(this.account)
      
      for (let i = 0; i + start < this.csv.tos.length; i+=1){
        try {
          let tx
          if (this.isNativeToken) {
            tx = new this.sdk.Transaction({
              from: this.account,
              to: this.csv.tos[i+start],
              value: this.fromCfxToDripWithDecimals(this.csv.vals[i+start]),
              gas: 21000,
              gasPrice: GlobalDefaultGasPrice,
              epochHeight: epochNumber,
              chainId: parseInt(this.chainId),
              nonce: preciseSum([initNonce, i]),
              storageLimit: 0,
              data: null,
            })
            gasCostSum += BigInt(21000)
          } else {
            // construct data field
            tx = this.contract.send(
              this.csv.tos[i+start],
              this.fromCfxToDripWithDecimals(this.csv.vals[i+start]),
              "0x0"
            )
            // console.log(tx)
            const estimate = estimateResults[i]
            // console.log(estimate)
            tx.value = 0
            tx.gasPrice = GlobalDefaultGasPrice
            tx.gas = estimate.gasLimit
            tx.storageLimit = estimate.storageCollateralized
            tx.epochHeight = epochNumber
            tx.chainId = parseInt(this.chainId)
            tx.nonce = preciseSum([initNonce, i])
            
            gasCostSum += BigInt(estimate.gasLimit)
            storageSum += BigInt(estimate.storageCollateralized)
          }
          const serializedTx = await promiseWorker.postMessage({
            type: "sign",
            data: {
              txOptions: tx,
              privateKey: this.privateKey,
              chainId: parseInt(this.chainId)
            }
          })

          requests.push({
            method: "cfx_sendRawTransaction",
            params: [serializedTx]
          })
        } catch (err) {

          err.message = `Failed at estimation of ${i+start+1}th transaction: ${this.csv.vals[i+start]} ${this.selectedToken} to ${this.csv.tos[i+start]}\n` + err.message
          throw err
        }     
      }
      return { requests, gasCostSum, storageSum }
    },
    /**
     * 构造所有待发交易
     * workflow：
     * 1. 确认合约代付状态
     * 2. 使用 batch 进行估算合约的gas cost
     * 3. 使用 estimate 的结果构造所有请求，并签名
     * 4. 处理 gas 和 stoarage 的结果，判断用户需要支付的数目
     * returns
     * reqs 待发交易数组
     * userGasCost 用户需要支付的 gas 数，有代付时为0
     * userStorageCost 对应的storage limit， 有代付时为0
     */
    async constructReqsAndGetGasCost(start) {

      // 1. 确认合约代付状态

      let whitelisted = false
      let gasSponsorBalance = BigInt(0)
      let storageSponsorBalance = BigInt(0)

      // check if the account is sponsored
      const sponsorContract = this.confluxJS.Contract(sponsorContractConfig[parseInt(this.chainId)])
      whitelisted = this.isNativeToken ? false : await sponsorContract.isWhitelisted(this.contract.address, this.account)

      console.log(`account is whitelisted?: ${whitelisted}`)

      // 记录合约代付参数
      if (whitelisted) {
        gasSponsorBalance = BigInt((await sponsorContract.getSponsoredBalanceForGas(sponsorContract.address)).toString())
        storageSponsorBalance = BigInt((await sponsorContract.getSponsoredBalanceForCollateral(sponsorContract.address)).toString())
      }

      // 2. estimate 需要构造rpc请求 这里我们使用 batch 进行估算
      //    构造所有的estimate请求
      let estimateResults
      if (!this.isNativeToken) {
        // const wrapper = new BatchRequesterWrapper(estimateBatcher)
        estimateResults = await this.doBatchEstimate(start)
      }

      // 3. 使用estimate的结果 构造所有的请求
      //    签名用worker进行
      let { requests, gasCostSum, storageSum } = await this.constructReqsAndGetGasCostUsingEstimateResults(estimateResults, start)
      
      // 4. 处理 gas 和 stoarage
      // 当赞助余额不足以 cover 交易消耗时，我们认为赞助将不会被使用（虽然实际情况是消耗一部分赞助 另一部分由原本的账户承担）
      // 这样的处理接近实际情况并且能够回避一些危险的处理
      let userGasCost = gasCostSum, userStorageCost = storageSum
      // gasSponsorBalance: 10e-18
      // gasCost: 10e-9 
      if (whitelisted && gasSponsorBalance > gasCostSum*BigInt(GlobalDefaultGasPrice)) {
        userGasCost = 0
      }
      // 1024 byte => 1 CFX 
      if (whitelisted && storageSponsorBalance > storageSum*BigInt(10**18)/BigInt(1024)) {
        userStorageCost = 0
      }
      return { requests, userGasCost, userStorageCost }
    },
    /**
     * 直接转账模式
     * workflow
     * 1. 初始化相应参数
     * 2. 初步检查余额
     * 3. 构造交易
     * 4. 包含 gas 与 storage 检查余额
     * 5. 进行发送
     */
    async doTransferUsingBatch(start=0) {
      // let start = 0
      if (start === 0){
        this.resetLatestTransactionInfo();
      }
      this.errors[ErrorType.TransactionError] = null
      try {
        // 1. 初始化相应参数
        this.directSendingDiaglogVisible = false

        this.txState = TxState.Preparing

        switch(this.chainId) {
          case "0x1":
            this.tmpConflux = new this.sdk.Conflux({
              url: "https://test.confluxrpc.com",
              networkId: 1,
            })
            break;
          case "0x405":
            this.tmpConflux = new this.sdk.Conflux({
              url: "https://main.confluxrpc.com",
              networkId: 1029
            })
            break
          default:
            throw new Error("unexpected chainId: " + this.chainId)
        }

        // 2. 仅进行转账balance的检查
        // 虽然已经有对应的
        let tmpCfxBalance = null, tmpTokenBalance = null
        tmpCfxBalance = BigInt((await this.tmpConflux.getBalance(this.account)).toString())
        if (!this.isNativeToken) {
          tmpTokenBalance = BigInt((await this.contract.balanceOf(this.account)).toString())
        }

        let transferInDrip = BigInt(this.fromCfxToDripWithDecimals(preciseSum(this.csv.vals)))

        // firstly only check token balance (otherwise estimation will fail)
        if (this.isNativeToken) {
          if (tmpCfxBalance < transferInDrip) {
            throw new Error(`Not enough balance: ${tmpCfxBalance} balance in account. ${transferInDrip} needed`)
          }
        } else {
          if (tmpTokenBalance < transferInDrip) {
            throw new Error(`Not enough token balance: ${tmpTokenBalance} balance in account. ${transferInDrip} needed`)
          }
        }
        // 3. 初步检查完毕，进行构造交易
        const {requests, userGasCost, userStorageCost} = await this.constructReqsAndGetGasCost(start)
        
        // 4. 进行转账

        // 进行 gas 和 collateral 的检查
        // check token balance, gas cost and collateral 
        if (this.isNativeToken) {
          if (tmpCfxBalance < transferInDrip + userGasCost * BigInt(GlobalDefaultGasPrice)) {
            throw new Error(`Not enough balance: ${tmpCfxBalance} balance in account. ${transferInDrip} needed (including gas cost)`)
          }
        } else {
          if (tmpTokenBalance < transferInDrip) {
            throw new Error(`Not enough token balance: ${tmpTokenBalance} balance in account. ${transferInDrip}needed`)
          }
          if (tmpCfxBalance < userGasCost * BigInt(GlobalDefaultGasPrice) + userStorageCost*BigInt(10**18)/BigInt(2**10)) {
            throw new Error(`Not enough cfx to cover gas and collateral cost`)
          }
        }
        // check done

        // begin batch sending using requests from constructReqsAndGetGasCost()
        if (start === 0) {
          this.latestTransactionInfo.from = this.account
          this.latestTransactionInfo.csv = this.csv;
          this.latestTransactionInfo.chainId = this.chainId;
          this.latestTransactionInfo.selectedToken = this.selectedToken;
          this.latestTransactionInfo.hashesForDirectMode = new Array(this.csv.tos.length)
          if (!this.isNativeToken) {
            this.latestTransactionInfo.tokenAddress = this.contract.address
          }
        } else {
          // 一般来说 触发错误是操作者有意触发这种不正常的逻辑
          if (this.latestTransactionInfo.from !== this.account
            || this.latestTransactionInfo.chainId !== this.chainId
            || this.latestTransactionInfo.selectedToken !== this.selectedToken) {
              throw new Error("Resume info is not consistent with last sending info")
            }
        }
        

        this.txState = TxState.Pending

        if (start === 0) {
          this.pendingResults = []
        }
        let latestHash, i

        if (start > 0) {
          latestHash = this.pendingResults[start-1]
        }

        for (i = 0; i + start < this.csv.tos.length; i += BATCHLIMIT) {
          let tmpResults = await this.tmpConflux.provider.batch(requests.slice(i, i + BATCHLIMIT))
          // console.log(tmpResults)
          latestHash = tmpResults[tmpResults.length - 1]
          // console.log(`latestHash: ${latestHash}`)
          
          this.pendingResults = this.pendingResults.concat(tmpResults)

          await executed(this.tmpConflux, latestHash)

          // notify current progress
          if (i + start + BATCHLIMIT < this.csv.tos.length)
            this.notifyTxState(`${this.pendingResults.length} transactions have been executed`)
        }
        await Promise.all([
          this.$store.dispatch("updateCfxBalance"),
          this.updateTokenBalance(),
        ]);

        this.txState = TxState.Executed
        this.notifyTxState();
        this.latestTransactionInfo.hashesForDirectMode = this.pendingResults

        await confirmed(this.tmpConflux, latestHash)
        this.pendingResults = []
        this.latestTransactionInfo.confirmDate = Date.now();
        this.fetchTransactionList()
        this.transactionList.push(
          JSON.parse(JSON.stringify(this.latestTransactionInfo))
        );
        this.txState = TxState.Confirmed
        this.notifyTxState();
      } catch (err) {
        err._type = ErrorType.TransactionError
        this.latestTransactionInfo.hashesForDirectMode = this.pendingResults
        this.processError(err)
      }
    },
    // 续发功能
    async doResume() {
      this.errors[ErrorType.TransactionError] = null
      try {
        this.txState = TxState.Preparing
        this.resumeDialogVisible = false
        // nonce for latest_state

        if (this.pendingResults.length > 0) {
          const latestHash = this.pendingResults[this.pendingResults.length - 1]
          await executed(this.tmpConflux, latestHash)
        }

        await this.doTransferUsingBatch(this.pendingResults.length)
      } catch (err) {
        err._type = ErrorType.TransactionError
        this.processError(err)
      }
    },
    processError(err) {
      console.error(err);
      console.error(err._type);
      // balanceError csvError transactionError
      switch (err._type) {
        case ErrorType.BalanceError:
          this.tokenBalance = null;
          this.$store.commit("resetCfxBalance");
          this.errors[err._type] = err;
          this.$alert(err.message, this.$t("message.error.error"));
          break;
        case ErrorType.CsvError:
          this.errors[err._type] = err;
          break;
        case ErrorType.TransactionError:
          this.errors[err._type] = err;
          this.txState = TxState.Error;
          this.$alert(err.message, this.$t("message.error.transactionError"));
          break;
        default:
          this.$alert(err.message, this.$t("message.error.error"));
      }
    },
    setCsv(csv) {
      this.csv = csv;
    },
    resetCsv() {
      this.csv = null;
      this.pendingResults = []
      this.errors[ErrorType.CsvError] = null;
    },
    resetBalance() {
      this.tokenBalance = null;
    },
    resetTransactionList() {
      this.transactionList = [];
    },
    resetLatestTransactionInfo() {
      this.latestTransactionInfo = {
        hash: null,
        hashesForDirectMode: null,
        csv: null,
        selectedToken: null,
        tokenAddress: null,
        chainId: null,
        confirmDate: null,
        from: null,
      };
    },
  },
};
</script>

<style scoped>
</style>
