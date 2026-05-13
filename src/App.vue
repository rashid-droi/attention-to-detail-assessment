<template>
  <div class="site-shell">
    <SelectSiteHeader v-if="showShellHeader" />
    <main class="site-shell__main">
      <router-view />
    </main>
    <SelectSiteFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SelectSiteHeader from './components/SelectSiteHeader.vue'
import SelectSiteFooter from './components/SelectSiteFooter.vue'

const route = useRoute()
const showShellHeader = computed(() => !route.meta.integratedSiteHeader)
</script>

<style>
.site-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  min-height: 100%;
}

.site-shell__main {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.site-shell__main > * {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}
</style>
