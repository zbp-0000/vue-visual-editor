<script setup>
import { ref, provide } from 'vue'
import data from './data.json'
import Editor from './packages/editor.jsx'
import {editorConfig as config} from './utils/editor-config.jsx'
let state = ref(data)
provide('config', config)
</script>

<template>
  <div class="app">
    <Editor v-model:state="state" />
  </div>
</template>

<style lang="scss" scoped>
.app {
  position: absolute;
  top: 10px;
  left: 10px;
  bottom: 10px;
  right: 10px;
}
</style>
