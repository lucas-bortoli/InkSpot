<script setup lang="ts">
import IconElement from "@/components/IconElement.vue";
import { ref } from "vue";
import GenerationParametersWindow from "./components/GenerationParametersWindow.vue";
import TextPad from "./components/TextPad.vue";
import * as FileIO from "@/lib/file_io";

const isSettingsVisible = ref(false);

const editor = ref<InstanceType<typeof TextPad>>();

async function loadFile() {
  const $editor = editor.value;
  if (!$editor) return;

  const contents = await FileIO.openFile("current", {
    extension: ".txt",
    friendlyName: "Text files",
    mimeType: "text/plain",
  });

  $editor.setContent(contents);
}
async function saveFile() {
  const $editor = editor.value;
  if (!$editor) return;

  await FileIO.saveFile("current", $editor.getContent(), "story.txt", {
    extension: ".txt",
    friendlyName: "Text files",
    mimeType: "text/plain",
  });
}
</script>

<template>
  <main class="h-screen w-screen overflow-y-auto">
    <nav class="fixed left-4 top-4 inline-flex flex-col gap-4">
      <button
        @click="isSettingsVisible = !isSettingsVisible"
        class="opacity-30 grayscale hover:opacity-100 hover:grayscale-0">
        <IconElement icon="settings" :size="32" />
      </button>
      <button @click="loadFile()" class="opacity-30 grayscale hover:opacity-100 hover:grayscale-0">
        <IconElement icon="openFolder" :size="32" />
      </button>
      <button @click="saveFile()" class="opacity-30 grayscale hover:opacity-100 hover:grayscale-0">
        <IconElement icon="save" :size="32" />
      </button>
    </nav>
    <TextPad ref="editor" />
    <GenerationParametersWindow :visible="isSettingsVisible" @close="isSettingsVisible = false" />
  </main>
</template>
