/**
 * Tool dependency management and validation
 */
export function detectCircularDependency(findToolByName, toolName, visited = new Set()) {
  if (visited.has(toolName)) return true;
  visited.add(toolName);

  const tool = findToolByName(toolName);
  if (!tool || !tool.dependencies) return false;

  for (const dep of tool.dependencies) {
    if (detectCircularDependency(findToolByName, dep, new Set(visited))) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve tool dependencies in order
 */
export function resolveDependencyOrder(findToolByName, toolName, resolved = [], visiting = new Set()) {
  if (visiting.has(toolName)) return null;

  if (resolved.includes(toolName)) return resolved;

  visiting.add(toolName);
  const tool = findToolByName(toolName);
  if (!tool) return null;

  const deps = tool.dependencies || [];
  for (const dep of deps) {
    const result = resolveDependencyOrder(findToolByName, dep, resolved, new Set(visiting));
    if (!result) return null;
    resolved = result;
  }

  resolved.push(toolName);
  return resolved;
}

/**
 * Validate tool chain for circular dependencies and valid ordering
 */
export function validateToolChain(findToolByName, toolName) {
  const isCircular = detectCircularDependency(findToolByName, toolName);
  if (isCircular) {
    return { isValid: false, circular: true, order: null, error: `Circular dependency detected in ${toolName}` };
  }

  const order = resolveDependencyOrder(findToolByName, toolName);
  if (!order) {
    return { isValid: false, circular: false, order: null, error: `Failed to resolve dependencies for ${toolName}` };
  }

  return { isValid: true, circular: false, order };
}

/**
 * Get tool dependencies
 */
export function getToolDependencies(findToolByName, toolName) {
  const tool = findToolByName(toolName);
  if (!tool) return null;
  return tool.dependencies || [];
}
