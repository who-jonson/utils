import { createApp } from 'vue';

import App from './App.vue';
import { Ripple } from '../../packages/vue/src';

const app = createApp(App);
app
  .use(Ripple)
  .mount('#app');
