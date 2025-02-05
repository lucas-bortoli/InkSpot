import { Logger } from "./logger";
import type z from "zod";
import { fetchEventSource } from "@microsoft/fetch-event-source";

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

/**
 * Requests a text completion from the language model server.
 * @param options Generation parameters options
 * @param serverUrl Server to contact for generating the completion
 * @param signal Optional AbortSignal for canceling the request
 * @returns The resulting completion string
 */
export async function requestCompletion(
  options: CompletionOptions,
  serverUrl: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    logger.debug("Requesting completion", options);

    const tokens: string[] = [];

    await fetchEventSource(`${serverUrl}/completion`, {
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
      onmessage({ data }) {
        const { content } = JSON.parse(data) as { content: string };

        if (content) {
          tokens.push(content);

          if (options.onToken) {
            options.onToken(content);
          }
        }
      },
    });

    logger.info("Response:", tokens.join(""));

    return tokens.join("");
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      logger.info("Request aborted");
      return "";
    } else {
      throw error;
    }
  }
}

/**
 * Returns the number of tokens in a query.
 * @param input - The input to be tokenized.
 * @returns - The amount of tokens in `query`.
 */
export async function countTokens(
  input: string,
  serverUrl: string,
  options?: {
    signal?: AbortSignal;
    considerEosToken?: boolean;
  }
): Promise<number> {
  const response = await fetch(`${serverUrl}/tokenize`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ content: input, add_special: options?.considerEosToken ?? false }),
    signal: options?.signal,
  }).then((r) => r.json());

  return response.tokens.length;
}

/**
 * Tests if the server is responsive.
 */
export async function testServer(serverUrl: string, signal?: AbortSignal) {
  try {
    // Send an easy tokenization request. If the result is successful, the server is alive.
    await fetch(`${serverUrl}/tokenize`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ content: "" }),
      signal: signal,
    }).then((r) => r.json());

    return true;
  } catch (error) {
    return false;
  }
}

export async function promptChain(
  generations: ((previousOutput: string) => CompletionOptions | Promise<CompletionOptions>)[],
  serverUrl: string
) {
  const chainLogger = logger.local("promptChain");
  let previousOutput = "";

  for (let i = 0; i < generations.length; i++) {
    chainLogger.info(`Chain: ${i + 1}/${generations.length}`);
    const generation = generations[i];
    previousOutput = await requestCompletion(await generation(previousOutput), serverUrl);
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
  serverUrl: string,
  options?: {
    considerEosToken?: boolean;
  }
) {
  const counts: number[] = [];

  for (const input of inputs) {
    counts.push(await countTokens(input, serverUrl, options));
  }

  return counts;
}
