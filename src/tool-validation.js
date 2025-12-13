/**
 * tool-validation.js - Tool Validation Facade
 *
 * Delegates to focused validation modules:
 * - schema-retrieval: Schema retrieval and versioning
 * - type-validation: Type and constraint checking
 * - property-validation: Property-level validation
 * - strict-validation: Strict comprehensive validation
 */

export { getToolSchema } from './schema-retrieval.js';
export { validateType, validateConstraints } from './type-validation.js';
export { validateInputProperty } from './property-validation.js';
export { validateToolInputStrict } from './strict-validation.js';

// Basic tool input validation
export function validateToolInput(getSchemaFn, toolName, input, version = null) {
  const schema = getSchemaFn(toolName, version);
  if (!schema) return { valid: false, error: 'Tool or schema not found' };

  const errors = [];
  const required = schema.required || [];

  for (const field of required) {
    if (!input.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
