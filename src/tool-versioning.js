/**
 * Tool schema versioning and migrations
 */
export function registerSchemaVersion(findToolByName, toolName, version, schema, changelog = []) {
  const tool = findToolByName(toolName);
  if (!tool) return { success: false, error: 'Tool not found' };

  if (!tool.mcp) tool.mcp = {};
  if (!tool.schemaHistory) tool.schemaHistory = [];

  const existingSchema = tool.mcp.inputSchema;
  if (existingSchema) {
    tool.schemaHistory.push({
      version: existingSchema.version || 1,
      schema: existingSchema,
      timestamp: Date.now()
    });
  }

  tool.mcp.inputSchema = {
    ...schema,
    version,
    changelog,
    timestamp: Date.now()
  };

  return { success: true, version };
}

/**
 * Migrate tool input between schema versions
 */
export function migrateToolInput(findToolByName, toolName, input, fromVersion, toVersion) {
  const tool = findToolByName(toolName);
  if (!tool) return { success: false, error: 'Tool not found' };

  if (!tool.migrations) {
    return { success: false, error: 'No migrations defined for tool' };
  }

  const migrationKey = `${fromVersion}->${toVersion}`;
  const migration = tool.migrations[migrationKey];

  if (!migration) {
    return { success: false, error: `No migration path from ${fromVersion} to ${toVersion}` };
  }

  try {
    const migratedInput = typeof migration === 'function' ? migration(input) : input;
    return { success: true, data: migratedInput };
  } catch (err) {
    return { success: false, error: `Migration failed: ${err.message}` };
  }
}
