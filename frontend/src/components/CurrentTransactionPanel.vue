<template>
  <el-card>
    <el-row slot="header">
      <el-col :span="12">
        <span>最新未确认交易状态</span>
      </el-col>
      <el-col :span="12">
        <el-tag :effect="tagTheme" :type="stateType" @click="$emit('show-tx-state')" style="cursor: pointer" size="mini">{{ txState }}</el-tag>
      </el-col>
    </el-row>
    <el-collapse>
      <history-transaction-line v-bind:transactionInfo="latestTransactionInfo"></history-transaction-line>
    </el-collapse>
  </el-card>
</template>
<script>
import HistoryTransactionLine from './HistoryTransactionLine.vue';

export default {
  components: { HistoryTransactionLine },
  name: 'CurrentTransactionPanel',
  // confirmDate is left out
  props: ['latestTransactionInfo', 'tagTheme', "stateType", "txState"],
  data() {
    return {
    }
  },
  methods: {
    
  },
  computed: {
    
  }
};
</script>

<style scoped></style>
