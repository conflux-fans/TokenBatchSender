<template>
  <el-card shadow="hover">
    <el-row type="flex">
      <el-upload
        class="upload-demo full-width"
        drag
        action="/hello"
        :before-upload="handlePreview"
        v-if="!fileUploaded && !isCsvError"
      >
        <!-- <i class="el-icon-upload2" style="font-size: 8em"></i> -->
        <i class="el-icon-upload" style="font-size: 8em"></i>
        <div class="el-upload__text">
          {{$t('message.tooltip.csv.drag')}}<em>{{$t('message.tooltip.csv.clickToUpload')}}</em>
        </div>
        <el-row slot="tip" type="flex" justify="space-between">
          <el-col :span=6>{{$t('message.tooltip.csv.resolve')}}</el-col>
          <el-col :span=6 >
            <div class="right-align">
              <el-link href="./example.csv" type="info" target="_blank"
                >{{$t('message.tooltip.csv.checkExample')}}<i class="el-icon-notebook-1"></i
              ></el-link>
            </div>
          </el-col>
        </el-row>
        <div class="el-upload__tip" slot="tip">
          <el-row>
            {{$t('message.tooltip.csv.format')}}
          </el-row>
          <el-row>
            {{$t('message.tooltip.csv.titleLine')}}
          </el-row>
          <el-row>
            {{$t('message.tooltip.csv.big')}}
          </el-row>
          <el-row v-if="!directSendingMode">
            {{$t('message.tooltip.csv.compat')}}
          </el-row>
        </div>
      </el-upload>
    </el-row>
    <el-row v-if="fileUploaded && !isCsvError && !isProcessing" type="flex" justify="left">
      <el-col :span="6">
          <div>{{ $t('message.transferSum') }}: {{amountSum}}</div>
        </el-col>
        <el-col :span="6">
          <div>{{$t('message.transferCount')}}: {{length}}</div>
        </el-col>
    </el-row>

    <el-row v-if="fileUploaded && !isCsvError">
      <el-table :data="tableData" height="283" v-loading="!isFreeState || isProcessing" stripe>
        <el-table-column
          prop="address"
          :label="$t('message.address')"
          width="400"
        ></el-table-column>
        <el-table-column
          prop="value"
          :label="$t('message.tokenAmount')"
          width="300"
        ></el-table-column>
      </el-table>
    </el-row>
    <el-row v-if="isCsvError">
      <div style="color:red; height: 240px; overflow:scroll" class="bold-font">
        <ul>
          <li v-for="msg in csvErrorMessageList" v-bind:key="msg">{{ msg }}</li>
        </ul>
      </div>
    </el-row>
    <el-row v-if="isCsvError || fileUploaded" type="flex" align="middle" style="margin: 20px 0 0 0">
      <el-col :span=3>
        <el-button
          size="medium"
          type="info"
          v-if="isCsvError || fileUploaded"
          @click="resetCsv"
          :disabled="!isFreeState || isProcessing"
          >{{$t('message.command.resetCsv')}}</el-button
        >
      </el-col>
      <el-col :offset=2 :span=3 v-if="!directSendingMode">
        <el-tooltip :effect="effect" :content="disabledTooltip" placement="right" :disabled="Boolean(selectedToken) && Boolean(account)">
          <div>
            <el-button
              size="medium"
              type="danger"
              v-if="fileUploaded"
              @click="$emit('transfer')"
              :disabled="!isFreeState || !selectedToken || !account || isProcessing"
              >{{$t('message.command.send')}}</el-button
            >
          </div>
        </el-tooltip>
      </el-col>
      <el-col :offset=2 :span=3 v-if="directSendingMode">
        <el-tooltip :effect="effect" :content="disabledTooltip" placement="right" :disabled="Boolean(selectedToken)">
          <div>
            <el-button
              size="medium"
              type="danger"
              v-if="fileUploaded"
              @click="$emit('transfer-in-direct-sending-mode')"
              :disabled="!isFreeState || !selectedToken || !account || isProcessing || !!latestBatchResults.length"
              >{{$t('message.command.sendInDirectSendingMode')}}</el-button
            >
          </div>
        </el-tooltip>
      </el-col>
      <el-col :span=3 v-if="directSendingMode && !!(pendingResults.length + latestBatchResults.length)">
        <el-tooltip :effect="effect" :content="disabledTooltip" placement="right" :disabled="Boolean(selectedToken)">
          <div>
            <el-button
              size="medium"
              type="danger"
              v-if="fileUploaded"
              @click="$emit('resume-requests')"
              :disabled="!isFreeState || !selectedToken || !account || isProcessing"
              >{{$t('message.command.resumePendingRequestsInDirectSendingMode')}}</el-button
            >
          </div>
        </el-tooltip>
      </el-col>

      <el-col :offset=4 :span=2>
        Gas Price
        <el-tooltip :effect="effect" :content="$t('message.tooltip.gasPrice')">
          <i class="header-icon el-icon-info"></i>
        </el-tooltip>
      </el-col>
      <el-col :span=3>
        <el-input-number 
          controls-position="right"
          size="medium"
          v-model="childGasPrice"
          :step="5000"
          :disabled="!isFreeState || !selectedToken || !account || isProcessing"
        >  
        </el-input-number>
      </el-col>
    </el-row>
  </el-card>
