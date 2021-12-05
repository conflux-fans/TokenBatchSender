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
    // the address of the account
    account: null,
    cfxBalance: null,
    confluxJS: null,
    effect: 'light',
    directSendingMode: false,
    keystore: null,
    privateKey: null
  },
  getters: {
    simplifiedAccount: state => {
      if (!state.account) {
        return null;
      }
      const index = state.account.indexOf(":")
      const prefix = state.account.substr(0, index+4)
      const tail = state.account.substr(state.account.length-4)
      return prefix + "..." + tail
    },
  },
  // mutations 只能为同步事务 异步操作在 actions 内完成
  mutations: {
    init(state, payload) {
      const { conflux, confluxJS, sdk, directSendingMode } = payload;
      state.conflux = conflux;
      state.confluxJS = confluxJS;
      state.sdk = sdk;
      state.directSendingMode = directSendingMode

      if (!state.directSendingMode) {
        state.conflux.on("accountsChanged", (accounts) => {
          console.log("accounts changed");
          console.log(accounts)
          if (accounts.length === 0) {
            store.commit('resetAccount')
          } else {
            const account = accounts[0]
            store.commit('setAccount', {account})
            store.dispatch('updateCfxBalance')
          }
        })
      }
      
    },
    setAccount(state, payload) {
      state.account = payload.account
    },
    resetAccount(state) {
      state.account = null
      state.cfxBalance = null
      state.keystore = null
      state.privateKey = null
    },
    setCfxBalance(state, payload) {
      state.cfxBalance = payload.cfxBalance
    },
    setDirectSendingMode(state, val) {
      state.directSendingMode = val
      localStorage.directSendingMode = val
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
    async setPrivateKey({ state }, { privateKey, address }) {
      if (!address) {
        address = state.sdk.sign.privateKeyToAddress(privateKey, parseInt(state.conflux?.chainId))
      }
      // refresh account
      if (address !== state.account) {
        store.commit('setAccount', {account: address})
        store.dispatch('updateCfxBalance')
      }
      
      state.privateKey = privateKey
    },
    async setKeystore({ state }, { keystore, password }) {
      if (!state.directSendingMode) {
        throw new Error("unexpected mutation: not in direct sending mode")
      }
      state.keystore = keystore
      const privateKeyAccount = state.sdk.PrivateKeyAccount.decrypt(state.keystore, password, parseInt(state.conflux?.chainId))
      state.privateKey = privateKeyAccount.privateKey
      store.commit('setAccount', { account:privateKeyAccount.address })
      store.dispatch('updateCfxBalance')
      state.keystore = keystore
    },
    async setSecretKey({state}, val) {
      if (!state.directSendingMode) {
        throw new Error("unexpected mutation: not in direct sending mode")
      }
      state.privateKey = null
      state.keystore = null
      const account = (new state.sdk.PrivateKeyAccount(val, parseInt(state.conflux?.chainId))).address
      store.commit('setAccount', {account})
      store.dispatch('updateCfxBalance')
      state.privateKey = val
    }
  }
})

export default store;