<template>
  <el-collapse-item>
    <!-- <template slot="title"> -->
      <el-row type="flex" slot="title" class="full-width">
        <el-col :span="6">
          <div>{{$t('message.token')}}: {{selectedToken}}</div>
        </el-col>
        <el-col :span="6">
          <div>{{$t('message.transferSum')}}: {{amountSum}}</div>
        </el-col>
        <el-col :span="4">
          <div>{{$t('message.transferCount')}}: {{length}}</div>
        </el-col>
        <el-col :span="8" style="text-align:right">
          <div >{{formattedDate}} </div>
        </el-col>
      </el-row>
    <el-row v-if="transactionInfo.hash">
      <span>{{$t('message.transactionHash')}}：<el-link :href="scanTransacationUrl" type="primary" target="_blank">{{hash}} <i class="el-icon-top-right el-icon--right"></i></el-link></span>
    </el-row>
    <el-row>
      {{$t('message.sender')}}:
      <el-link :href="scanFromUrl" type="primary" target="_blank">{{from}} <i class="el-icon-top-right el-icon--right"></i></el-link>
    </el-row>
    <el-row v-if="!isNativeToken">
      {{$t('message.tokenContractAddress')}}:
      <el-link :href="scanContractUrl" type="primary" target="_blank">{{tokenAddress}} <i class="el-icon-top-right el-icon--right"></i></el-link>
    </el-row>

    <el-row>
      <el-table :data="tableData" height="283" stripe>
        <el-table-column
          fixed
          prop="address"
          :label="$t('message.address')"
          width="400"
        ></el-table-column>
        <el-table-column
          fixed
          prop="value"
          :label="$t('message.tokenAmount')"
          width="100"
        ></el-table-column>
        <el-table-column
          v-if="transactionInfo.hashesForDirectMode"
          fixed
          prop="hash"
          label="hash"
          width="300"
        ></el-table-column>
      </el-table>
    </el-row>
  </el-collapse-item>
</template>
<script>
import { getScanUrl, preciseSum } from '../utils'

export default {
  name: "TransactionLine",
  props: ["transactionInfo"],
  data() {
    return {
    };
  },
  computed: {
    // a normal transaction has hash field,
    // while in direct sending mode, transaction is actually composed of several transactions,
    // which has hashesForDirectMode field
    hash() {
      return this.transactionInfo.hash
    },
    // hashesForDirectMode() {
    //   return this.transactionInfo.hashesForDirectMode
    // },
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
    chainId() {
      // 兼容性操作
      return this.transactionInfo.chainId || this.transactionInfo.networkVersion
    },
    from() {
      return this.transactionInfo.from
    },
    isNativeToken() {
      return this.transactionInfo.selectedToken === 'CFX'
    },
    tableData() {
      if (this.csv == null) return null
      const tmp = [];
      for (let i = 0; i < this.csv.tos.length; i++) {
        if (this.transactionInfo.hashesForDirectMode && i < this.transactionInfo.hashesForDirectMode.length) {
          tmp.push({
            address: this.csv.tos[i],
            value: this.csv.vals[i],
            hash: this.transactionInfo.hashesForDirectMode[i]
          });
        } else {
          tmp.push({
            address: this.csv.tos[i],
            value: this.csv.vals[i],
            hash: null
          });
        }
      }
      return tmp;
    },
    amountSum() {
      if (this.csv == null) return null
      return preciseSum(this.csv.vals)
    },
    length() {
      if (this.csv == null) return null
      return this.csv.tos.length
    },
    formattedDate() {
      // +UTC8 -480
      const tzOffset = new Date().getTimezoneOffset()

      if (!this.confirmDate) return ""
      var date = new Date(this.confirmDate - tzOffset * 60 * 1000); // 对应时区调整显示时间
      return date.toJSON().substr(0, 19).replace('T', ' ');
    },
    scanTransacationUrl() {
      return getScanUrl(this.hash, 'transaction', this.chainId)
    },
    scanContractUrl() {
      return getScanUrl(this.tokenAddress, 'address', this.chainId)
    },
    scanFromUrl() {
      return getScanUrl(this.from, 'address', this.chainId)
    }
  },
};
</script>

<style scoped></style>
