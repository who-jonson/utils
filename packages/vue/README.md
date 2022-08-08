# @whoj/utils-vue

<p>
  <a href="https://www.npmjs.com/package/@whoj/utils-vue">
    <img src="https://badgen.net/npm/v/@whoj/utils-vue?icon=npm&color=green&label=" alt="Version">
  </a>
  <a href="#">
    <img src="https://badgen.net/npm/types/@whoj/utils-vue?color=blue&icon=typescript&label=" alt="Typings">
  </a>
  <a href="https://github.com/who-jonson/utils-vue/blob/master/LICENSE">
    <img src="https://badgen.net/npm/license/@whoj/utils-vue" alt="License">
  </a>
</p>

### Install

```bash
npm i @whoj/utils-vue # OR pnpm add @whoj/utils-vue
```

### @whoj/utils-vue/fusejs

Fully typed [Fuse.js](https://fusejs.io/) search library.

```vue
<template>
  <div>
    <input type="text" v-model="search">
    <p v-if="noResults">Sorry, no results for {{search}}</p>
    <div v-for="(r, i) in results" :key="i">
      {{ r }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useVueFuse } from '@whoj/utils-vue/fusejs';

export default defineComponent({
  setup () {
    const myList = ['aaaa', 'bbbb', 'cccc', 'abc', 'xyz']
    const { search, results, noResults } = useVueFuse(myList)

    return {
      search,
      results,
      noResults,
    }
  }
})
</script>
```

[MIT](../../LICENSE) License © 2022 [Jonson B.](https://github.com/who-jonson)
