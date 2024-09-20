import installIcon from '@/plugins/installIcon'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/es/components/loading/style/css'
import './main.css'
import '@/assets/iconfont/iconfont.css'

import 'element-plus/es/components/message/style/css' // icon 注册
import { router } from '@/plugins/installRouter' // 路由注册

const app = createApp(App)
// app.config.globalProperties.$showLoading = ref(false);
// app.config.globalProperties.$ElLoading = ElLoading.service({
//     text: '核心加载中...'
// });

const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(installIcon)

app.mount('#vite-app')
