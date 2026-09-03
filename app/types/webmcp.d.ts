interface WebMcpTool<Input extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: {
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
    openWorldHint?: boolean
  }
  execute: (input: Input) => Promise<unknown> | unknown
}

interface DocumentModelContext {
  registerTool: (tool: WebMcpTool) => Promise<void>
}

interface Document {
  modelContext?: DocumentModelContext
}
