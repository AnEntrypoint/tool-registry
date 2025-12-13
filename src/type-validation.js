/**
 * type-validation.js - Type validation utilities
 *
 * Validates types and constraints for tool inputs
 */

export function validateType(value, expectedType) {
  const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  return actualType === expectedType;
}

export function validateConstraints(value, constraints) {
  const errors = [];

  if (constraints.enum && !constraints.enum.includes(value)) {
    errors.push(`Value must be one of: ${constraints.enum.join(', ')}`);
  }

  if (constraints.minimum !== undefined && value < constraints.minimum) {
    errors.push(`Value must be >= ${constraints.minimum}`);
  }

  if (constraints.maximum !== undefined && value > constraints.maximum) {
    errors.push(`Value must be <= ${constraints.maximum}`);
  }

  if (constraints.minLength !== undefined && value.length < constraints.minLength) {
    errors.push(`String length must be >= ${constraints.minLength}`);
  }

  if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
    errors.push(`String length must be <= ${constraints.maxLength}`);
  }

  if (constraints.pattern) {
    const regex = new RegExp(constraints.pattern);
    if (!regex.test(value)) {
      errors.push(`Value must match pattern: ${constraints.pattern}`);
    }
  }

  return errors;
}
