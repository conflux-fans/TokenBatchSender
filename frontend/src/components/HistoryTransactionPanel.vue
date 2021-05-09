<template>
  <el-card>
    <div slot="header">
      <span>历史交易</span>
      <el-button style="float: right; padding: 3px 0" type="text">展开</el-button>
    </div>
    <div v-for="(transactionInfo,index) in transactionList"
        v-bind:key="index">
        <history-transaction-line v-bind:transactionInfo="transactionInfo"></history-transaction-line>
      <!-- <el-row 
      >
        <el-table :data="tableData(transactionInfo.csv)" height="283">
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
      </el-row> -->
    </div>
  </el-card>
</template>
<script>
import HistoryTransactionLine from './HistoryTransactionLine.vue';
// import { defineComponent } from '@vue/composition-api'


export default {
  components: { HistoryTransactionLine },
  name: 'HistoryTransactionPanel',
  /*
    transaction {
      hash,
      csv
    }
  */
  props: ['transactionList'],
  data() {
    return {

    }
  },
  methods: {
    
  }
};
</script>

<style scoped></style>
