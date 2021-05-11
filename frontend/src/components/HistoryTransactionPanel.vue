<template>
  <el-card v-if="transactionList.length">
    <div slot="header">
      <span>历史交易</span>
      <el-tooltip effect="light" content="本页未关闭时已确认的交易会被记录, 这些交易记录仅保存在用户本地">
        <i class="header-icon el-icon-info"></i>
      </el-tooltip>
      
      <el-popover
        placement="top"
        width="160"
        v-model="visible">
        <p>确定清空所有历史交易吗</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="visible = false">取消</el-button>
          <el-button type="danger" size="mini" @click="visible = false;$emit('reset-transaction-list')">确定</el-button>
        </div>
        <el-button style="float: right; padding: 3px 0" type="danger" slot="reference">清空历史交易</el-button>
      </el-popover>

      <!-- <el-button  style="float: right; padding: 3px 0" type="danger" @click="$emit('reset-transaction-list')">清空历史交易</el-button> -->
    </div>
    <el-collapse v-for="transactionInfo in reversedTransactionList"
        v-bind:key="transactionInfo.confirmDate">
        <history-transaction-line v-bind:transactionInfo="transactionInfo"></history-transaction-line>
    </el-collapse>
  </el-card>
</template>
<script>
import HistoryTransactionLine from './HistoryTransactionLine.vue';

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
      visible: false
    }
  },
  methods: {
    
  },
  computed: {
    reversedTransactionList() {
      return this.transactionList.slice().reverse();
    }
  }
};
</script>

<style scoped></style>
