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

const fakeGlobal = {} as Window;

// ref: https://github.com/tc39/proposal-global
const _globalThis = (function () {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  return fakeGlobal;
})();

type _Global = typeof _globalThis;
type _GlobalKey = `${keyof _Global}`;

/**
 * If we're on the server, return the global object, otherwise return the window object
 * @returns The global object.
 */
export function getGlobal<T extends _GlobalKey>(prop?: T): T extends undefined ? _Global : _Global[T] {
  // @ts-ignore
  return !prop
    ? _globalThis
    : _globalThis[prop];
}

const getTopCoordinate = (element: HTMLElement) => element.offsetTop;
const getBottomCoordinate = (element: HTMLElement) => element.offsetTop + element.offsetHeight;
const getCenterCoordinate = (element: HTMLElement) => element.offsetTop + element.offsetHeight / 2;

const getScrollTop = (element: HTMLElement, scrollTarget: HTMLElement, verticalAlignment?: 'start' | 'end' | 'center' | 'any') => {
  const viewHeight = scrollTarget.offsetHeight;
  const currentPosition = scrollTarget.scrollTop;
  const top = getTopCoordinate(element) - scrollTarget.offsetTop;
  const center = getCenterCoordinate(element) - scrollTarget.offsetTop;
  const bottom = getBottomCoordinate(element) - scrollTarget.offsetTop;

  if (verticalAlignment === 'start') {
    return top;
  }

  if (verticalAlignment === 'end') {
    return bottom - viewHeight;
  }

  if (verticalAlignment === 'center') {
    return center - viewHeight / 2;
  }

  if (verticalAlignment === 'any') {
    if (top - currentPosition < 0) {
      return top;
    }

    if (bottom - currentPosition > viewHeight) {
      return bottom - viewHeight;
    }
  }
};

/**
 * @param options.scrollTarget - element that will be scrolled
 */
export const scrollToElement = /* @__PURE__ */ (element: HTMLElement, options: {
  scrollTarget?: HTMLElement,
  verticalAlignment?: 'start' | 'end' | 'center' | 'any',
  smooth?: boolean
} = {
  scrollTarget: element.parentElement!,
  verticalAlignment: 'any',
  smooth: false
}) => {
  const scrollTarget = options.scrollTarget || element.parentElement!;

  const top = getScrollTop(element, scrollTarget, options.verticalAlignment);

  if (top === undefined) {
    return;
  }

  scrollTarget.scroll({
    top,
    behavior: options.smooth ? 'smooth' : 'auto'
  });
};
