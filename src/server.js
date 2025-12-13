import { formatResponse, errorResponse } from '@sequentialos/response-formatting';
import { asyncHandler } from '../middleware/error-handler.js';
import ToolRegistry from './index.js';

export function registerToolRegistryRoutes(app) {
  app.get('/api/tools', asyncHandler(async (req, res) => {
    const registry = ToolRegistry.getInstance();
    res.json(formatResponse(registry.getAllTools()));
  }));

  app.get('/api/tools/by-app', asyncHandler(async (req, res) => {
    const registry = ToolRegistry.getInstance();
    res.json(formatResponse(registry.getToolsByApp()));
  }));

  app.get('/api/tools/search', asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json(formatResponse([]));

    const registry = ToolRegistry.getInstance();
    const results = registry.searchTools(q);
    res.json(formatResponse(results));
  }));

  app.get('/api/tools/app/:appId', asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const registry = ToolRegistry.getInstance();
    const tools = registry.getAppTools(appId);

    if (!tools.length && !registry.apps.has(appId)) {
      return res.status(404).json(formatResponse({ error: 'App not found' }));
    }

    res.json(formatResponse(tools));
  }));

  app.get('/api/tools/app/:appId/:toolName', asyncHandler(async (req, res) => {
    const { appId, toolName } = req.params;
    const registry = ToolRegistry.getInstance();
    const tool = registry.findTool(appId, toolName);

    if (!tool) {
      return res.status(404).json(formatResponse({ error: 'Tool not found' }));
    }

    res.json(formatResponse(tool));
  }));

  app.post('/api/tools/app/:appId/:toolName', asyncHandler(async (req, res) => {
    const { appId, toolName } = req.params;
    const { input } = req.body;

    const registry = ToolRegistry.getInstance();
    const tool = registry.findTool(appId, toolName);

    if (!tool) {
      return res.status(404).json(formatResponse({ error: 'Tool not found' }));
    }

    try {
      const result = await tool.handler(input);
      res.json(formatResponse({ success: true, result }));
    } catch (e) {
      return errorResponse(res, `Tool execution failed: ${toolName}`, e.message);
    }
  }));

  app.get('/api/tools/stats', asyncHandler(async (req, res) => {
    const registry = ToolRegistry.getInstance();
    res.json(formatResponse(registry.getStats()));
  }));

  app.post('/api/tools/register', asyncHandler(async (req, res) => {
    const { appId, tools } = req.body;
    if (!appId || !Array.isArray(tools)) {
      return res.status(400).json(formatResponse({ error: 'appId and tools array required' }));
    }

    const registry = ToolRegistry.getInstance();
    try {
      tools.forEach(tool => {
        const key = `${appId}:${tool.name}`;
        registry.tools.set(key, {
          appId,
          name: tool.name,
          description: tool.description || '',
          mcp: tool.mcp,
          handler: tool.handler || null
        });
      });

      if (!registry.apps.has(appId)) {
        registry.apps.set(appId, {
          id: appId,
          sdk: null,
          tools: tools,
          registered: Date.now()
        });
      }

      res.json(formatResponse({ success: true, registered: tools.length }));
    } catch (e) {
      return errorResponse(res, 'Tool registration failed', e.message);
    }
  }));
}

export default ToolRegistry;
