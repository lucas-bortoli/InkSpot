<!--
  Inspired by https://github.com/kueblc/LDT

  I needed some kind of <textarea> that allowed for syntax highlighting. This
  is accomplished by overlaying a regular textarea with a div, keeping its
  innerHTML synced with the textarea value, hiding the textarea contents, and
  disabling mouse/keyboard events in the div.
-->
<script setup lang="ts">
import { computed } from "vue";

export interface SyntaxHighlightRule {
  keywords: string[];
  style: string;
}

const model = defineModel<string>({
  default: "",
});

const props = defineProps<{
  placeholder?: string;
  syntaxHighlightRules?: SyntaxHighlightRule[];
}>();

defineEmits<{
  (e: "input", event: Event): void;
  (e: "keyup", event: KeyboardEvent): void;
  (e: "keydown", event: KeyboardEvent): void;
}>();

function sanitize(input: string) {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  const reg = /[&<>"'/]/gi;

  return input.replace(reg, (match) => map[match]);
}

function syntaxHighlight(sanitized: string): string {
  let value = sanitized;

  for (const rule of props.syntaxHighlightRules ?? []) {
    const ruleValue = sanitize(rule.style);

    for (const keyword of rule.keywords.map((w) => sanitize(w))) {
      value = value.replaceAll(keyword, `<span style='${ruleValue}'>${keyword}</span>`);
    }
  }

  return value;
}

const innerHtml = computed(() => {
  const sanitized = sanitize(model.value);

  return syntaxHighlight(sanitized);
});
</script>

<template>
  <div class="wrapper">
    <textarea
      class="control-layer"
      spellcheck="false"
      v-model="model"
      @keydown="(e) => $emit('keydown', e)"
      @keyup="(e) => $emit('keyup', e)"
      @input="(e) => $emit('input', e)">
    </textarea>
    <div class="presentation-layer" v-html="innerHtml"></div>
    <div class="placeholder-layer" v-if="model.length === 0">{{ placeholder }}</div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  font-family: monospace;
}

.control-layer,
.presentation-layer,
.placeholder-layer {
  width: 100%;
  height: 100%;
  /* Fixes some weird bug on firefox where if the value ends with \n the caret is in the wrong row */
  padding-bottom: 1lh;
  grid-row: 1;
  grid-column: 1;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space-collapse: preserve;
  overflow: hidden;
  word-wrap: break-word;
}

.control-layer {
  color: transparent;
  resize: none;
  caret-color: black;
  outline: none;
}

.control-layer::selection {
  background-color: rgb(255, 255, 169);
  font-weight: bold;
}

.presentation-layer {
  color: inherit;
  pointer-events: none;
  user-select: none;
}

.placeholder-layer {
  font-style: italic;
  color: inherit;
  pointer-events: none;
  user-select: none;
  opacity: 0.5;
}
</style>
