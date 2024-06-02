<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>

<template>
  <img
    src="../../../assets/logo.png"
    style="height: 80px"
    class="pointer-events-none mb-4 select-none opacity-0 transition-opacity"
    :class="{ 'opacity-40': visible }" />
</template>

<style scoped></style>
