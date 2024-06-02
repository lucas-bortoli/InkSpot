<script setup lang="ts">
import { computed, ref } from "vue";
import * as llm from "@/lib/llm";
import { useGenerationParametersStore } from "@/stores/generationParameters";
import ChildWindow from "@/components/ChildWindow/ChildWindow.vue";
import IconElement from "@/components/IconElement.vue";

const props = defineProps<{
  textValue: string;
}>();

const generationParametersStore = useGenerationParametersStore();
const isShown = ref(false);
const suggestions = ref<string[]>([]);
const selectionIndex = ref(0);

const currentSelection = computed<string | null>(
  () => suggestions.value[selectionIndex.value] ?? null
);

const emit = defineEmits<{
  (e: "suggestionSelected", suggestion: string | null): void;
}>();

let currentAbortController: AbortController | null = null;

async function refreshSuggestions() {
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
          prompt: props.textValue,
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

function selectSuggestion(
  suggestion = suggestions.value[selectionIndex.value] ?? null
): string | null {
  suggestions.value = [];
  selectionIndex.value = 0;

  emit("suggestionSelected", suggestion ?? null);

  return suggestion;
}

function scrollSelection(offset: -1 | 1) {
  let newIndex = selectionIndex.value + offset;
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= suggestions.value.length) newIndex = suggestions.value.length - 1;
  selectionIndex.value = newIndex;
}

function show() {
  isShown.value = true;
}

function hide() {
  isShown.value = false;
}

defineExpose({
  isShown,
  currentSelection,
  selectSuggestion,
  refreshSuggestions,
  scrollSelection,
  show,
  hide,
});
</script>

<template>
  <ChildWindow :visible="isShown" @close="hide()" :min-width="360">
    <template #title>Suggestions</template>
    <template #extra-buttons>
      <button
        class="flex items-center justify-center gap-1 rounded-lg bg-zinc-200 p-1 capitalize"
        style="font-size: 12px; line-height: 0"
        @click="refreshSuggestions()"
        title="Refresh suggestions">
        <IconElement icon="refresh" />
        Refresh
      </button>
    </template>
    <template #default>
      <ol class="h-[calc(100%-theme(spacing.6))] overflow-y-auto">
        <li
          v-for="(sug, index) in suggestions"
          :key="sug"
          @click="selectSuggestion(sug)"
          :class="{ 'bg-zinc-100 font-bold': selectionIndex === index }"
          class="cursor-pointer select-none whitespace-pre-wrap px-2 font-mono text-sm hover:bg-zinc-100">
          {{ sug }}
        </li>
      </ol>
      <footer class="flex h-6 select-none items-center gap-2 px-2 text-xs">
        <span>Ctrl+Up/Down to select, Ctrl+Enter to apply</span>
      </footer>
    </template>
  </ChildWindow>
</template>
