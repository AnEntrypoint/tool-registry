/**
 * property-validation.js - Property-level validation
 *
 * Validates individual properties and nested objects
 */

import { validateType, validateConstraints } from './type-validation.js';

export function validateInputProperty(value, property, fieldName, validateTypeFn = validateType, validateConstraintsFn = validateConstraints) {
  const errors = [];
  const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;

  if (property.type && actualType !== property.type) {
    errors.push(`${fieldName}: Type mismatch - expected ${property.type}, got ${actualType}`);
    return { valid: false, errors };
  }

  if (actualType === 'string') {
    const strErrors = validateConstraintsFn(value, {
      enum: property.enum,
      minLength: property.minLength,
      maxLength: property.maxLength,
      pattern: property.pattern
    });
    errors.push(...strErrors.map(e => `${fieldName}: ${e}`));
  }

  if (actualType === 'number') {
    const numErrors = validateConstraintsFn(value, {
      enum: property.enum,
      minimum: property.minimum,
      maximum: property.maximum
    });
    errors.push(...numErrors.map(e => `${fieldName}: ${e}`));
  }

  if (actualType === 'array' && property.items) {
    if (!value.every(item => validateTypeFn(item, property.items.type))) {
      errors.push(`${fieldName}: Array items must be of type ${property.items.type}`);
    }
  }

  if (actualType === 'object' && property.properties) {
    for (const [key, subProp] of Object.entries(property.properties)) {
      if (value.hasOwnProperty(key)) {
        const subErrors = validateInputProperty(value[key], subProp, `${fieldName}.${key}`, validateTypeFn, validateConstraintsFn);
        if (!subErrors.valid) {
          errors.push(...subErrors.errors);
        }
      }
    }

    const required = property.required || [];
    for (const requiredKey of required) {
      if (!value.hasOwnProperty(requiredKey)) {
        errors.push(`${fieldName}: Missing required field: ${requiredKey}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
