import { ref } from "vue";
import { defineStore } from "pinia";
import type { CompletionOptions as LlamaCppCompletionOptions } from "@/lib/llm";
import { z } from "zod";

export const GenerationParametersSchema = z.object({
  temperature: z.number().min(0.0),
  topK: z.nullable(z.number().min(0.0)),
  minP: z.nullable(z.number().min(0.0).max(1.0), z.null()),
  mirostat: z.nullable(
    z.object({
      version: z.union([z.literal(1), z.literal(2)]),
      learningRate: z.number().min(0.0),
      targetEntropy: z.number().min(0.0),
    })
  ),
  seed: z.nullable(z.number().int()),
  repetitionPenalty: z.nullable(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("whole_context"),
        penalty: z.number(),
        penalizeNewlines: z.boolean(),
      }),
      z.object({
        type: z.literal("last_n_tokens"),
        lastNTokens: z.number(),
        penalty: z.number(),
        penalizeNewlines: z.boolean(),
      }),
    ])
  ),
});

export type GenerationParameters = z.infer<typeof GenerationParametersSchema>;

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
