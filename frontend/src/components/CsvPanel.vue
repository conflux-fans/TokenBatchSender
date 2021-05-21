<template>
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
        <div class="el-upload__tip" slot="tip">
          每行为一组数据，第一列为地址，第二列为转账代币数量
        </div>
        <div class="el-upload__tip" slot="tip">
          不需要添加标题行，如果添加，标题行格式只能为 address, amount 
        </div>
        <div class="el-upload__tip" slot="tip">
          文件较大时请稍作等待
        </div>
        <div class="el-upload__tip" slot="tip">
          查看<a href="./example.csv">示例文件</a>
        </div>
      </el-upload>
    </el-row>
    <el-row v-if="fileUploaded && !isCsvError" type="flex" justify="left">
      <el-col :span="6">
          <div>转账代币总数: {{amountSum}}</div>
        </el-col>
        <el-col :span="6">
          <div>转账条数: {{length}}</div>
        </el-col>
    </el-row>

    <el-row v-if="fileUploaded && !isCsvError">
      <el-table :data="tableData" height="283" v-loading="!isFreeState">
        <el-table-column
          fixed
          prop="address"
          label="转账地址"
          width="400"
        ></el-table-column>
        <el-table-column
          fixed
          prop="value"
          label="转账代币数量"
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
        >重置CSV文件</el-button
      >
      <el-button
        type="danger"
        v-if="fileUploaded"
        @click="$emit('transfer')"
        :disabled="!isFreeState || !selectedToken"
        style="display: inline-block"
        >批量转帐</el-button
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
              throw new Error('列数不为2')
            }

            const addr = results[0].trim()
            const val = results[1].trim()

            if (i === 0) {
              if(addr === 'address' && val === 'amount') {
                continue
              }
            }

            if (!this.isValidAddressForNet(addr) || isNaN(val)) {
              throw new Error('address/value is not valid')
              // csv_msg.push('CSV row ' + (i+1) + ' address/value is not valid: ' + results)
            } else {
              tos.push(this.sdk.format.address(addr, parseInt(this.networkVersion)));
              vals.push(parseFloat(val));
            }
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

<style scoped></style>
