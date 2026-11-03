import "server-only";
import { McpServer } from "@modelcontextprotocol/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { toFieldErrors } from "@/lib/form-errors";
import {
  GARDEN_TOOL_NAME_MAXIMUM_LENGTH,
  GARDEN_TOOL_NOTES_MAXIMUM_LENGTH,
  gardenToolFormSchema,
} from "@/lib/garden-tool-schema";
import { errorResult, textResult } from "@/lib/mcp/tool-results";
import { prisma } from "@/lib/prisma";

const MAXIMUM_GARDEN_TOOLS_PER_CALL = 50;

const gardenToolInputSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(GARDEN_TOOL_NAME_MAXIMUM_LENGTH)
    .describe("Tool name in French, e.g. « Sécateur à lame franche »."),
  notes: z
    .string()
    .max(GARDEN_TOOL_NOTES_MAXIMUM_LENGTH)
    .optional()
    .describe("Brand, size, condition or other details, in French. Only what the user said."),
});

export const registerGardenToolTools = (server: McpServer, origin: string) => {
  const toolsPageUrl = `${origin}/tools`;

  server.registerTool(
    "list_garden_tools",
    {
      title: "Lister les outils de jardinage",
      description:
        "List the gardening tools the user owns. Call it whenever the user asks how to do a garden task or which tool to use, and before add_garden_tools to avoid duplicates.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => {
      const gardenTools = await prisma.gardenTool.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, notes: true },
      });
      return textResult({ gardenTools, url: toolsPageUrl });
    },
  );

  server.registerTool(
    "add_garden_tools",
    {
      title: "Ajouter des outils de jardinage",
      description:
        "Add gardening tools to the user's inventory. Only add tools the user says they own. Write all text in French.",
      inputSchema: z.object({
        gardenTools: z.array(gardenToolInputSchema).min(1).max(MAXIMUM_GARDEN_TOOLS_PER_CALL),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ gardenTools }) => {
      const result = z
        .array(gardenToolFormSchema)
        .safeParse(gardenTools.map((tool) => ({ ...tool, notes: tool.notes ?? "" })));
      if (!result.success) {
        return errorResult("Invalid gardening tools.", toFieldErrors(result.error));
      }

      await prisma.gardenTool.createMany({ data: result.data });
      revalidatePath("/tools");
      return textResult({ addedGardenToolCount: result.data.length, url: toolsPageUrl });
    },
  );
};
