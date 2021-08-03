<template>
  <el-card>
    <el-row slot="header">
      <el-col :span="12">
        <span>{{$t('message.currentTransactionStatus')}}</span>
      </el-col>
      <el-col :span="12">
        <el-tag :effect="effect" :type="stateType" @click="$emit('show-tx-state')" style="cursor: pointer" size="mini">{{ txState }}</el-tag>
      </el-col>
    </el-row>
    <el-collapse>
      <transaction-line v-bind:transactionInfo="latestTransactionInfo"></transaction-line>
    </el-collapse>
  </el-card>
</template>
<script>
import TransactionLine from './TransactionLine.vue';

export default {
  components: { TransactionLine },
  name: 'CurrentTransactionPanel',
  props: ['latestTransactionInfo', "stateType", "txState"],
  data() {
    return {
    }
  },
  methods: {
    
  },
  computed: {
    effect() {
      return this.$store.state.effect
    }
  }
};
</script>

<style scoped></style>
