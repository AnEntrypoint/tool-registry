/**
 * schema-retrieval.js - Tool schema retrieval
 *
 * Gets and validates tool schema by name and version
 */

export function getToolSchema(findToolByName, toolName, version = null) {
  const tool = findToolByName(toolName);
  if (!tool) return null;

  if (!tool.mcp || !tool.mcp.inputSchema) {
    return null;
  }

  const schema = tool.mcp.inputSchema;
  if (!version) return schema;

  return schema.version === version ? schema : null;
}
