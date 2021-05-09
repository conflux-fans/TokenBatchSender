<template>
  <div>
    <el-row>
      <el-table :data="tableData" height="283">
        <el-table-column
          fixed
          prop="address"
          label="转账地址(16进制)"
          width="400"
        ></el-table-column>
        <el-table-column
          fixed
          prop="value"
          label="转账代币数量（e18）"
          width="300"
        ></el-table-column>
      </el-table>
    </el-row>
  </div>
</template>
<script>
// import { defineComponent } from '@vue/composition-api'

export default {
  name: "HistoryTransactionPanel",
  /*
    transactionInfo {
      hash,
      csv
    }
  */
  props: ["transactionInfo"],
  data() {
    return {
      hash: this.transactionInfo.hash,
      csv: this.transactionInfo.csv
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
  },
};
</script>

<style scoped></style>
