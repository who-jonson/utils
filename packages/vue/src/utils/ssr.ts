/**
 * If the type of window is undefined, then we're on the server.
 */
export const isServer = () => typeof window === 'undefined';

/**
 * If the window object exists, then we're in the browser, otherwise we're in Node.
 */
export const isClient = () => !isServer();

/**
 * If we're on the server, return undefined, otherwise return the window object.
 */
export const getWindow = (): Window | undefined => isServer() ? undefined : window;

/**
 * If document is defined, return document, otherwise return undefined.
 */
export const getDocument = (): Document | undefined => typeof document === 'undefined' ? undefined : document;

const fakeGlobal = {};

/**
 * If we're on the server, return the global object, otherwise return the window object
 * @returns The global object.
 */
export const getGlobal = () => {
  if (isServer()) {
    if (typeof globalThis === 'undefined') {
      return fakeGlobal as Window;
    }
    return globalThis as any as Window;
  } else {
    return window;
  }
};
