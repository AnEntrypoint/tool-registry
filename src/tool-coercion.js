/**
 * Type coercion for tool input values
 */
export function coerceInputTypes(input, schema) {
  const coerced = {};

  for (const [fieldName, property] of Object.entries(schema.properties || {})) {
    if (!input.hasOwnProperty(fieldName)) continue;

    const value = input[fieldName];
    const inputType = Array.isArray(value) ? 'array' : typeof value;

    if (property.type === 'number' && inputType === 'string' && !isNaN(value)) {
      coerced[fieldName] = Number(value);
    } else if (property.type === 'string' && inputType === 'number') {
      coerced[fieldName] = String(value);
    } else if (property.type === 'boolean' && inputType === 'string') {
      coerced[fieldName] = ['true', '1', 'yes'].includes(value.toLowerCase());
    } else if (property.type === 'boolean' && inputType === 'number') {
      coerced[fieldName] = value !== 0 && value !== null;
    } else {
      coerced[fieldName] = value;
    }
  }

  return coerced;
}
