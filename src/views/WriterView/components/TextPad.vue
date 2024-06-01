<script setup lang="ts">
import { nextTick, ref } from "vue";
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
}

function onEditorKeyDown(e: KeyboardEvent) {
  if (e.ctrlKey && e.code === "ArrowUp") e.preventDefault();
  if (e.ctrlKey && e.code === "ArrowDown") e.preventDefault();
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

  setContent(getContent() + suggestion);
  suggBox.value?.refreshSuggestions();

  nextTick(() => {
    var range = document.createRange();
    range.selectNodeContents(editor.value!);
    range.collapse(false);
    var sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
    suggBox.value?.show();

    editor.value?.parentElement?.scrollBy({ behavior: "smooth", top: 99999 });
  });
}

defineExpose({
  setContent,
  getContent,
});
</script>

<template>
  <main
    class="editor mx-auto mt-24 min-h-screen w-full max-w-screen-lg whitespace-pre-wrap p-16 font-mono shadow-xl outline-none"
    ref="editor"
    v-on:input="onEditorInput"
    @keyup="onEditorKeyUp"
    @keydown="onEditorKeyDown"
    contenteditable></main>
  <SuggestionBox
    ref="suggBox"
    @suggestion-selected="onSuggestionSelected"
    :get-content="getContent" />
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
