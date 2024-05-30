<script setup lang="ts">
import IconElement from "@/components/IconElement.vue";
import { ref } from "vue";
import GenerationParametersWindow from "./components/GenerationParametersWindow.vue";

const isSettingsVisible = ref(true);
</script>

<template>
  <main>
    <h1>HomeView</h1>
    <button @click="isSettingsVisible = !isSettingsVisible">
      <IconElement icon="settings" :size="32" />
    </button>
    <GenerationParametersWindow v-if="isSettingsVisible" @close="isSettingsVisible = false" />
  </main>
</template>
