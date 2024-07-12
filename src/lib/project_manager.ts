import { GenerationParametersSchema } from "@/stores/generationParameters";
import { Logger } from "./logger";
import { z } from "zod";

export const ProjectSchema = z.object({
  generationParameters: GenerationParametersSchema,
  content: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

const logger = new Logger("ProjectManager");

export const PROJECT_MIME = "application/vnd.inkspot+json";
export const PROJECT_TYPE_FRIENDLY = "Inkfile";
export const PROJECT_EXTENSION = ".inkfile";

export function loadProject(arbitrary: string): Project {
  try {
    const project = ProjectSchema.parse(JSON.parse(arbitrary));

    return project;
  } catch (exception) {
    logger.error("Unable to parse project:", exception);
    throw exception;
  }
}

export function exportProject(project: Project) {
  return JSON.stringify(project, null, "\t");
}
