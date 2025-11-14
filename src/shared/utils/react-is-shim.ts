/**
 * Browser-compatible shim for react-is
 * Provides minimal implementation of react-is utilities for browser
 * This avoids circular dependencies by not importing the actual react-is
 */

import { ReactElement } from 'react';

// React internal symbols (approximations for browser)
const REACT_ELEMENT_TYPE = Symbol.for('react.element');
const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
const REACT_PORTAL_TYPE = Symbol.for('react.portal');
const REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
const REACT_PROFILER_TYPE = Symbol.for('react.profiler');
const REACT_PROVIDER_TYPE = Symbol.for('react.provider');
const REACT_CONTEXT_TYPE = Symbol.for('react.context');
const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
const REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
const REACT_MEMO_TYPE = Symbol.for('react.memo');
const REACT_LAZY_TYPE = Symbol.for('react.lazy');

function typeOf(object: any): symbol | undefined {
  if (typeof object === 'object' && object !== null) {
    const $$typeof = object.$$typeof;
    return $$typeof;
  }
  return undefined;
}

function isElement(object: any): object is ReactElement {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}

function isFragment(object: any): boolean {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}

function isPortal(object: any): boolean {
  return typeOf(object) === REACT_PORTAL_TYPE;
}

function isStrictMode(object: any): boolean {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}

function isProfiler(object: any): boolean {
  return typeOf(object) === REACT_PROFILER_TYPE;
}

function isContextProvider(object: any): boolean {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}

function isContextConsumer(object: any): boolean {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}

function isForwardRef(object: any): boolean {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}

function isSuspense(object: any): boolean {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}

function isMemo(object: any): boolean {
  return typeOf(object) === REACT_MEMO_TYPE;
}

function isLazy(object: any): boolean {
  return typeOf(object) === REACT_LAZY_TYPE;
}

function isValidElementType(type: any): boolean {
  return (
    typeof type === 'string' ||
    typeof type === 'function' ||
    type === REACT_FRAGMENT_TYPE ||
    type === REACT_PROFILER_TYPE ||
    type === REACT_STRICT_MODE_TYPE ||
    type === REACT_SUSPENSE_TYPE ||
    (typeof type === 'object' &&
      type !== null &&
      (type.$$typeof === REACT_LAZY_TYPE ||
        type.$$typeof === REACT_MEMO_TYPE ||
        type.$$typeof === REACT_PROVIDER_TYPE ||
        type.$$typeof === REACT_CONTEXT_TYPE ||
        type.$$typeof === REACT_FORWARD_REF_TYPE))
  );
}

// Symbol exports
export const ContextConsumer = REACT_CONTEXT_TYPE;
export const ContextProvider = REACT_PROVIDER_TYPE;
export const Element = REACT_ELEMENT_TYPE;
export const ForwardRef = REACT_FORWARD_REF_TYPE;
export const Fragment = REACT_FRAGMENT_TYPE;
export const Lazy = REACT_LAZY_TYPE;
export const Memo = REACT_MEMO_TYPE;
export const Portal = REACT_PORTAL_TYPE;
export const Profiler = REACT_PROFILER_TYPE;
export const StrictMode = REACT_STRICT_MODE_TYPE;
export const Suspense = REACT_SUSPENSE_TYPE;

// Function exports
export {
  isValidElementType,
  isContextConsumer,
  isContextProvider,
  isElement,
  isForwardRef,
  isFragment,
  isLazy,
  isMemo,
  isPortal,
  isProfiler,
  isStrictMode,
  isSuspense,
  typeOf,
};

// Default export
const ReactIs = {
  isValidElementType,
  isContextConsumer,
  isContextProvider,
  isElement,
  isForwardRef,
  isFragment,
  isLazy,
  isMemo,
  isPortal,
  isProfiler,
  isStrictMode,
  isSuspense,
  typeOf,
  ContextConsumer,
  ContextProvider,
  Element,
  ForwardRef,
  Fragment,
  Lazy,
  Memo,
  Portal,
  Profiler,
  StrictMode,
  Suspense,
};

export default ReactIs;