</template>
<script>
import { ErrorType } from '../enums'
import { preciseSum } from '../utils'
import PromiseWorker from "promise-worker"
import Worker from '../worker/process-csv.worker'

export default {
  name: "CsvPanel",
  props: ['csv', 'isFreeState', 'csvError', 'chainId', 'selectedToken', 'transactionError', "pendingResults", "latestBatchResults", "gasPrice"],
  data() {
    return {
      isProcessing: false,
      childGasPrice: this.gasPrice
    };
  },
  watch: {
    childGasPrice(newVal) {
      // console.log(newVal)
      this.$emit("set-gas-price", newVal)
    }
  },
  methods: {
    // upload 组件在选择文件后会自动上传 本函数会在上传前调用并返回false 代表上传取消
    handlePreview(file) {
      this.isProcessing = true
      console.log(this.fileUploaded)
      this.processCSV(file);

      // return false, then upload action will not be triggered
      return false;
    },
    async processCSV(file) {
      try {
        let tmp = file.name.split(".")
        if (tmp.length > 1 && tmp[tmp.length - 1] !== "csv") {
          throw new Error(`Invalid file format: ${file.name}. Only .csv files are supported`)
        }
        const c = await file.text();

        let worker = new Worker()
        let promiseWorker = new PromiseWorker(worker);
        // let msg
        // console.log(c)
        // console.log(promiseWorker)

        let msg = await promiseWorker.postMessage({
          data: {
            text: c,
            chainId: this.chainId
          }
        })
        this.isProcessing = false
        
        this.$emit('set-csv', msg.csv)
        
      } catch (err) {
        this.isProcessing = false
        err._type = ErrorType.CsvError;
        this.$emit('process-error', err);
      }
    },
    resetCsv() {
      this.$emit('reset-csv');
    }
  },
  computed: {
    effect() {
      return this.$store.state.effect;
    },
    directSendingMode() {
      return this.$store.state.directSendingMode;
    },
    disabledTooltip() {
      if (!this.account) {
        return this.$t("message.warning.connectionWarning")
      }

      if(!this.selectedToken) {
        return this.$t("message.warning.tokenWarning")
      }
      return null
    },
    account() {
      return this.$store.state.account
    },
    sdk() {
      return this.$store.state.sdk
    },
    fileUploaded() {
      return this.csv !== null || this.isProcessing;
    },
    isCsvError() {
      return Boolean(this.csvError)
    },
    isTransactionError() {
      return Boolean(this.transactionError)
    },
    csvErrorMessageList() {
      return this.csvError.message.split('\n')
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
    amountSum() {
      if(this.csv?.vals) 
        return preciseSum(this.csv.vals)
      return null
    },
    length() {
      if(this.csv?.tos) 
        return this.csv.tos.length
      return null
    },
  }
};
</script>

<style scoped>
.upload-demo /deep/ .el-upload-dragger {
    width: 100%;
}
.upload-demo /deep/ .el-upload{
    width: 100%;
}
.el-upload__tip /deep/ .el-row {
  margin: 2px;
}

li {
  margin: 8px
}
</style>
