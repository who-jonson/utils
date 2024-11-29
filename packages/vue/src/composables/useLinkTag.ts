import { ref, watch } from 'vue-demi';
import type { Optional } from '@whoj/utils-types';
import { getDocument, noop, objectEntries } from '@whoj/utils-core';
import type { ComputedRefable } from '../types';
import { unrefOf } from './unrefOf';
import { listenEvent } from './listenEvent';
import { tryOnMounted } from './tryOnMounted';
import { tryOnUnmounted } from './tryOnUnmounted';

type BuiltInLinkElAttrs = Pick<HTMLLinkElement, 'as' | 'rel' | 'type' | 'media'>;
interface ConfigurableDocument {
  document?: Document;
}

export interface UseLinkTagOptions extends ConfigurableDocument, Optional<BuiltInLinkElAttrs> {
  // id of the link tag
  id?: string;

  immediate?: boolean;

  manual?: boolean;

  blocking?: 'render';

  crossOrigin?: 'anonymous' | 'use-credentials';

  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'unsafe-url';

  attrs?: Record<string, string>;
}

let _id = 0;

/* @__NO_SIDE_EFFECTS__ */
export function useLinkTag(href: ComputedRefable<string>, onLoaded: (el: HTMLLinkElement) => void = noop, options: UseLinkTagOptions = {}) {
  const {
    as,
    media,
    crossOrigin,
    referrerPolicy,
    blocking,
    immediate = true,
    manual = false,
    attrs = {},
    type = 'text/css',
    rel = 'stylesheet',
    id = `use_link_tag_${++_id}`,
    document = getDocument()
  } = options;

  const linkTag = ref<HTMLLinkElement>();
  const loaded = ref<boolean>();

  let _promise: Promise<HTMLLinkElement | boolean> | null = null;

  const _evtListeners: Record<string, () => void> = {};

  const findLinkEl = () => document!.querySelector<HTMLLinkElement>(`link[id="${id}"]`);

  const loadLink = (waitForLoad: boolean): Promise<HTMLLinkElement | boolean> => new Promise((resolve, reject) => {
    const resolveWithElement = (el: HTMLLinkElement) => {
      linkTag.value = el;
      resolve(el);
      return el;
    };

    // For SSR Support.
    if (!document) {
      resolve(false);
      return;
    }

    // Local variable defining if the <link> tag should be appended or not.
    let shouldAppend = false;

    let el = findLinkEl();

    // If not found, prepare the element for appending
    if (!el) {
      el = document.createElement('link');
      el.id = id;
      el.rel = rel;
      el.type = type;
      el.href = unrefOf(href);

      // Optional attributes
      if (as) {
        el.as = as;
      }
      if (media) {
        el.media = media;
      }
      if (crossOrigin) {
        el.crossOrigin = crossOrigin;
      }
      if (referrerPolicy) {
        el.referrerPolicy = referrerPolicy;
      }
      if (blocking) {
        attrs.blocking = blocking;
      }

      objectEntries(attrs).forEach(([name, value]) => el?.setAttribute(name, value));

      // Enables shouldAppend
      shouldAppend = true;
    } else if (el.hasAttribute('data-loaded')) {
      resolveWithElement(el);
    }

    // Event listeners
    _evtListeners.error = listenEvent<ErrorEvent>(el, 'error', event => reject(event));
    _evtListeners.abort = listenEvent<UIEvent>(el, 'abort', event => reject(event));
    _evtListeners.load = listenEvent(el, 'load', () => {
      el!.setAttribute('data-loaded', 'true');

      loaded.value = true;
      onLoaded(el!);
      resolveWithElement(el!);
    });

    // Append the <script> tag to head.
    if (shouldAppend) {
      el = document.head.appendChild(el);
    }

    // If script load awaiting isn't needed, we can resolve the Promise.
    if (!waitForLoad) {
      resolveWithElement(el);
    }
  });

  const load = (waitForLoad = true): Promise<HTMLLinkElement | boolean> => {
    if (!_promise) {
      _promise = loadLink(waitForLoad);
    }

    return _promise;
  };

  const unload = () => {
    if (!document) {
      return;
    }

    _promise = null;

    if (linkTag.value) {
      linkTag.value = undefined;
    }

    const el = findLinkEl();
    if (el) {
      objectEntries(_evtListeners).forEach(([name, unregister]) => {
        unregister();
      });
      document.head.removeChild(el);
    }
    loaded.value = undefined;
  };

  const update = /*@__NO_SIDE_EFFECTS__*/ () => {
    const el = findLinkEl();
    if (el) {
      el.href = unrefOf(href);
    }
  };

  if (immediate && !manual) {
    tryOnMounted(load);
  }

  if (!manual) {
    tryOnUnmounted(unload);
  }

  watch(
    () => unrefOf(href),
    update,
    { immediate: true, flush: 'post' }
  );

  return { linkTag, loaded, load, unload };
}

export type UseLinkTagReturn = ReturnType<typeof useLinkTag>;
