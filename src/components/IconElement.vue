<script setup lang="ts">
import { computed } from "vue";
import CloseIcon from "@/assets/icons/Close.svg";
import SettingsIcon from "@/assets/icons/Settings.svg";
import ReloadXMLIcon from "@/assets/icons/ReloadXML.svg";
import OpenFolderIcon from "@/assets/icons/OpenFolder.svg";
import SaveIcon from "@/assets/icons/Save.svg";
import RefreshIcon from "@/assets/icons/Refresh.svg";
import NewWindowIcon from "@/assets/icons/NewWindow.svg";
import CancelIcon from "@/assets/icons/Cancel.svg";
import ExportIcon from "@/assets/icons/Export.svg";
import NewIcon from "@/assets/icons/New.svg";
import NextFrameIcon from "@/assets/icons/NextFrame.svg";

const ICONS = {
  close: CloseIcon,
  settings: SettingsIcon,
  reloadXml: ReloadXMLIcon,
  openFolder: OpenFolderIcon,
  save: SaveIcon,
  refresh: RefreshIcon,
  newWindow: NewWindowIcon,
  cancel: CancelIcon,
  export: ExportIcon,
  new: NewIcon,
  nextFrame: NextFrameIcon,
};

const SIZES = [16, 24, 32, 48] as const;

const props = defineProps<{
  icon: keyof typeof ICONS;
  size?: (typeof SIZES)[number];
}>();

const iconUrl = computed(() => ICONS[props.icon]);
</script>

<template>
  <i
    class="icon inline-block h-4 w-4"
    :style="{ '--icon': `url(&quot;${iconUrl}&quot;)`, '--size': `${size ?? 16}px` }"></i>
</template>

<style scoped>
.icon {
  background-image: var(--icon);
  background-size: 100%;
  width: var(--size);
  height: var(--size);
}
</style>
