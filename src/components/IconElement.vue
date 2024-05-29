<script setup lang="ts">
import { computed } from "vue";
import CloseIcon from "@/assets/icons/Close.svg";
import SettingsIcon from "@/assets/icons/Settings.svg";

const ICONS = {
  close: CloseIcon,
  settings: SettingsIcon,
};

const SIZES = [16, 24, 32, 48] as const;

const props = defineProps<{
  icon: keyof typeof ICONS;
  size?: (typeof SIZES)[number];
}>();

const iconUrl = computed(() => ICONS[props.icon]);
</script>

<template>
  <i
    class="icon inline-block h-4 w-4"
    :style="{ '--icon': `url('${iconUrl}')`, '--size': `${size ?? 16}px` }"
  ></i>
</template>

<style scoped>
.icon {
  background-image: var(--icon);
  background-size: 100%;
  width: var(--size);
  height: var(--size);
}
</style>
