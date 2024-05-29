<script setup lang="ts">
import ChildWindow from "@/components/ChildWindow/ChildWindow.vue";
import IconElement from "@/components/IconElement.vue";
import { ref } from "vue";

const isSettingsVisible = ref(true);
</script>

<template>
  <main>
    <h1>HomeView</h1>
    <button @click="isSettingsVisible = true">
      <IconElement icon="settings" :size="32" />
    </button>
    <ChildWindow v-if="isSettingsVisible" @close="isSettingsVisible = false">
      <template #title>Hello</template>
      <template #default>
        <button>Welcome to my world</button>
      </template>
    </ChildWindow>
  </main>
</template>
