<script setup lang="ts">
import IconElement from "@/components/IconElement.vue";
import { ref } from "vue";
import GenerationParametersWindow from "./components/GenerationParametersWindow.vue";
import TextPad from "./components/TextPad.vue";
import * as FileIO from "@/lib/file_io";
import { debounceWatch } from "@/lib/utils";
import * as llm from "@/lib/llm";
import LogoImage from "./components/LogoImage.vue";

const isSettingsVisible = ref(false);

const editorContents = ref("");

async function loadFile() {
  const contents = await FileIO.openFile("current", {
    extension: ".txt",
    friendlyName: "Text files",
    mimeType: "text/plain",
  });

  editorContents.value = contents;
}
async function saveFile() {
  await FileIO.saveFile("current", editorContents.value, "file.txt", {
    extension: ".txt",
    friendlyName: "Text files",
    mimeType: "text/plain",
  });
}

const tokenUsage = ref(0);
debounceWatch(
  editorContents,
  async () => {
    tokenUsage.value = await llm.countTokens(editorContents.value, { considerEosToken: false });
  },
  500
);
</script>

<template>
  <main class="h-screen w-screen overflow-y-auto">
    <nav class="fixed bottom-4 left-4 z-10 inline-flex flex-col items-start gap-4">
      <button
        @click="isSettingsVisible = !isSettingsVisible"
        class="flex items-center gap-2 text-transparent opacity-20 grayscale transition-all hover:text-black hover:opacity-100 hover:grayscale-0">
        <IconElement icon="settings" :size="32" />
        Generation settings
      </button>
      <button
        @click="loadFile()"
        class="flex items-center gap-2 text-transparent opacity-20 grayscale transition-all hover:text-black hover:opacity-100 hover:grayscale-0">
        <IconElement icon="openFolder" :size="32" />
        Open file
      </button>
      <button
        @click="saveFile()"
        class="flex items-center gap-2 text-transparent opacity-20 grayscale transition-all hover:text-black hover:opacity-100 hover:grayscale-0">
        <IconElement icon="save" :size="32" />
        Save file
      </button>
    </nav>
    <div class="p-32">
      <LogoImage :visible="editorContents.length < 1" />
      <TextPad v-model="editorContents" @keybind-save="saveFile" @keybind-open="loadFile" />
    </div>
    <GenerationParametersWindow :visible="isSettingsVisible" @close="isSettingsVisible = false" />
    <span class="fixed bottom-4 right-4 select-none text-sm text-zinc-700"
      >{{ tokenUsage }} tokens</span
    >
  </main>
</template>
