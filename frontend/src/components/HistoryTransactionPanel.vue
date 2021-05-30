<template>
  <el-card v-if="transactionList.length">
    <div slot="header">
      <span>{{ $t('message.historyTransactions') }}</span>
      <el-tooltip effect="light" :content="$t('message.tooltip.historyTransactions')">
        <i class="header-icon el-icon-info"></i>
      </el-tooltip>
      
      <el-popover
        placement="top"
        width="160"
        v-model="visible">
        <p style="word-break: normal">{{ $t('message.warning.clearHistory') }}</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="visible = false">{{ $t('message.cancel') }}</el-button>
          <el-button type="danger" size="mini" @click="visible = false;$emit('reset-transaction-list')">{{ $t('message.ok') }}</el-button>
        </div>
        <el-button style="float: right; padding: 3px 0" type="danger" slot="reference">{{$t('message.command.clearHistory')}}</el-button>
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
