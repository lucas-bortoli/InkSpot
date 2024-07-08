import { ref } from "vue";
import { defineStore } from "pinia";
import type { CompletionOptions as LlamaCppCompletionOptions } from "@/lib/llm";

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

export type GenerationPreset = "technical" | "creative";
export const GENERATION_PRESETS: { [key in GenerationPreset]: GenerationParameters } = {
  technical: {
    temperature: 0.7,
    minP: 0.05,
    mirostat: null,
    repetitionPenalty: null,
    seed: null,
    topK: 30,
  },
  creative: {
    temperature: 1.15,
    minP: 0.1,
    mirostat: null,
    seed: null,
    repetitionPenalty: null,
    topK: 60,
  },
};

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
  const paramsKey = ref([Date.now()]);

  function formatToApi(params: GenerationParameters): Omit<LlamaCppCompletionOptions, "prompt"> {
    return {
      temperature: params.temperature,
      top_k: params.topK ?? 0,
      min_p: params.minP ?? 0,
      mirostat: params.mirostat?.version ?? 0,
      mirostat_eta: params.mirostat?.learningRate,
      mirostat_tau: params.mirostat?.targetEntropy,
      seed: params.seed ?? -1,
      repeat_penalty: params.repetitionPenalty?.penalty ?? 1.1,
      repeat_last_n: (() => {
        switch (params.repetitionPenalty?.type) {
          case "last_n_tokens":
            return params.repetitionPenalty.lastNTokens;
          case "whole_context":
            return -1;
          default:
            // disabled repetition penalty
            return 0;
        }
      })(),
      penalize_nl: params.repetitionPenalty?.penalizeNewlines ?? false,
    };
  }

  return { defaultParameters, parameters, paramsKey, formatToApi };
});
