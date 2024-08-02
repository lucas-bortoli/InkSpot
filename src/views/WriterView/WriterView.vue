<script setup lang="ts">
import { computed, ref } from "vue";
import GenerationParametersWindow from "./components/GenerationParametersWindow/GenerationParametersWindow.vue";
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
import {
  PROJECT_EXTENSION,
  PROJECT_MIME,
  PROJECT_TYPE_FRIENDLY,
  saveProject,
  loadProject,
  exportProjectHtml,
} from "@/lib/project_manager";
import SettingsModal from "./components/SettingsModal/SettingsModal.vue";
import { getSettings } from "@/lib/settings";

const isGenerationParametersVisible = ref(false);
const isAppSettingsVisible = ref(false);

const editorContents = ref("");
const editorPadding = ref<"compact" | "comfortable" | "comfortable-2x">("comfortable");

const generationParametersStore = useGenerationParametersStore();

async function newFile() {
  FileIO.clearFileKey("current");
  editorContents.value = "";
}

async function loadFile() {
  const projectData = await FileIO.openFile("current", {
    extension: PROJECT_EXTENSION,
    friendlyName: PROJECT_TYPE_FRIENDLY,
    mimeType: PROJECT_MIME,
  });

  const project = loadProject(projectData);

  generationParametersStore.parameters = project.generationParameters;
  generationParametersStore.paramsKey.push(Date.now());
  generationParametersStore.paramsKey.shift();
  editorContents.value = project.content;
}

async function saveFile() {
  const project = saveProject({
    generationParameters: generationParametersStore.parameters,
    content: editorContents.value,
  });

  await FileIO.saveFile("current", project, `New Document${PROJECT_EXTENSION}`, {
    extension: PROJECT_EXTENSION,
    friendlyName: PROJECT_TYPE_FRIENDLY,
    mimeType: PROJECT_MIME,
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

function setPadding(padding: (typeof editorPadding)["value"]) {
  editorPadding.value = padding;
}

function exportProject(type: "html" | "pdf") {
  if (type === "html") exportProjectHtml(editorContents.value);
}

const tokenUsage = ref(0);
debounceWatch(
  editorContents,
  async () => {
    tokenUsage.value = await llm.countTokens(editorContents.value, getSettings().serverUrl, {
      considerEosToken: false,
    });
  },
  500
);

const editorStyle = computed(() => {
  switch (editorPadding.value) {
    case "comfortable-2x":
      return "p-64 max-w-screen-xl";
    case "comfortable":
      return "p-32 max-w-screen-2xl";
    case "compact":
    default:
      return "p-8";
  }
});
</script>

<template>
  <main class="h-screen w-screen overflow-y-hidden">
    <MenuBar
      @project-new="newFile"
      @project-open="loadFile"
      @project-save="saveFile"
      @gensettings-toggle-window="isGenerationParametersVisible = !isGenerationParametersVisible"
      @gensettings-load-preset="loadGenSettingsPreset"
      @window-new="openNewWindow"
      @editor-padding="setPadding"
      @project-export="exportProject"
      @app-settings-show="isAppSettingsVisible = true" />
    <div class="mx-auto h-[calc(100%-2.5em)] overflow-y-auto" :class="editorStyle">
      <!-- Unbounded height, allowing infinite scroll in the parent container -->
      <div>
        <LogoImage :visible="editorContents.length < 1" />
        <TextPad v-model="editorContents" @keybind-save="saveFile" @keybind-open="loadFile" />
      </div>
    </div>
    <GenerationParametersWindow
      :visible="isGenerationParametersVisible"
      @close="isGenerationParametersVisible = false" />
    <span class="fixed bottom-4 right-4 select-none text-sm text-zinc-700"
      >{{ tokenUsage }} tokens</span
    >
    <SettingsModal :open="isAppSettingsVisible" @dismiss="isAppSettingsVisible = false" />
  </main>
</template>
