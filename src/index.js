import * as persistence from './tool-persistence.js';
import * as lookup from './tool-lookup.js';
import * as dependencies from './tool-dependencies.js';
import * as validation from './tool-validation.js';
import * as versioning from './tool-versioning.js';
import * as coercion from './tool-coercion.js';

/**
 * Facade maintaining 100% backward compatibility with ToolRegistry
 */
export class ToolRegistry {
  static instance = null;

  constructor(repository = null) {
    this.apps = new Map();
    this.tools = new Map();
    this.repository = repository;
    this.persistedToolsLoaded = false;
  }

  static getInstance(repository = null) {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry(repository);
    } else if (repository && !ToolRegistry.instance.repository) {
      ToolRegistry.instance.repository = repository;
    }
    return ToolRegistry.instance;
  }

  async loadPersistedTools() {
    if (this.persistedToolsLoaded || !this.repository) return;
    await persistence.loadPersistedTools(this.tools, this.repository);
    this.persistedToolsLoaded = true;
  }

  async saveTool(toolData) {
    return await persistence.saveTool(this.tools, this.repository, toolData);
  }

  async deleteTool(toolId) {
    return await persistence.deleteTool(this.tools, this.repository, toolId);
  }

  registerApp(appId, sdk) {
    this.apps.set(appId, {
      id: appId,
      sdk,
      tools: sdk.getTools ? sdk.getTools() : [],
      registered: Date.now()
    });

    sdk.getTools?.().forEach(tool => {
      const key = `${appId}:${tool.name}`;
      this.tools.set(key, {
        appId,
        name: tool.name,
        description: tool.description,
        mcp: tool.mcp,
        handler: tool.handler,
        isPersisted: false
      });
    });
  }

  unregisterApp(appId) {
    this.apps.delete(appId);
    const keysToDelete = Array.from(this.tools.keys())
      .filter(k => k.startsWith(`${appId}:`));
    keysToDelete.forEach(k => this.tools.delete(k));
  }

  getAppTools(appId) {
    return lookup.getAppTools(this.apps, this.tools, appId);
  }

  getPersistedTools() {
    return persistence.getPersistedTools(this.tools);
  }

  getAllTools() {
    return lookup.getAllTools(this.tools);
  }

  getToolsByApp() {
    return lookup.getToolsByApp(this.apps, this.tools, () => this.getPersistedTools());
  }

  findTool(appId, toolName) {
    return lookup.findTool(this.tools, appId, toolName);
  }

  findToolByName(toolName) {
    return lookup.findToolByName(this.tools, toolName);
  }

  findToolsByName(toolName) {
    return lookup.findToolsByName(this.tools, toolName);
  }

  searchTools(query) {
    return lookup.searchTools(this.tools, query);
  }

  detectCircularDependency(toolName, visited) {
    return dependencies.detectCircularDependency(
      this.findToolByName.bind(this),
      toolName,
      visited
    );
  }

  resolveDependencyOrder(toolName, resolved, visiting) {
    return dependencies.resolveDependencyOrder(
      this.findToolByName.bind(this),
      toolName,
      resolved,
      visiting
    );
  }

  validateToolChain(toolName) {
    return dependencies.validateToolChain(
      this.findToolByName.bind(this),
      toolName
    );
  }

  getToolDependencies(toolName) {
    return dependencies.getToolDependencies(
      this.findToolByName.bind(this),
      toolName
    );
  }

  getToolSchema(toolName, version) {
    return validation.getToolSchema(this.findToolByName.bind(this), toolName, version);
  }

  validateToolInput(toolName, input, version) {
    return validation.validateToolInput(
      this.getToolSchema.bind(this),
      toolName,
      input,
      version
    );
  }

  registerSchemaVersion(toolName, version, schema, changelog) {
    return versioning.registerSchemaVersion(
      this.findToolByName.bind(this),
      toolName,
      version,
      schema,
      changelog
    );
  }

  migrateToolInput(toolName, input, fromVersion, toVersion) {
    return versioning.migrateToolInput(
      this.findToolByName.bind(this),
      toolName,
      input,
      fromVersion,
      toVersion
    );
  }

  validateType(value, expectedType) {
    return validation.validateType(value, expectedType);
  }

  validateConstraints(value, constraints) {
    return validation.validateConstraints(value, constraints);
  }

  validateInputProperty(value, property, fieldName) {
    return validation.validateInputProperty(
      value,
      property,
      fieldName,
      validation.validateType,
      validation.validateConstraints
    );
  }

  validateToolInputStrict(toolName, input) {
    return validation.validateToolInputStrict(
      this.findToolByName.bind(this),
      toolName,
      input
    );
  }

  coerceInputTypes(input, schema) {
    return coercion.coerceInputTypes(input, schema);
  }

  getStats() {
    const persistedCount = this.getPersistedTools().length;
    const appCount = this.apps.size;
    return {
      totalApps: appCount,
      totalTools: this.tools.size,
      persistedTools: persistedCount,
      appTools: this.tools.size - persistedCount,
      apps: Array.from(this.apps.entries()).map(([id, app]) => ({
        id,
        toolCount: this.getAppTools(id).length,
        registered: app.registered
      }))
    };
  }

  toJSON() {
    return {
      apps: Array.from(this.apps.keys()),
      tools: this.getToolsByApp(),
      stats: this.getStats()
    };
  }
}

export default ToolRegistry.getInstance();
