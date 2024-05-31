import { ref } from "vue";
import { defineStore } from "pinia";

export interface GenerationParameters {
  temperature: number;
  topK: number | null;
  minP: number | null;
  mirostat: {
    version: 1 | 2;
    learningRate: number;
    targetEntropy: number;
  } | null;
  seed: number | null;
  repetitionPenalty:
    | { type: "whole_context"; penalty: number; penalizeNewlines: boolean }
    | { type: "last_n_tokens"; lastNTokens: number; penalty: number; penalizeNewlines: boolean }
    | null;
}

export const useGenerationParametersStore = defineStore("generation_parameters", () => {
  const defaultParameters: GenerationParameters = {
    temperature: 0.6,
    topK: 40,
    minP: null,
    repetitionPenalty: {
      type: "last_n_tokens",
      lastNTokens: 64,
      penalty: 1.1,
      penalizeNewlines: true,
    },
    seed: null,
    mirostat: null,
  };

  const parameters = ref<GenerationParameters>(defaultParameters);

  return { defaultParameters, parameters };
});
