/**
 * Browser-compatible shim for extend
 * The extend module is used to deep merge objects
 * This provides a simple implementation for browser
 */

function extend<T = any>(...args: any[]): T {
  const target = args[0] || {};

  for (let i = 1; i < args.length; i++) {
    const source = args[i];

    if (source != null) {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          const sourceValue = source[key];
          const targetValue = target[key];

          // Deep merge for objects
          if (
            sourceValue &&
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue) &&
            targetValue &&
            typeof targetValue === 'object' &&
            !Array.isArray(targetValue)
          ) {
            target[key] = extend({}, targetValue, sourceValue);
          } else {
            target[key] = sourceValue;
          }
        }
      }
    }
  }

  return target;
}

export default extend;
