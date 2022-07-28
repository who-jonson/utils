<script lang="ts" setup>
import { vRipple } from '../../packages/vue/src';
</script>

<template>
  <div id="app">
    <section class="hero">
      <div class="hero-body" style="padding: 1rem 0">
        <div class="container">
          <div class="columns">
            <div class="column is-6 is-offset-3" style="display: flex; align-items: center;">
              <div class="is-pulled-left" style="text-align: left">
                <h1 class="title text-medium-grey" style="margin-bottom: .5rem">
                  Material Ripple Effect
                </h1>
                <hr class="is-marginless">
                <h2 class="subtitle text-light-grey" style="margin-top: .5rem">
                  A Vue Directive
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top: .5rem">
      <div class="container">
        <div class="columns">
          <div class="column is-8 is-offset-2">
            <div class="box formated">
              <div class="heading">
                <div class="columns">
                  <div class="column">
                    <i class="material-icons top-left">code</i>
                    <span class="is-pulled-right"><b>Examples</b></span>
                  </div>
                </div>
              </div>
              <div class="content">
                <div class="columns">
                  <div class="column">
                    <div>
                      <table class="table is-striped">
                        <thead>
                          <tr>
                            <th v-ripple.dblclick>
                              One <small>(Double Click)</small>
                            </th>
                            <th v-ripple.mouseover>
                              Two <small>(MouseOver)</small>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(n, i) in 2" :key="i">
                            <td v-ripple>
                              Yes ripple {{ n }}
                            </td>
                            <td>No ripple {{ n }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <div v-ripple.mouseover="'rgba(255, 255, 255, 0.35)'" class="button is-primary" style="margin: .5rem">
                        MouseOver
                      </div>
                      <a v-ripple.mouseout="'rgba(230, 68, 3, 0.71)'" class="button is-success is-outlined" style="text-decoration: none; margin: .5rem">MouseOut</a>
                    </div>
                    <div>
                      <span v-ripple="'rgba(99, 249, 8, 0.71)'" class="tag is-info pointer">Info</span>
                      <span v-ripple class="tag is-success pointer">Success</span>
                      <span v-ripple="'rgba(9, 249, 8, 0.71)'" class="tag is-primary is-medium pointer">Medium</span>
                      <span v-ripple="'rgba(99, 9, 8, 0.71)'" class="tag is-info is-large pointer">Large</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.pointer {
  cursor: pointer;
}
h1, h2 {
  font-weight: normal;
}
hr {
  background-color: transparent;
  border: none;
  display: block;
  height: inherit;
  margin: 1.5rem 0;
  border-top: dashed 1px;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #0b99b9;
  text-decoration: underline;
}
.text-medium-grey {
  color: #333;
}

.text-light-grey {
  color: #888;
}
.box.formated {
  position: relative;
  padding: 0;
}
.box.formated .heading {
  font-size: 1rem;
  text-transform: capitalize;
  padding: .8rem 1.5rem;
  background-color: #fafafa;
}
.box.formated .content {
  padding: 1rem 2rem;
}
i.top-left {
  position: absolute;
  left: 1.5rem;
  top: 0.8rem;
}
.vertical-separator {
  display: flex; justify-content: space-around;
}
.vertical-separator .line {
  border-right: 1px solid #cccccc;
}
</style>
