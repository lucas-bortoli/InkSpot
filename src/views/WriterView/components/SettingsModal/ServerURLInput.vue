<script setup lang="ts">
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import * as llm from "@/lib/llm.js";
import { debounceWatch, isValidUrl } from "@/lib/utils";
import { ref } from "vue";

const serverUrl = defineModel<string>();

const previousValidationRequest = ref<AbortController | null>(null);
const validation = ref<"VALID" | "TESTING" | "INVALID">("VALID");
debounceWatch(
  serverUrl,
  async () => {
    const abortController = new AbortController();

    previousValidationRequest.value?.abort();
    previousValidationRequest.value = abortController;

    validation.value = "TESTING";

    let validUrl = isValidUrl(serverUrl.value!);

    if (validUrl) {
      validUrl = await llm.testServer(serverUrl.value ?? "", abortController.signal);

      // The test may have taken a while and the user typed another URL in the meantime. This result is outdated.
      if (abortController.signal.aborted) return;
    }

    validation.value = validUrl ? "VALID" : "INVALID";
  },
  200
);
</script>

<template>
  <div class="col-span-full flex flex-col gap-2 p-4 pb-0">
    <Label class="flex items-start gap-2">
      <span class="grow">llamafile Server URL</span>
      <span class="text-zinc-500" v-if="validation === 'TESTING'">Testing...</span>
      <span class="text-zinc-500" v-else-if="validation === 'VALID'">Valid URL</span>
      <span class="text-red-600" v-else>Invalid URL</span>
    </Label>
    <Input type="url" v-model="serverUrl" />
  </div>
</template>
