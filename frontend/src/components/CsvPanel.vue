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
        </div>
      </el-upload>
    </el-row>
    <el-row v-if="fileUploaded && !isCsvError" type="flex" justify="left">
      <el-col :span="6">
          <div>{{ $t('message.transferSum') }}: {{amountSum}}</div>
        </el-col>
        <el-col :span="6">
          <div>{{$t('message.transferCount')}}: {{length}}</div>
        </el-col>
    </el-row>

    <el-row v-if="fileUploaded && !isCsvError">
      <el-table :data="tableData" height="283" v-loading="!isFreeState" stripe>
        <el-table-column
          fixed
          prop="address"
          :label="$t('message.address')"
          width="400"
        ></el-table-column>
        <el-table-column
          fixed
          prop="value"
          :label="$t('message.tokenAmount')"
          width="300"
        ></el-table-column>
      </el-table>
    </el-row>
    <el-row v-if="isCsvError">
      <div v-html="csvErrorMessage" style="color:red"></div>
    </el-row>
    <el-row v-if="isCsvError || fileUploaded" style="text-align: left">
      <el-col :span=3>
        <el-button
          size="medium"
          type="info"
          v-if="isCsvError || fileUploaded"
          @click="resetCsv"
          :disabled="!isFreeState"
          >{{$t('message.command.resetCsv')}}</el-button
        >
      </el-col>
      <el-col :offset=2 :span=3>
        <el-tooltip effect="light" :content="disabledTooltip" placement="right" :disabled="Boolean(selectedToken) && Boolean(account)">
          <div>
            <el-button
              size="medium"
              type="danger"
              v-if="fileUploaded"
              @click="$emit('transfer')"
              :disabled="!isFreeState || !selectedToken || !account"
              >{{$t('message.command.send')}}</el-button
            >
          </div>
        </el-tooltip>
      </el-col>
    </el-row>
  </el-card>
</template>
<script>
import { ErrorType, NetworkType } from '../enums'
import { preciseSum } from '../utils'
import Papa from 'papaparse'


export default {
  name: "CsvPanel",
  props: ['csv', 'isFreeState', 'csvError', 'networkVersion', 'selectedToken'],
  data() {
    return {
    };
  },
  methods: {
    netWorkType(address) {
      return NetworkType.fromNetId(this.getNetId(address))
    },
    getNetId(address) {
      if (this.sdk.address.hasNetworkPrefix(address)) {
        return this.sdk.address.decodeCfxAddress(address).netId;
      } else {
        // an invalid address will throw an error
        this.sdk.format.hexAddress(address)
        return -1
      }
    },
    isValidAddressForNet(accountAddress) {
      const id = this.getNetId(accountAddress);

      const accountType = this.netWorkType(accountAddress);
      const netType = NetworkType.fromNetId(parseInt(this.nerworkVersion));

      switch (netType) {
        case NetworkType.MainNet:
          return accountType === NetworkType.MainNet || accountType === NetworkType.NotSpecified
        case NetworkType.TestNet:
          // 可能为id不为1的测试网 / 本地网  
          if (accountType !== NetworkType.TestNet) {
            return true
          } else {
            return parseInt(id) === parseInt(this.networkVersion)
          }
        default:
          throw new Error('unexpected portal network id: ' + this.networkVersion)
      }
    },
    handlePreview(file) {
      this.processCSV(file);

      // return false, then upload action will not be triggered
      return false;
    },
    async processCSV(file) {
      try {
        const c = await file.text();
        const rows = Papa.parse(c).data
        console.log(rows)

        let tos = [];
        let vals = [];
        let csv_msg = []

        for (let i = 0; i < rows.length; ++i) {
          const results = rows[i];
          if (results.length === 1 && !results[0]) {
            continue
          }

          try {
            if (results.length !== 2) {
              throw new Error('column count is not 2')
            }

            const addr = results[0].trim()
            const val = results[1].trim()

            if (i === 0) {
              if(addr === 'address' && val === 'amount') {
                continue
              }
            }

            if (!this.isValidAddressForNet(addr)) {
              throw new Error('address is not valid')
            }
            if (isNaN(val)) {
              throw new Error('value is not valid')
            }

            tos.push(this.sdk.format.address(addr, parseInt(this.networkVersion)));
            vals.push(parseFloat(val));
            
          } catch (e) {
            csv_msg.push(`ERROR: CSV row ${i+1} - ${e.message}`)
          }
        }

        if(csv_msg.length !== 0) {
          const msg = csv_msg.join("<br>")
          const tmp = new Error(msg)
          throw tmp
        }
        this.$emit('set-csv', {
          tos,
          vals
        })
        
      } catch (err) {
        err._type = ErrorType.CsvError;
        this.$emit('process-error', err);
      }
    },
    resetCsv() {
      this.$emit('reset-csv');
    }
  },
  computed: {
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
      return this.csv !== null;
    },
    isCsvError() {
      return Boolean(this.csvError)
    },
    csvErrorMessage() {
      return this.csvError.message
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
      return preciseSum(this.csv.vals)
    },
    length() {
      return this.csv.tos.length
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
</style>
