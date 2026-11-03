import "server-only";

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

export const textResult = (value: unknown): ToolResult => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
});

export const errorResult = (message: string, details?: Record<string, string>): ToolResult => ({
  content: [
    {
      type: "text",
      text: details ? `${message}\n${JSON.stringify(details, null, 2)}` : message,
    },
  ],
  isError: true,
});
