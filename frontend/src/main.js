import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import store from './store'

import 'element-ui/lib/theme-chalk/index.css';


Vue.config.productionTip = false
// Vue.prototype.$conflux = Conflux

Vue.use(ElementUI)



new Vue({
  render: h => h(App),
  store
}).$mount('#app')
