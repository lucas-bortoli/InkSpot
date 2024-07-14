import { GenerationParametersSchema } from "@/stores/generationParameters";
import { Logger } from "./logger";
import { z } from "zod";
import { saveFile } from "./file_io";

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

export function saveProject(project: Project) {
  return JSON.stringify(project, null, "\t");
}

export async function exportProjectHtml(content: string) {
  const css = `
      <style>
          body {
              font-family: 'Georgia', serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              color: #333;
          }
          h1, h2, h3, h4, h5, h6 {
              font-family: 'Merriweather', serif;
              margin: 1.5em 0 0.5em;
              color: #2c3e50;
          }
          p {
              margin: 1em 0;
              text-align: justify;
          }
          blockquote {
              font-style: italic;
              margin: 1em 0;
              padding: 0.5em 10px;
              border-left: 5px solid #ccc;
              color: #555;
          }
          a {
              color: #3498db;
              text-decoration: none;
          }
          a:hover {
              text-decoration: underline;
          }
      </style>
  `;

  const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          ${css}
      </head>
      <body>
          ${content
            .split("\n")
            .map((line) => `<p>${line}</p>`)
            .join("")}
      </body>
      </html>
  `;

  return await saveFile("current_export", htmlContent, "Document.html", {
    friendlyName: "HTML document",
    extension: ".html",
    mimeType: "text/html",
  });
}
