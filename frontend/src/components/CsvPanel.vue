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
        :disabled="!isFreeState"
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
import NP from 'number-precision'


export default {
  name: "CsvPanel",
  props: ['csv', 'isFreeState', 'csvError', 'networkVersion'],
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
            tos.push(this.sdk.format.address(addr, parseInt(this.networkVersion)));
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
      return NP.plus(...this.csv.vals)
    },
    length() {
      return this.csv.tos.length
    },
  }
};
</script>

<style scoped></style>
