import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// store 负责记录全局的变量 
// conflux confluxJS sdk 

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
    init(state, payload) {
      const { conflux, confluxJS, sdk } = payload;
      state.conflux = conflux;
      state.confluxJS = confluxJS;
      state.sdk = sdk;

      state.conflux.on("accountsChanged", (accounts) => {
        console.log("accounts changed");
        console.log(accounts)
        if (accounts.length === 0) {
          store.commit('resetAccount')
          store.commit('resetCfxBalance')
        } else {
          const account = accounts[0]
          store.commit('setAccount', {account})
          store.dispatch('updateCfxBalance')
        }
      })
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
    },
    async init(context, payload) {
      context.commit('init', payload);
    },
  }
})

export default store;