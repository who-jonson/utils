import { createApp } from 'vue-demi';
import { Ripple } from '../../packages/vue/src';
import App from './App.vue';

const app = createApp(App);
app
  .use(Ripple)
  .mount('#app');
