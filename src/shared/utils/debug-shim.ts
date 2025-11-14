/**
 * Browser-compatible shim for debug
 * The debug module provides colorful console logging
 * This shim provides a no-op implementation for browser
 */

interface Debugger {
  (formatter: any, ...args: any[]): void;
  enabled: boolean;
  namespace: string;
  extend: (namespace: string) => Debugger;
}

function createDebug(namespace: string): Debugger {
  const debugFn = function (formatter: any, ...args: any[]) {
    // No-op in production, or simple console.log in development
    if (import.meta.env.DEV) {
      console.log(`[${namespace}]`, formatter, ...args);
    }
  } as Debugger;

  debugFn.enabled = import.meta.env.DEV;
  debugFn.namespace = namespace;
  debugFn.extend = (ns: string) => createDebug(`${namespace}:${ns}`);

  return debugFn;
}

// Main debug function
const debug = (namespace: string): Debugger => createDebug(namespace);

// Add common properties
debug.enable = () => {};
debug.disable = () => {};
debug.enabled = () => import.meta.env.DEV;

export default debug;
