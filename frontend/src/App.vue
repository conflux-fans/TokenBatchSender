<template>
  <div id="app">
    <el-container style="height: 100%" >

      <el-header style="background: #409EFF"
      >
        <el-row class="full-height" type="flex" align="middle" justify="left">
          <el-col :span="6">
            <label class="white-font bold-font">Conflux 批量转账</label>
          </el-col>
          <!-- <el-col :offset="9" :span="2">
            <el-tag :effect="tagTheme" :type="stateType" @click="showTxState" style="cursor: pointer">{{ txState }}</el-tag>
          </el-col> -->
          <el-col :offset="11" :span="3">
            <el-tooltip effect="light" content="请在 Conflux Portal 中切换网络">
              <el-tag>{{networkText}}</el-tag>
            </el-tooltip>
          </el-col>
          
          <el-col :span="4" v-if="!accountConnected" > 
            <el-button   class="full-width" round v-on:click="authorize">连接钱包</el-button>
          </el-col>
          <el-col :span="4" v-if="accountConnected">
              <el-button class="full-width" type="success" @click="showAccount">
                {{simplifiedAccount}}<i class="el-icon-check el-icon--right"></i>
              </el-button>
          </el-col>
        </el-row>
      </el-header>

      <el-main class="main-background">
        <batch-sender></batch-sender>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { getScanHtml } from './utils/utils.js'
import BatchSender from './components/BatchSender.vue';

export default {
  components: {
    BatchSender
  },
  name: "App",
  data() {
    return {
      // DEBUG: process.env.NODE_ENV !== 'production'
    };
  },
  computed: {
    account() {
      return this.$store.state.account
    },
    conflux() {
      return this.$store.state.conflux
    },
    confluxJS() {
      return this.$store.state.confluxJS
    },
    sdk() {
      return this.$store.state.sdk
    },
    cfxBalance() {
      return this.$store.state.cfxBalance
    },
    networkText() {
      switch (this.conflux?.networkVersion) {
        case '1029':
          return 'Conflux Tethys';
        case '1':
          return 'Conflux Testnet';
        case undefined:
          return 'Portal Not Detected';
      }

      return 'networkId: '+ this.conflux?.networkVersion;
    },
    networkVersion() {
      return this.conflux?.networkVersion;
    },
    simplifiedAccount() {
      return this.$store.getters.simplifiedAccount
    },
    accountConnected() {
      return this.$store.state.account !== null;
    },
  },
  mounted() {
    // executed immediately after page is fully loaded
    this.$nextTick(function() {
      if (typeof window.conflux !== "undefined") {
        this.$store.commit('init', {
          conflux: window.conflux,
          confluxJS: window.confluxJS,
          sdk: window.ConfluxJSSDK
        })
      }
    });
  },
  watch: {
    networkVersion() {
      this.selectedToken = ""
    }
  },
  methods: {
    async authorize() {
      try {
        await this.$store.dispatch('authorize')
      } catch (e) {
        this.processError(e)
      }
    },
    processError(err) {
      this.$alert(err.message, "错误");
    },
    showAccount() {
      this.$alert(
        this.account + '<br>' + getScanHtml(this.account, "address", this.networkVersion, "在 ConfluxScan 上查看"),
        '当前账户地址',
        {
          showClose: false,
          showCancelButton: false,
          showConfirmButton: false,
          closeOnClickModal: true,
          closeOnPressEscape: true,
          dangerouslyUseHTMLString: true
          // callBack: ()=>{}
        }
      ).catch(()=>{
        // 点击框外触发
        // do nothing
      })
    },
  },
};
</script>

<style>
html,
body,
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  /* margin-top: 60px; */
  padding: 0px;
  margin: 0px;
  height: 100%
}

.main-background {
  /* background: #E4E7ED; */
  background: #EBEEF5;
}

.full-height {
  height: 100%;
  /* align: middle; */
}

.full-width {
  width: 100%;
}

.right-align {
  text-align: right;
}

.center-align {
  text-align: center;
}

.bold-font {
  font-weight: bold;
}

.white-font {
  color: white;
}

.el-card {
  margin: 10px;
}
</style>
