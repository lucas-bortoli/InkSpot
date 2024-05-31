<script setup lang="ts">
import ChildWindow from "@/components/ChildWindow/ChildWindow.vue";
import Slider from "@/components/ui/slider/Slider.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import { ref, watchEffect } from "vue";
import Label from "@/components/ui/label/Label.vue";
import Input from "@/components/ui/input/Input.vue";
import RadioGroup from "@/components/ui/radio-group/RadioGroup.vue";
import RadioGroupItem from "@/components/ui/radio-group/RadioGroupItem.vue";
import IconElement from "@/components/IconElement.vue";
import {
  useGenerationParametersStore,
  type GenerationParameters,
} from "@/stores/generationParameters";
import Accordion from "@/components/ui/accordion/Accordion.vue";
import AccordionItem from "@/components/ui/accordion/AccordionItem.vue";
import AccordionTrigger from "@/components/ui/accordion/AccordionTrigger.vue";
import AccordionContent from "@/components/ui/accordion/AccordionContent.vue";

defineEmits<{
  (e: "close"): void;
}>();

const paramsStore = useGenerationParametersStore();

const visibleSections = ref<("sampling" | "repetition")[]>(["sampling", "repetition"]);

// These initial values don't matter, we immediately override them
const temperature = ref([0.6]);
const topK = ref([40]);
const minP = ref([0.05]);
const mirostat = ref<[0 | 1 | 2]>([2]);
const mirostatEta = ref([0.1]);
const mirostatTau = ref([5.0]);
const seed = ref(Date.now());
const repetitionPenalty = ref([1.1]);
const repetitionPenaltyLastN = ref([64]);
const repPenalizeNewline = ref(true);

// Initially, use use values from store in the UI
setValues(paramsStore.parameters);

function setValues(vals: GenerationParameters) {
  paramsStore.parameters = vals;
  temperature.value = [vals.temperature];
  topK.value = [vals.topK ?? 0];
  minP.value = [vals.minP ?? 0];
  mirostat.value = [vals.mirostat?.version ?? 0];
  mirostatEta.value = [vals.mirostat?.learningRate ?? 0.1];
  mirostatTau.value = [vals.mirostat?.targetEntropy ?? 5.0];
  seed.value = vals.seed ?? -1;
  repetitionPenalty.value = [vals.repetitionPenalty?.penalty ?? 1.1];
  repetitionPenaltyLastN.value = (() => {
    if (vals.repetitionPenalty === null) return [0];
    if (vals.repetitionPenalty.type === "whole_context") return [-1];
    return [vals.repetitionPenalty.lastNTokens];
  })();
  repPenalizeNewline.value = vals.repetitionPenalty?.penalizeNewlines ?? true;
}

// Sync values with the store when the UI changes
// We don't use the store directly in the component because shadcn sliders expect an array for their v-model value
watchEffect(() => {
  const newParams: GenerationParameters = {
    temperature: temperature.value[0],
    topK: topK.value[0] === 0 ? null : topK.value[0],
    minP: minP.value[0] === 0 ? null : minP.value[0],
    mirostat:
      mirostat.value[0] === 0
        ? null
        : {
            version: mirostat.value[0],
            learningRate: mirostatEta.value[0],
            targetEntropy: mirostatTau.value[0],
          },
    repetitionPenalty: (() => {
      // unconditionally access the values so Vue can react to them in this watcher
      const penalty = repetitionPenalty.value[0];
      const lastNTokens = repetitionPenaltyLastN.value[0];
      const penalizeNewlines = repPenalizeNewline.value;

      switch (lastNTokens) {
        case 0:
          return null;
        case -1:
          return {
            type: "whole_context",
            penalty,
            penalizeNewlines,
          };
        default:
          return {
            type: "last_n_tokens",
            lastNTokens,
            penalty,
            penalizeNewlines,
          };
      }
    })(),
    seed: seed.value === -1 ? null : seed.value,
  };

  paramsStore.parameters = newParams;
});
</script>

