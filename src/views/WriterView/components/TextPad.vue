<script setup lang="ts">
import { nextTick, ref } from "vue";
import SuggestionBox from "./SuggestionBox.vue";
import ColoredTextArea, { type SyntaxHighlightRule } from "./ColoredTextArea.vue";

const textValue = defineModel<string>({
  default: "",
});

const emit = defineEmits<{
  (e: "keybindSave"): void;
  (e: "keybindOpen"): void;
}>();

const suggBox = ref<InstanceType<typeof SuggestionBox>>();

function onEditorKeyDown(e: KeyboardEvent) {
  if (e.ctrlKey && e.code === "ArrowUp") e.preventDefault();
  if (e.ctrlKey && e.code === "ArrowDown") e.preventDefault();
  if (e.ctrlKey && e.code === "KeyS") {
    e.preventDefault();
    emit("keybindSave");
  }
  if (e.ctrlKey && e.code === "KeyO") {
    e.preventDefault();
    emit("keybindOpen");
  }
}

function onEditorKeyUp(e: KeyboardEvent) {
  if (e.ctrlKey && e.code === "Space") {
    e.preventDefault();
    suggBox.value?.refreshSuggestions();
    suggBox.value?.show();
  } else if (e.ctrlKey && e.code === "ArrowUp") {
    e.preventDefault();
    suggBox.value?.scrollSelection(-1);
  } else if (e.ctrlKey && e.code === "ArrowDown") {
    e.preventDefault();
    suggBox.value?.scrollSelection(1);
  } else if (e.ctrlKey && e.code === "Enter") {
    e.preventDefault();
    suggBox.value?.selectSuggestion();
  } else if (e.code === "Escape") {
    e.preventDefault();
    suggBox.value?.hide();
  }
}

function onSuggestionSelected(suggestion: string | null) {
  if (suggestion === null) return;

  textValue.value = textValue.value + suggestion;

  nextTick(() => {
    suggBox.value?.refreshSuggestions();
    suggBox.value?.show();
  });
}

const rules: SyntaxHighlightRule[] = [
  {
    keywords: [
      "<|begin_of_text|>",
      "<|eot_id|>",
      "<|start_header_id|>",
      "<|end_header_id|>",
      "<|end_of_text|>",
    ],
    style: "color: green; font-weight: bold;",
  },
];
</script>

<template>
  <ColoredTextArea
    class="editor block min-h-screen w-full"
    :placeholder="'Start writing...\n(ctrl+Space to open autocomplete window/refresh suggestions)'"
    :syntax-highlight-rules="rules"
    v-model="textValue"
    @keydown="onEditorKeyDown"
    @keyup="onEditorKeyUp" />
  <SuggestionBox
    ref="suggBox"
    @suggestion-selected="onSuggestionSelected"
    :text-value="textValue" />
</template>

<style scoped>
.editor {
  padding-bottom: 90lvh;
}

.generated-text {
  text-shadow: 1px 1px 0 #00000080;
}
</style>
