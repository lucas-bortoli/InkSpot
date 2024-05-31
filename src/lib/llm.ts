import { Logger } from "./logger";
import type z from "zod";

const LLAMAFILE_SERVER = "http://pathfinder:5003";
const logger = new Logger("llm");

export interface CompletionOptions {
  prompt: string;
  temperature?: number;
  dynatemp_range?: number;
  dynatemp_exponent?: number;
  top_k?: number;
  top_p?: number;
  min_p?: number;
  n_predict?: number;
  n_keep?: number;
  stop?: string[];
  tfs_z?: number;
  typical_p?: number;
  repeat_penalty?: number;
  repeat_last_n?: number;
  penalize_nl?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
  penalty_prompt?: string | number[] | null;
  mirostat?: number;
  mirostat_tau?: number;
  mirostat_eta?: number;
  grammar?: string;
  /*json_schema?: Record<string, any>;*/
  seed?: number;
  ignore_eos?: boolean;
  logit_bias?: Array<[number | string, number | boolean]>;
  n_probs?: number;
  min_keep?: number;
  image_data?: Array<{ data: string; id: number }>;
  id_slot?: number;
  system_prompt?: string;
  samplers?: string[];
  onToken?: (token: string) => void;
}

class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing: boolean = false;

  add(task: () => Promise<void>) {
    this.queue.push(task);
    this.processQueue();
  }

  private async processQueue() {
    //if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      try {
        await task();
      } catch (error) {
        console.error("Error processing task:", error);
      }
    }

    this.isProcessing = false;
  }
}

const queue = new RequestQueue();

export async function requestCompletion(
  options: CompletionOptions,
  signal?: AbortSignal
): Promise<string> {
  return new Promise((resolve, reject) => {
    queue.add(async () => {
      try {
        logger.debug("Requesting completion", options);

        const response = await fetch(`${LLAMAFILE_SERVER}/completion`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stream: true,
            cache_prompt: true,
            ...options,
          }),
          signal,
        });

        const stream = response.body!;
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        const tokens: string[] = [];

        let rawChunk: ReadableStreamReadResult<Uint8Array>;
        while (!(rawChunk = await reader.read()).done) {
          const lines = decoder.decode(rawChunk.value).split("\n");
          for (let line of lines) {
            if (!line.startsWith("data: ")) continue;
            line = line.replace(/^data: /, "");

            const { content } = JSON.parse(line) as { content: string };

            if (content) {
              tokens.push(content);

              if (options.onToken) {
                options.onToken(content);
              }
            }
          }
        }

        logger.info("Response:", tokens.join(""));

        resolve(tokens.join(""));
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          logger.info("Request aborted");
        } else {
          reject(error);
        }
      }
    });
  });
}

/**
 * Returns the number of tokens in a query.
 * @param input - The input to be tokenized.
 * @returns - The amount of tokens in `query`.
 */
export async function countTokens(
  input: string,
  options?: {
    considerEosToken?: boolean;
  }
): Promise<number> {
  return new Promise((resolve, reject) => {
    queue.add(async () => {
      try {
        const response = await fetch(`${LLAMAFILE_SERVER}/tokenize`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ content: input, add_special: options?.considerEosToken ?? false }),
        }).then((r) => r.json());

        resolve(response.tokens.length);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function createEmbedding(input: string) {
  return new Promise((resolve, reject) => {
    queue.add(async () => {
      const localLogger = logger.local("createEmbedding");
      try {
        const response = await fetch(`${LLAMAFILE_SERVER}/embedding`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ content: input }),
        }).then((r) => r.json());

        resolve(new Float32Array(response.embedding as number[]));
      } catch (exception) {
        if ((exception as Error).name === "NetworkError") {
          localLogger.error("Embedding creation failed with a NetworkError:", exception);
          localLogger.error("... Since it's a NetworkError, I'm trying again...");
          resolve(await createEmbedding(input));
        }

        localLogger.error("Embedding creation failed with an unknown error:", exception);
        reject(exception);
      }
    });
  });
}

export async function promptChain(
  generations: ((previousOutput: string) => CompletionOptions | Promise<CompletionOptions>)[]
) {
  const chainLogger = logger.local("promptChain");
  let previousOutput = "";

  for (let i = 0; i < generations.length; i++) {
    chainLogger.info(`Chain: ${i + 1}/${generations.length}`);
    const generation = generations[i];
    previousOutput = await requestCompletion(await generation(previousOutput));
  }

  return previousOutput;
}

export async function parseJsonFromOutput<Schema extends z.Schema>(
  responseFactory: () => Promise<string>,
  schema: Schema
): Promise<z.infer<Schema>> {
  const localLogger = logger.local("parseJsonFromOutput");

  for (let i = 0; i <= 2; i++) {
    try {
      const llmOutput = await responseFactory();
      const topLevelObject = llmOutput.match(/({.+}|\[.+\])/s)?.[0];

      if (!topLevelObject) {
        throw new Error("Failed to extract top-level JSON object");
      }

      const object = JSON.parse(topLevelObject);
      const result = await schema.parseAsync(object);

      return result;
    } catch (exception) {
      localLogger.error("Failed to parse JSON from model output:", exception);
    }
  }

  throw new Error("Unable to parse model output, exhausted all tries.");
}

export async function countTokensSequential(
  inputs: string[],
  options?: {
    considerEosToken?: boolean;
  }
) {
  const counts: number[] = [];

  for (const input of inputs) {
    counts.push(await countTokens(input, options));
  }

  return counts;
}