<template>
  <ChildWindow
    :min-width="410"
    :min-height="400"
    :max-width="480"
    :max-height="570"
    @close="$emit('close')"
  >
    <template #icon>
      <IconElement icon="settings" />
    </template>
    <template #extra-buttons>
      <button
        class="flex items-center justify-center rounded-lg bg-zinc-200 p-1"
        @click="setValues(paramsStore.defaultParameters)"
        title="Reset values"
      >
        <IconElement icon="reloadXml" />
      </button>
    </template>
    <template #title> Set up generation parameters </template>
    <template #default>
      <form @submit="() => false">
        <Accordion type="multiple" class="w-full px-4" v-model="visibleSections">
          <AccordionItem value="sampling">
            <AccordionTrigger>Sampling</AccordionTrigger>
            <AccordionContent class="grid select-none grid-cols-2 gap-x-4 gap-y-6">
              <div class="col-span-full flex flex-col gap-2">
                <Label class="flex items-start gap-2">
                  <span class="grow">Temperature</span>
                  <span class="text-zinc-500">{{ temperature[0].toFixed(2) }}</span>
                </Label>
                <Slider v-model="temperature" :min="0" :max="2.0" :step="0.01" />
              </div>
              <div class="flex flex-col gap-2">
                <Label class="flex items-start gap-2">
                  <Checkbox
                    :checked="topK[0] !== 0"
                    @update:checked="(e) => (topK = [e ? 40 : 0])"
                  />
                  <span class="grow">Top-K sampling</span>
                  <span class="text-zinc-500" v-if="topK[0] !== 0">{{ topK[0] }}</span>
                </Label>
                <Slider v-if="topK[0] !== 0" v-model="topK" :min="1" :max="100" :step="1" />
              </div>
              <div class="flex flex-col gap-2">
                <Label class="flex items-start gap-2">
                  <Checkbox
                    :checked="minP[0] !== 0.0"
                    @update:checked="(e) => (minP = [e ? 0.05 : 0])"
                  />
                  <span class="grow">Min-P sampling</span>
                  <span class="text-zinc-500" v-if="minP[0] !== 0">{{ minP[0].toFixed(2) }}</span>
                </Label>
                <Slider v-if="minP[0] !== 0" v-model="minP" :min="0.01" :max="1" :step="0.01" />
              </div>
              <div class="col-span-full grid grid-cols-2 gap-2 gap-x-4">
                <Label class="flex items-start gap-2">
                  <Checkbox
                    :checked="mirostat[0] !== 0"
                    @update:checked="(e) => (mirostat = [e ? 2 : 0])"
                  />
                  <span class="grow">Mirostat sampling</span>
                </Label>
                <RadioGroup
                  v-if="mirostat[0] !== 0"
                  @update:modelValue="(e) => (mirostat = [parseInt(e) as 1 | 2])"
                  :model-value="mirostat[0].toString()"
                >
                  <Label class="flex items-start gap-2">
                    <RadioGroupItem id="mirostat-1" value="1" />
                    <span class="grow">Mirostat</span>
                  </Label>
                  <Label class="flex items-start gap-2">
                    <RadioGroupItem id="mirostat-2" value="2" />
                    <span class="grow">Mirostat 2.0</span>
                  </Label>
                </RadioGroup>
                <div class="flex flex-col gap-2" v-if="mirostat[0] !== 0">
                  <Label class="flex items-start gap-2">
                    <span class="grow">Learning rate (eta)</span>
                    <span class="text-zinc-500">{{ mirostatEta[0].toFixed(2) }}</span>
                  </Label>
                  <Slider v-model="mirostatEta" :min="0.01" :max="1.0" :step="0.01" />
                </div>
                <div class="flex flex-col gap-2" v-if="mirostat[0] !== 0">
                  <Label class="flex items-start gap-2">
                    <span class="grow">Target entropy (tau)</span>
                    <span class="text-zinc-500">{{ mirostatTau[0].toFixed(2) }}</span>
                  </Label>
                  <Slider v-model="mirostatTau" :min="0.01" :max="8.0" :step="0.01" />
                </div>
              </div>
              <div class="col-span-full flex flex-col gap-2">
                <Label class="flex items-start gap-2">
                  <Checkbox
                    :checked="seed !== -1"
                    @update:checked="(e) => (seed = e ? Date.now() : -1)"
                  />
                  <span class="grow">Use a predetermined RNG seed</span>
                </Label>
                <Input
                  type="number"
                  v-if="seed !== -1"
                  v-model="seed"
                  :min="0"
                  :max="999999999999999"
                  :step="1"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="repetition">
            <AccordionTrigger>Repetition parameters</AccordionTrigger>
            <AccordionContent class="grid select-none grid-cols-2 gap-x-4 gap-y-6">
              <div class="col-span-full flex flex-col gap-2">
                <Label class="flex items-start gap-2">
                  <Checkbox
                    :checked="repetitionPenaltyLastN[0] !== 0"
                    @update:checked="(e) => (repetitionPenaltyLastN = [e ? 64 : 0])"
                  />
                  <span class="grow">Repetition penalty</span>
                  <span class="text-zinc-500" v-if="repetitionPenaltyLastN[0] !== 0">{{
                    repetitionPenalty[0].toFixed(2)
                  }}</span>
                </Label>
                <Slider
                  v-if="repetitionPenaltyLastN[0] !== 0"
                  v-model="repetitionPenalty"
                  :min="0.01"
                  :max="4.0"
                  :step="0.01"
                />
              </div>
              <div v-if="repetitionPenaltyLastN[0] !== 0" class="col-span-full flex flex-col gap-2">
                <RadioGroup
                  @update:modelValue="(e) => (repetitionPenaltyLastN = [e === 'last-n' ? 64 : -1])"
                  :model-value="repetitionPenaltyLastN[0] === -1 ? 'whole-context' : 'last-n'"
                >
                  <Label class="flex items-start gap-2">
                    <RadioGroupItem id="option-one" value="whole-context" />
                    <span class="grow">... considering the whole context</span>
                  </Label>
                  <Label class="flex items-start gap-2">
                    <RadioGroupItem id="option-one" value="last-n" />
                    <span class="grow">... considering the last N tokens</span>
                    <span class="text-zinc-500" v-if="repetitionPenaltyLastN[0] !== -1"
                      >{{ repetitionPenaltyLastN[0] }} tokens</span
                    >
                  </Label>
                </RadioGroup>
                <Slider
                  v-if="repetitionPenaltyLastN[0] !== -1"
                  v-model="repetitionPenaltyLastN"
                  :min="1"
                  :max="512"
                  :step="8"
                />
              </div>
              <div v-if="repetitionPenaltyLastN[0] !== 0" class="col-span-full flex flex-col gap-2">
                <Label class="flex items-start gap-2">
                  <!-- v-model doesn't work for this, for some reason -->
                  <Checkbox
                    :checked="repPenalizeNewline"
                    @update:checked="(v) => (repPenalizeNewline = v)"
                  />
                  <span class="grow">Penalize newlines</span>
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </template>
  </ChildWindow>
</template>
