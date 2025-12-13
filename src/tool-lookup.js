/**
 * Tool discovery and lookup operations
 */
export function getAppTools(apps, tools, appId) {
  const app = apps.get(appId);
  if (!app) return [];
  return Array.from(tools.entries())
    .filter(([key]) => key.startsWith(`${appId}:`))
    .map(([, tool]) => tool);
}

/**
 * Get all tools grouped by app
 */
export function getToolsByApp(apps, tools, getPersistedTools) {
  const result = { __persisted: getPersistedTools() };
  apps.forEach((app, appId) => {
    result[appId] = getAppTools(apps, tools, appId);
  });
  return result;
}

/**
 * Find tool by app and name
 */
export function findTool(tools, appId, toolName) {
  if (appId === '__persisted') {
    const key = `__persisted:${toolName}`;
    return tools.get(key);
  }
  const key = `${appId}:${toolName}`;
  return tools.get(key);
}

/**
 * Find tool by name (search all apps)
 */
export function findToolByName(tools, toolName) {
  for (const [, tool] of tools.entries()) {
    if (tool.name === toolName || tool.id === toolName) {
      return tool;
    }
  }
  return null;
}

/**
 * Find all tools matching name
 */
export function findToolsByName(tools, toolName) {
  const matches = [];
  for (const [, tool] of tools.entries()) {
    if (tool.name === toolName || tool.id === toolName) {
      matches.push(tool);
    }
  }
  return matches;
}

/**
 * Search tools by query
 */
export function searchTools(tools, query) {
  const q = query.toLowerCase();
  return Array.from(tools.values()).filter(tool =>
    tool.name.toLowerCase().includes(q) ||
    tool.description?.toLowerCase().includes(q) ||
    tool.category?.toLowerCase().includes(q)
  );
}

/**
 * Get all tools
 */
export function getAllTools(tools) {
  return Array.from(tools.values());
}
