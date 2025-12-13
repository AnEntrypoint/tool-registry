/**
 * strict-validation.js - Strict tool input validation
 *
 * Comprehensive validation of tool inputs against schema
 */

import { validateInputProperty } from './property-validation.js';
import { validateType, validateConstraints } from './type-validation.js';

export function validateToolInputStrict(findToolByName, toolName, input) {
  const tool = findToolByName(toolName);
  if (!tool) return { valid: false, errors: [`Tool not found: ${toolName}`] };

  const schema = tool.mcp?.inputSchema;
  if (!schema) return { valid: false, errors: [`No schema found for tool: ${toolName}`] };

  const errors = [];
  const required = schema.required || [];

  for (const [fieldName, property] of Object.entries(schema.properties || {})) {
    if (!input.hasOwnProperty(fieldName)) {
      if (required.includes(fieldName)) {
        errors.push(`Missing required field: ${fieldName}`);
      }
      continue;
    }

    const validation = validateInputProperty(input[fieldName], property, fieldName, validateType, validateConstraints);
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
  }

  return { valid: errors.length === 0, errors };
}
