<script setup lang="ts">
import Menubar from "@/components/ui/menubar/Menubar.vue";
import MenubarMenu from "@/components/ui/menubar/MenubarMenu.vue";
import MenubarTrigger from "@/components/ui/menubar/MenubarTrigger.vue";
import MenubarContent from "@/components/ui/menubar/MenubarContent.vue";
import MenubarItem from "@/components/ui/menubar/MenubarItem.vue";
import MenubarSeparator from "@/components/ui/menubar/MenubarSeparator.vue";
import MenubarShortcut from "@/components/ui/menubar/MenubarShortcut.vue";
import MenubarSub from "@/components/ui/menubar/MenubarSub.vue";
import MenubarSubTrigger from "@/components/ui/menubar/MenubarSubTrigger.vue";
import MenubarSubContent from "@/components/ui/menubar/MenubarSubContent.vue";
import IconElement from "@/components/IconElement.vue";

import type { GenerationPreset } from "@/stores/generationParameters";

defineEmits<{
  (e: "project-new"): void;
  (e: "project-open"): void;
  (e: "project-save"): void;
  (e: "project-export", type: "html" | "pdf"): void;
  (e: "window-new"): void;
  (e: "editor-padding", padding: "compact" | "comfortable" | "comfortable-2x"): void;
  (e: "gensettings-load-preset", padding: GenerationPreset): void;
  (e: "gensettings-toggle-window"): void;
  (e: "app-settings-show"): void;
}>();
</script>

<template>
  <Menubar class="menubar">
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @click="$emit('project-new')">
          <IconElement icon="new" class="menu-icon" /> New Project
        </MenubarItem>
        <MenubarItem @click="$emit('project-open')">
          <IconElement icon="openFolder" class="menu-icon" /> Open Project...
        </MenubarItem>
        <MenubarItem @click="$emit('project-save')">
          <IconElement icon="save" class="menu-icon" /> Save Project...
          <MenubarShortcut>⌘S</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>
            <IconElement icon="export" class="menu-icon" /> Export...
          </MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem @click="$emit('project-export', 'html')">HTML document</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem @click="$emit('app-settings-show')">
          <IconElement icon="settings" class="menu-icon" /> Settings...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem @click="$emit('window-new')">
          <IconElement icon="newWindow" class="menu-icon" /> New Window
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>View</MenubarTrigger>
      <MenubarContent>
        <MenubarSub>
          <MenubarSubTrigger>Editor Padding...</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem @click="$emit('editor-padding', 'compact')">Compact</MenubarItem>
            <MenubarItem @click="$emit('editor-padding', 'comfortable')">Comfortable</MenubarItem>
            <MenubarItem @click="$emit('editor-padding', 'comfortable-2x')">
              Comfortable 2x
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Generation</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @click="$emit('gensettings-toggle-window')"> Parameters... </MenubarItem>
        <MenubarSub>
          <MenubarSubTrigger>Presets</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem @click="$emit('gensettings-load-preset', 'technical')">
              Technical
            </MenubarItem>
            <MenubarItem @click="$emit('gensettings-load-preset', 'creative')">
              Creative
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</template>

<style>
.menubar {
  border-width: 0 0 1px 0;
  border-radius: 0;
  background: #f3f3f3;
}

.menubar > button:hover {
  background: #00000010;
}

.menu-icon {
  margin-right: 0.5em;
}

@media (prefers-color-scheme: dark) {
  .menubar {
    background: #202020;
  }
}
</style>
