<script setup lang="ts">
import { ref } from "vue";
import GenerationParametersWindow from "./components/GenerationParametersWindow.vue";
import TextPad from "./components/TextPad.vue";
import * as FileIO from "@/lib/file_io";
import * as llm from "@/lib/llm";
import { debounceWatch } from "@/lib/utils";
import LogoImage from "./components/LogoImage.vue";
import MenuBar from "./components/MenuBar.vue";
import {
  GENERATION_PRESETS,
  useGenerationParametersStore,
  type GenerationPreset,
} from "@/stores/generationParameters";

const isSettingsVisible = ref(false);

const editorContents = ref("");

const generationParametersStore = useGenerationParametersStore();

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

function openNewWindow() {
  window.open(location.pathname, "_blank", "width=720,height=480");
}

function loadGenSettingsPreset(preset: GenerationPreset) {
  generationParametersStore.parameters = Object.assign({}, GENERATION_PRESETS[preset]);
  generationParametersStore.paramsKey.push(Date.now());
  generationParametersStore.paramsKey.shift();
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
  <main class="h-screen w-screen overflow-y-hidden">
    <MenuBar
      @project-open="loadFile"
      @project-save="saveFile"
      @gensettings-toggle-window="isSettingsVisible = !isSettingsVisible"
      @gensettings-load-preset="loadGenSettingsPreset"
      @window-new="openNewWindow" />
    <div class="h-[calc(100%-2.5em)] overflow-y-auto p-32">
      <!-- Unbounded height, allowing infinite scroll in the parent container -->
      <div>
        <LogoImage :visible="editorContents.length < 1" />
        <TextPad v-model="editorContents" @keybind-save="saveFile" @keybind-open="loadFile" />
      </div>
    </div>
    <GenerationParametersWindow :visible="isSettingsVisible" @close="isSettingsVisible = false" />
    <span class="fixed bottom-4 right-4 select-none text-sm text-zinc-700"
      >{{ tokenUsage }} tokens</span
    >
  </main>
</template>
