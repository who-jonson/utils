import type { Func, Arrayable } from '@whoj/utils-types';

import { watch } from 'vue-demi';
import { noop, isString } from '@whoj/utils-core';

import type { ComputedRefable } from '../types';
import type { RefableElement } from './unrefOfEl';

import { unrefElement } from './unrefOfEl';
import { defaultWindow } from '../_configurable';
import { tryOnScopeDispose } from './tryOnScopeDispose';

interface InferEventTarget<Events> {
  addEventListener: (event: Events, fn?: any, options?: any) => any;
  removeEventListener: (event: Events, fn?: any, options?: any) => any;
}

interface BasicEventListener<E = Event> {
  (evt: E): void;
}

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 * @param event
 * @param listener
 * @param options
 *
 * @__NO_SIDE_EFFECTS__
 */
export function listenEvent<E extends keyof WindowEventMap>(event: Arrayable<E>, listener: Arrayable<(this: Window, ev: WindowEventMap[E]) => any>, options?: boolean | AddEventListenerOptions): Func;
export function listenEvent<E extends keyof WindowEventMap>(target: Window, event: Arrayable<E>, listener: Arrayable<(this: Window, ev: WindowEventMap[E]) => any>, options?: boolean | AddEventListenerOptions): Func;
export function listenEvent<E extends keyof DocumentEventMap>(target: Document, event: Arrayable<E>, listener: Arrayable<(this: Document, ev: DocumentEventMap[E]) => any>, options?: boolean | AddEventListenerOptions): Func;
export function listenEvent<Names extends string, EventType = Event>(target: InferEventTarget<Names>, event: Arrayable<Names>, listener: Arrayable<BasicEventListener<EventType>>, options?: boolean | AddEventListenerOptions): Func;
export function listenEvent<EventType = Event>(target: ComputedRefable<null | undefined | EventTarget>, event: Arrayable<string>, listener: Arrayable<BasicEventListener<EventType>>, options?: boolean | AddEventListenerOptions): Func;
export function listenEvent(...args: any[]) {
  let target: undefined | ComputedRefable<EventTarget>;
  let events: Arrayable<string>;
  let listeners: Arrayable<Function>;
  let options: any;

  if (isString(args[0]) || Array.isArray(args[0])) {
    [events, listeners, options] = args;
    target = defaultWindow;
  }
  else {
    [target, events, listeners, options] = args;
  }

  if (!target) {
    return noop;
  }

  if (!Array.isArray(events)) {
    events = [events];
  }
  if (!Array.isArray(listeners)) {
    listeners = [listeners];
  }

  const cleanups: Function[] = [];
  const cleanup = () => {
    cleanups.forEach(fn => fn());
    cleanups.length = 0;
  };

  const register = (el: any, event: string, listener: any) => {
    el.addEventListener(event, listener, options);
    return () => el.removeEventListener(event, listener, options);
  };

  const stopWatch = watch(
    () => unrefElement(target as unknown as RefableElement),
    (el) => {
      cleanup();
      if (!el) {
        return;
      }

      cleanups.push(
        ...(events as string[]).flatMap((event) => {
          return (listeners as Function[]).map(listener => register(el, event, listener));
        })
      );
    },
    { flush: 'post', immediate: true }
  );

  const stop = () => {
    stopWatch();
    cleanup();
  };

  tryOnScopeDispose(stop);

  return stop;
}
