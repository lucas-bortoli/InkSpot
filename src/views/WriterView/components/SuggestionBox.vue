<script setup lang="ts">
import { getTextCaretTopPoint } from "@/lib/caret";
import { computed, ref } from "vue";
import * as llm from "@/lib/llm";
import { useGenerationParametersStore } from "@/stores/generationParameters";

const generationParametersStore = useGenerationParametersStore();
const suggestionWindow = ref<HTMLElement>();

const position = ref<{ top: number; left: number } | null>(null);
const isShown = ref(true);
const suggestions = ref<string[]>(["Flash", "Bang", "Alakazam"]);
const selectionIndex = ref(0);

const currentSelection = computed<string | null>(
  () => suggestions.value[selectionIndex.value] ?? null
);

let currentAbortController: AbortController | null = null;

async function refreshSuggestions(content: string) {
  if (currentAbortController) {
    currentAbortController.abort();
  }

  const abortController = new AbortController();
  currentAbortController = abortController;

  suggestions.value = [];
  selectionIndex.value = 0;

  for (let i = 0; i <= 2; i++) {
    const params = generationParametersStore.formatToApi(generationParametersStore.parameters);

    try {
      const suggestion = await llm.requestCompletion(
        {
          ...params,
          prompt: content,
          n_predict: 8,
        },
        abortController.signal
      );

      suggestions.value.push(suggestion);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Previous request aborted");
      } else {
        console.error("Error in requestCompletion:", error);
      }
      break; // Stop the loop if aborted
    }
  }

  if (currentAbortController === abortController) {
    currentAbortController = null;
  }
}

function applySelectedSuggestion(): string | null {
  const suggestion = suggestions.value[selectionIndex.value] ?? null;

  suggestions.value = [];
  selectionIndex.value = 0;

  return suggestion;
}

function updateWindowPosition() {
  const caret = getTextCaretTopPoint();

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
