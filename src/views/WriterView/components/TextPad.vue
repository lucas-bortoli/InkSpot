<script setup lang="ts">
import { ref } from "vue";
import SuggestionBox from "./SuggestionBox.vue";

const emit = defineEmits<{
  (e: "input", content: string): void;
}>();

const editor = ref<HTMLElement>();
const suggBox = ref<InstanceType<typeof SuggestionBox>>();

function getContent(): string {
  const $editor = editor.value;
  if (!$editor) return "";

  return $editor.innerText.replace(/\r?\n$/, "");
}

function setContent(content: string) {
  const $editor = editor.value;
  if (!$editor) return;

  $editor.innerText = content;
}

function onEditorInput(e: Event) {
  const $editor = editor.value;
  if (!$editor || e.target !== $editor) return;

  emit("input", getContent());
  //$editor.parentElement!.scrollBy({ behavior: "smooth", top: 99999 });
}

function onEditorKeyDown(e: KeyboardEvent) {
  if (e.ctrlKey && e.code === "ArrowUp") e.preventDefault();
  if (e.ctrlKey && e.code === "ArrowDown") e.preventDefault();
}

function onEditorKeyUp(e: KeyboardEvent) {
  if (suggBox.value?.isShown) suggBox.value?.updateWindowPosition();

  if (e.ctrlKey && e.code === "Space") {
    e.preventDefault();
    suggBox.value?.refreshSuggestions(getContent());
    suggBox.value?.show();
  } else if (e.ctrlKey && e.code === "ArrowUp") {
    e.preventDefault();
    suggBox.value?.scrollSelection(-1);
  } else if (e.ctrlKey && e.code === "ArrowDown") {
    e.preventDefault();
    suggBox.value?.scrollSelection(1);
  } else if (e.ctrlKey && e.code === "Enter") {
    e.preventDefault();

    const suggestion = suggBox.value?.applySelectedSuggestion() ?? null;
    suggBox.value?.hide();
  } else if (e.code === "Escape") {
    e.preventDefault();
    suggBox.value?.hide();
  }
}

function onEditorBlur() {
  suggBox.value?.hide();
}

defineExpose({
  setContent,
  getContent,
});
</script>

<template>
  <main
    class="editor mx-auto mt-24 min-h-screen w-full max-w-screen-lg whitespace-pre-wrap p-16 font-mono shadow-xl outline-none"
    contenteditable
    ref="editor"
    v-on:input="onEditorInput"
    @keyup="onEditorKeyUp"
    @keydown="onEditorKeyDown"
    @blur="onEditorBlur"
  ></main>
  <SuggestionBox ref="suggBox" />
</template>

<style scoped>
.editor {
  padding-top: 25lvh;
  padding-bottom: 50lvh;
}

.generated-text {
  text-shadow: 1px 1px 0 #00000080;
}
</style>
