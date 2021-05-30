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
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          {{$t('message.tooltip.csv.drag')}}<em>{{$t('message.tooltip.csv.clickToUpload')}}</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          <el-row>{{$t('message.tooltip.csv.resolve')}}</el-row>
          <el-row>
            {{$t('message.tooltip.csv.format')}}
          </el-row>
          <el-row>
            {{$t('message.tooltip.csv.titleLine')}}
          </el-row>
          <el-row>
            {{$t('message.tooltip.csv.big')}}
          </el-row>
          <el-row>
            {{$t('message.tooltip.csv.view')}}<a href="./example.csv">{{$t('message.tooltip.csv.exampleFile')}}</a>
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
      <el-button
        type="info"
        v-if="isCsvError || fileUploaded"
        @click="resetCsv"
        :disabled="!isFreeState"
        style="display: inline-block"
        >{{$t('message.command.resetCsv')}}</el-button
      >
      <el-button
        type="danger"
        v-if="fileUploaded"
        @click="$emit('transfer')"
        :disabled="!isFreeState || !selectedToken"
        style="display: inline-block"
        >{{$t('message.command.send')}}</el-button
      >
    </el-row>
    <!-- <el-button @click="testMethod"> test </el-button> -->
  </el-card>
</template>
<script>
import ErrorType from '../enums/error-type'
import NetworkType from '../enums/network-type'
// import NP from 'number-precision'
import { preciseSum } from '../utils/utils'
import Papa from 'papaparse'


export default {
  name: "CsvPanel",
  props: ['csv', 'isFreeState', 'csvError', 'networkVersion', 'selectedToken'],
  data() {
    return {
      // isLoading: false
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
      // this.isLoading = true
      this.processCSV(file);
      // this.isLoading = false

      // return false, then upload action will not be triggered
      return false;
    },
    async processCSV(file) {
      try {
        const c = await file.text();
        // console.log(c);
        const rows = Papa.parse(c).data
        console.log(rows)
        //c.split("\n");
        let tos = [];
        let vals = [];

        let csv_msg = []

        for (let i = 0; i < rows.length; ++i) {
          // const row = rows[i];
          
          const results = rows[i];
          // sdk error message is confusing
          // tos.push(this.sdk.format.hexAddress(results[0].trim()));
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
          // console.log(csv_msg)
          const msg = csv_msg.join("<br>")
          // console.log(msg)
          // this.errorMessage = msg
          // this.csvError = msg
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
      // if (this.csv.vals.length === 0) {
      //   return null
      // }
      return preciseSum(this.csv.vals)
      // return this.csv.vals.reduce((x,y) => NP.plus(x, y), 0)
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
