import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// store 负责记录全局的变量 
// conflux confluxJS sdk 

// 异步的维护工作在 App.vue 中进行
// account 和 balance

// store 不处理错误
const store = new Vuex.Store({
  state: {
    conflux: null,
    account: null,
    cfxBalance: null,
    confluxJS: null
  },
  getters: {
    simplifiedAccount: state => {
      if (!state.account) {
        return null;
      }
      const prefix = state.account.substr(0, 6)
      const tail = state.account.substr(state.account.length-4)
      return prefix + "..." + tail
    },
  },
  // mutations 只能为同步事务 异步操作在 actions 内完成
  mutations: {
    // increment(state) {
    //   state.count++
    // }
    init(state, payload) {
      const { conflux, confluxJS, sdk } = payload;
      state.conflux = conflux;
      state.confluxJS = confluxJS;
      state.sdk = sdk;
    },
    setAccount(state, payload) {
      state.account = payload.account
    },
    resetAccount(state) {
      state.account = null
    },
    setCfxBalance(state, payload) {
      state.cfxBalance = payload.cfxBalance
    },
    resetCfxBalance(state) {
      state.cfxBalance = null
    },
  },
  actions: {
    async authorize(context) {
      const accounts = await context.state.conflux.enable();
      context.commit('setAccount', { 
        account: accounts[0]
      })
      await context.dispatch('updateCfxBalance')
    },
    async updateCfxBalance(context) {
      const cfxBalance = (await context.state.confluxJS.getBalance(context.state.account)).toString()
      context.commit('setCfxBalance', {cfxBalance})
    }
  }
})

export default store;