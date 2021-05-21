<template>
  <el-collapse-item>
    <!-- <template slot="title"> -->
      <el-row type="flex" slot="title" class="full-width">
        <el-col :span="6">
          <div>代币: {{selectedToken}}</div>
        </el-col>
        <el-col :span="6">
          <div>转账代币总数: {{amountSum}}</div>
        </el-col>
        <el-col :span="6">
          <div>转账条数: {{length}}</div>
        </el-col>
        <el-col :span="12" style="text-align:right">
          <div >{{formattedDate}} </div>
        </el-col>
      </el-row>
    <!-- </template> -->
    <!-- <el-row>
      <el-link icon="el-icon-top-right" :href="scanAddress" type="primary" target="_blank">在Scan查看</el-link>
    </el-row> -->
    <el-row>
      <span>交易哈希：<el-link :href="scanTransacationUrl" type="primary" target="_blank">{{hash}} <i class="el-icon-top-right el-icon--right"></i></el-link></span>
    </el-row>
    <el-row>
      代币合约地址
      <el-tooltip effect="light" content="原生代币对应地址为转账合约地址">
        <i class="header-icon el-icon-info"></i>
      </el-tooltip>：
      <el-link :href="scanContractUrl" type="primary" target="_blank">{{tokenAddress}} <i class="el-icon-top-right el-icon--right"></i></el-link>
      </el-row>

    <el-row>
      <el-table :data="tableData" height="283">
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
  </el-collapse-item>
</template>
<script>
import NP from 'number-precision'
import { getScanUrl } from '../utils/utils.js'

export default {
  name: "HistoryTransactionLine",
  props: ["transactionInfo"],
  data() {
    return {
    };
  },
  computed: {
    hash() {
      return this.transactionInfo.hash
    },
    csv() {
      return this.transactionInfo.csv
    },
    confirmDate() {
      return this.transactionInfo.confirmDate
    },
    selectedToken() {
      return this.transactionInfo.selectedToken
    },
    tokenAddress() {
      return this.transactionInfo.tokenAddress
    },
    networkVersion() {
      return this.transactionInfo.networkVersion
    },
    tableData() {
      if (this.csv == null) return null
      const tmp = [];
      for (let i = 0; i < this.csv.tos.length; i++) {
        tmp.push({
          address: this.csv.tos[i],
          value: this.csv.vals[i],
        });
      }
      return tmp;
    },
    amountSum() {
      if (this.csv == null) return null
      return NP.plus(...this.csv.vals)
    },
    length() {
      if (this.csv == null) return null
      return this.csv.tos.length
    },
    formattedDate() {
      if (!this.confirmDate) return ""
      var date = new Date(this.confirmDate + 8 * 3600 * 1000); // 增加8小时
      return date.toJSON().substr(0, 19).replace('T', ' ');
    },
    scanTransacationUrl() {
      return getScanUrl(this.hash, 'transaction', this.networkVersion)
    },
    scanContractUrl() {
      return getScanUrl(this.tokenAddress, 'address', this.networkVersion)
    }
  },
};
</script>

<style scoped></style>
