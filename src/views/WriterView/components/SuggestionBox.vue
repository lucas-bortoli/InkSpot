<script setup lang="ts">
import { getTextCaretTopPoint } from "@/lib/caret";
import { computed, ref } from "vue";

const suggestionWindow = ref<HTMLElement>();

const position = ref<{ top: number; left: number } | null>(null);
const isShown = ref(true);
const suggestions = ref<string[]>(["Flash", "Bang", "Alakazam"]);
const selectionIndex = ref(0);

const currentSelection = computed<string | null>(
  () => suggestions.value[selectionIndex.value] ?? null
);

async function refreshSuggestions(content: string) {
  suggestions.value = [];
  selectionIndex.value = 0;
}

function applySelectedSuggestion(): string | null {
  const suggestion = suggestions.value[selectionIndex.value] ?? null;

  suggestions.value = [];
  selectionIndex.value = 0;

  return suggestion;
}

function updateWindowPosition() {
  const caret = getTextCaretTopPoint();
  console.log(caret);

  if (!caret || caret.left < 250) return hide();

  position.value = {
    top: caret.top + 20,
    left: caret.left,
  };
}

function scrollSelection(offset: -1 | 1) {
  let newIndex = selectionIndex.value + offset;
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= suggestions.value.length) newIndex = suggestions.value.length - 1;
  selectionIndex.value = newIndex;
}

function show() {
  isShown.value = true;
  updateWindowPosition();
}

function hide() {
  position.value = null;
  isShown.value = false;
}

defineExpose({
  isShown,
  currentSelection,
  applySelectedSuggestion,
  refreshSuggestions,
  scrollSelection,
  updateWindowPosition,
  show,
  hide,
});
</script>

<template>
  <div
    ref="suggestionWindow"
    class="fixed flex w-screen max-w-64 select-none flex-col gap-2 rounded-md border bg-white py-2"
    :style="{
      visibility: isShown ? 'visible' : 'hidden',
      top: `${position?.top}px`,
      left: `${position?.left}px`,
    }"
  >
    <span class="px-2 text-sm">Text suggestions</span>
    <ol>
      <li
        v-for="(sug, index) in suggestions"
        :key="sug"
        :class="{ 'bg-zinc-100 font-bold': selectionIndex === index }"
        class="cursor-pointer px-2 font-mono hover:bg-zinc-100"
      >
        {{ sug }}
      </li>
    </ol>
  </div>
</template>
