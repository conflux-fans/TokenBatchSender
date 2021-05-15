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
    <el-row>交易哈希：{{hash}}</el-row>
    <el-row>代币合约地址：{{tokenAddress}}</el-row>

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
          label="转账代币数量（CFX）"
          width="300"
        ></el-table-column>
      </el-table>
    </el-row>
  </el-collapse-item>
</template>
<script>
import NP from 'number-precision'

export default {
  name: "HistoryTransactionLine",
  props: ["transactionInfo"],
  data() {
    return {
      hash: this.transactionInfo.hash,
      csv: this.transactionInfo.csv,
      confirmDate: this.transactionInfo.confirmDate,
      selectedToken: this.transactionInfo.selectedToken,
      tokenAddress: this.transactionInfo.tokenAddress,
    };
  },
  computed: {
    tableData() {
      // if (csv == null) return null
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
      return NP.plus(...this.csv.vals)
    },
    length() {
      return this.csv.tos.length
    },
    formattedDate() {
      var date = new Date(this.confirmDate + 8 * 3600 * 1000); // 增加8小时
      return date.toJSON().substr(0, 19).replace('T', ' ');
  }
  },
};
</script>

<style scoped></style>
