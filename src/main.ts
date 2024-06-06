import { createApp, watch, ref } from 'vue';
import { createPinia } from 'pinia';
import 'element-plus/es/components/loading/style/css';
import { ElLoading } from 'element-plus';
import App from './App.vue';
import './assets/main.css';
import '@/assets/iconfont/iconfont.css';
import 'element-plus/es/components/message/style/css';

import installIcon from '@/plugins/installIcon'; // icon 注册
import { router } from '@/plugins/installRouter'; // 路由注册

const app = createApp(App);
// app.config.globalProperties.$showLoading = ref(false);
// app.config.globalProperties.$ElLoading = ElLoading.service({
//     text: '核心加载中...'
// });

const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(installIcon);

app.mount('#vite-app');
