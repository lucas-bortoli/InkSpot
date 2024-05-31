<script setup lang="ts">
import { ref } from "vue";
import { useGeminataDrag } from "./useGeminataDrag";
import { useGeminataResize } from "./useGeminataResize";
import { useGeminataStacking } from "./useGeminataStack";
import IconElement from "@/components/IconElement.vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();

defineProps({
  minWidth: { type: Number, default: 192 },
  minHeight: { type: Number, default: 192 },
  maxWidth: { type: Number, default: 480 },
  maxHeight: { type: Number, default: 480 },
});

const $window = ref<HTMLDivElement>();
const $titleBar = ref<HTMLDivElement>();
const $resizeArea = ref<HTMLDivElement>();

useGeminataDrag($window, $titleBar);
useGeminataResize($window, $resizeArea);
useGeminataStacking($window);

function handleCloseButton() {
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <div
      ref="$window"
      class="fixed left-4 top-4 h-0 min-h-48 w-0 min-w-48"
      :style="{
        'min-width': `${minWidth}px`,
        'min-height': `${minHeight}px`,
        'max-width': `${maxWidth}px`,
        'max-height': `${maxHeight}px`,
      }"
    >
      <div class="flex select-none items-center rounded-t-xl bg-zinc-100 p-1 pl-4" ref="$titleBar">
        <slot name="icon"></slot>
        <div class="pointer-events-none ml-2 grow text-sm text-zinc-700 first:ml-0">
          <slot name="title">Form</slot>
        </div>
        <div class="flex shrink-0 gap-1">
          <slot name="extra-buttons"></slot>
          <button
            class="flex items-center justify-center rounded-lg bg-zinc-200 p-1"
            @click="handleCloseButton"
            title="Close window"
          >
            <IconElement icon="close" />
          </button>
        </div>
      </div>
      <div
        class="inline-block h-[calc(100%-theme(spacing.8))] w-full overflow-hidden rounded-b-xl bg-white shadow-2xl"
      >
        <main class="h-full w-full overflow-y-auto">
          <slot></slot>
        </main>
      </div>
      <div
        class="resizeArea absolute left-3 top-3 -z-10 h-full w-full select-none rounded-2xl bg-black opacity-0 hover:opacity-40"
        ref="$resizeArea"
      ></div>
    </div>
  </Teleport>
</template>

<style scoped>
.resizeArea {
  transition: opacity ease-in-out 200ms;
  transition-delay: 150ms;
  cursor: nwse-resize;
}
</style>
