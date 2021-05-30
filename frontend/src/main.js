import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import store from './store'
import i18n from './i18n'

import 'element-ui/lib/theme-chalk/index.css';


Vue.config.productionTip = false

Vue.use(ElementUI)



new Vue({
  render: h => h(App),
  store,
  i18n
}).$mount('#app')
