/**
 * Browser-compatible shim for is-buffer
 * is-buffer checks if an object is a Buffer instance (Node.js)
 * In browser, we provide a simple implementation
 */

function isBuffer(obj: any): boolean {
  return (
    obj != null &&
    obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' &&
    obj.constructor.isBuffer(obj)
  );
}

export default isBuffer;
