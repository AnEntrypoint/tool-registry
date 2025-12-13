/**
 * Tool persistence operations for repository integration
 */
export async function loadPersistedTools(tools, repository) {
  if (!repository) return;

  try {
    const persistedTools = await repository.getAll();
    persistedTools.forEach(tool => {
      const key = `__persisted:${tool.id}`;
      tools.set(key, {
        id: tool.id,
        name: tool.name,
        description: tool.description || '',
        category: tool.category || 'Custom',
        implementation: tool.implementation,
        imports: tool.imports,
        isPersisted: true,
        appId: '__persisted',
        handler: null,
        mcp: {
          type: 'tool',
          name: tool.name,
          description: tool.description || '',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      });
    });
  } catch (err) {
    console.error('Failed to load persisted tools:', err);
  }
}

/**
 * Save tool to repository
 */
export async function saveTool(tools, repository, toolData) {
  if (!repository) {
    throw new Error('No repository configured for tool persistence');
  }
  const id = toolData.id || toolData.name.toLowerCase().replace(/\s+/g, '-');
  await repository.save(id, toolData);

  const key = `__persisted:${id}`;
  tools.set(key, {
    id,
    name: toolData.name,
    description: toolData.description || '',
    category: toolData.category || 'Custom',
    implementation: toolData.implementation,
    imports: toolData.imports,
    isPersisted: true,
    appId: '__persisted',
    handler: null,
    createdAt: toolData.createdAt,
    updatedAt: toolData.updatedAt
  });
  return id;
}

/**
 * Delete tool from repository
 */
export async function deleteTool(tools, repository, toolId) {
  if (!repository) {
    throw new Error('No repository configured for tool persistence');
  }
  await repository.delete(toolId);
  const key = `__persisted:${toolId}`;
  tools.delete(key);
}

/**
 * Get persisted tools
 */
export function getPersistedTools(tools) {
  return Array.from(tools.entries())
    .filter(([key]) => key.startsWith('__persisted:'))
    .map(([, tool]) => tool);
}
