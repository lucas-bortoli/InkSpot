<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button.vue";
import ServerURLInput from "./ServerURLInput.vue";
import { ref, watch } from "vue";
import { getSettings, setSettings } from "@/lib/settings";
import { useToast } from "@/components/ui/toast";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "dismiss"): void;
}>();

const { toast } = useToast();

const serverUrl = ref("");

// When opening or closing the modal, reload config values
watch(
  () => props.open,
  () => {
    const settings = getSettings();
    serverUrl.value = settings.serverUrl;
  }
);

function confirmChanges() {
  setSettings((previous) => ({ ...previous, serverUrl: serverUrl.value }));

  emit("dismiss");

  toast({
    title: "Settings saved",
  });
}
</script>

<template>
  <Dialog :open="open" @update:open="(o) => (o === false ? $emit('dismiss') : 0)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit app settings</DialogTitle>
        <DialogDescription>
          Adjust the settings for InkSpot to match your preferences and improve your writing
          experience. Click confirm when you're done.
        </DialogDescription>
      </DialogHeader>
      <ServerURLInput v-model="serverUrl" />
      <DialogFooter>
        <Button type="submit" @click="confirmChanges">Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
