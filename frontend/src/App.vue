<template>
  <div id="app">
    <el-container style="height: 100%" >

      <el-header style="background: #409EFF"
      >
        <el-row class="full-height" type="flex" align="middle" justify="left">
          <el-col :span="6">
            <label class="white-font bold-font">{{ $t("message.title") }}</label>
          </el-col>
          
          <el-col :offset="7" :span="3">
            <el-tooltip :effect="effect" :content="$t('message.tooltip.networkTooltip')">
              <el-tag>{{networkText}}</el-tag>
            </el-tooltip>
          </el-col>
          
          <el-col :span="4" v-if="!accountConnected" > 
            <el-button   class="full-width" round v-on:click="authorize">{{ $t("message.connect") }}</el-button>
          </el-col>
          <el-col :span="4" v-if="accountConnected">
              <el-button class="full-width" type="success" @click="showAccount">
                {{simplifiedAccount}}<i class="el-icon-check el-icon--right"></i>
              </el-button>
          </el-col>
          <el-col :offset="0" :span="2" style="display: flex; justify-content: center;">
            <el-tooltip :effect="effect" :content="directSendingModeTooltip" placement="bottom">
              <el-switch
                v-model="directSendingMode"
                inactive-color="#13ce66"
                active-color="#ff4949"
                class="mode-switch"
                >
              </el-switch>
            </el-tooltip>
          </el-col>
          <el-col :span="2" style="display: flex; justify-content: center;">
            <el-dropdown @command="handleLangCommand" class="full-width">
              <div class="el-dropdown-link full-width bold-font" style="color: white;">
                {{ localeText }}<i class="el-icon-arrow-down el-icon--right"></i>
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                <el-dropdown-item command="en">en</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
      </el-header>

      <el-dialog
        :visible.sync="accountDialogVisible"
        :title="$t('message.currentAccountAddress')"
        width="45%"
        :show-close="false"
      >
        <el-row>
          <span>
            <el-link :href="scanAccountUrl" type="primary" target="_blank"
              >{{ account }} <i class="el-icon-top-right el-icon--right"></i
            ></el-link>
          </span>
        </el-row>
      </el-dialog>

      <el-dialog
        :visible.sync="installationDialogVisible"
        :title="$t('message.error.installationError')"
        :close-on-click-modal="false"
        width="45%"
        :show-close="false"
      >
        <el-row class="no-break">
          {{$t('message.tooltip.portal.beg')}}<el-link href="https://portal.confluxnetwork.org/" type="primary" target="_blank">ConfluxPortal<i class="el-icon-top-right el-icon--right"></i></el-link>{{$t('message.tooltip.portal.end')}}
        </el-row>
      </el-dialog>

      <el-main class="main-background">
        <batch-sender></batch-sender>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { getScanUrl } from './utils'
import BatchSender from './components/BatchSender.vue';

export default {
  components: {
    BatchSender
  },
  name: "App",
  data() {
    return {
      accountDialogVisible: false,
      installationDialogVisible: false,
    };
  },
  computed: {
    directSendingMode: {
      get() {
        return this.$store.state.directSendingMode
      },
      set(val) {
        this.$store.commit('setDirectSendingMode', val)
      }
    },
    directSendingModeTooltip() {
      if (this.$store.state.directSendingMode) {
        return this.$t('message.tooltip.directSendingMode.modeOnTooltip')
      }
      return this.$t('message.tooltip.directSendingMode.modeOffTooltip')

    },
    scanAccountUrl() {
      return getScanUrl(this.account, 'address', this.chainId)
    },
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
      switch (this.conflux?.chainId) {
        case '0x405':
          return "Conflux Tethys";
        case '0x1':
          return "Conflux Testnet";
        case undefined:
          return "Portal Not Detected";
      }

      return "networkId: " + this.conflux?.chainId;
    },
    chainId() {
      return this.conflux?.chainId;
    },
    simplifiedAccount() {
      return this.$store.getters.simplifiedAccount
    },
    accountConnected() {
      return this.$store.state.account !== null;
    },
    localeText() {
      switch (this.$i18n.locale) {
        case "zh-CN":
          return "中文";
        default:
          return this.$i18n.locale;
      }
    },
    effect() {
      return this.$store.state.effect
    }
  },
  mounted() {
    // executed immediately after page is fully loaded
    this.$nextTick(function() {
      if (typeof window.conflux !== "undefined") {
        this.$store.dispatch('init', {
          conflux: window.conflux,
          confluxJS: window.confluxJS,
          sdk: window.ConfluxJSSDK
        })
      } else {
        this.installationDialogVisible = true
      }
      if (localStorage.locale) {
        this.$i18n.locale = localStorage.locale;
      }
    });
  },
  watch: {
    // 一般而言 网络环境变化时页面会进行自动刷新
    // 以防万一 这里在网络环境变化时重置当前选择的 Token
    chainId() {
      this.selectedToken = ""
    },
    // 当账户变化时关闭账户弹窗
    account(newVal) {
      if (!newVal) {
        this.accountDialogVisible = false
      }
    }
  },
  methods: {
    // 选择语言选项时触发的函数
    handleLangCommand(locale) {
      this.$i18n.locale = locale;
      localStorage.locale = locale;
    },
    async authorize() {
      try {
        await this.$store.dispatch('authorize')
      } catch (e) {
        this.processError(e)
      }
    },
    processError(err) {
      this.$alert(err.message, this.$t('message.error.error'));
    },
    showAccount() {
      this.accountDialogVisible = true;
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

.no-break {
  word-break: normal;
}

/* .mode-switch /deep/ .el-switch__core {
  align-items: center;
} */

.mode-switch {
  align-items: center;
}
</style>
