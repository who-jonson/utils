import type { Optional } from '@whoj/utils-types';

import { ref, watch } from 'vue-demi';
import { noop, getDocument, objectEntries } from '@whoj/utils-core';

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
  attrs?: Record<string, string>;

  blocking?: 'render';

  crossOrigin?: 'anonymous' | 'use-credentials';

  // id of the link tag
  id?: string;

  immediate?: boolean;

  manual?: boolean;

  referrerPolicy?: 'origin' | 'unsafe-url' | 'no-referrer' | 'origin-when-cross-origin' | 'no-referrer-when-downgrade';
}

let _id = 0;

/* @__NO_SIDE_EFFECTS__ */
export function useLinkTag(href: ComputedRefable<string>, onLoaded: (el: HTMLLinkElement) => void = noop, options: UseLinkTagOptions = {}) {
  const {
    as,
    attrs = {},
    blocking,
    crossOrigin,
    document = getDocument(),
    id = `use_link_tag_${++_id}`,
    immediate = true,
    manual = false,
    media,
    referrerPolicy,
    rel = 'stylesheet',
    type = 'text/css'
  } = options;

  const linkTag = ref<HTMLLinkElement>();
  const loaded = ref<boolean>();

  let _promise: null | Promise<boolean | HTMLLinkElement> = null;

  const _evtListeners: Record<string, () => void> = {};

  const findLinkEl = () => document!.querySelector<HTMLLinkElement>(`link[id="${id}"]`);

  const loadLink = (waitForLoad: boolean): Promise<boolean | HTMLLinkElement> => new Promise((resolve, reject) => {
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
    }
    else if (el.hasAttribute('data-loaded')) {
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

  const load = (waitForLoad = true): Promise<boolean | HTMLLinkElement> => {
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
      // eslint-disable-next-line ts/no-unused-vars
      objectEntries(_evtListeners).forEach(([_, unregister]) => {
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
    { flush: 'post', immediate: true }
  );

  return { linkTag, load, loaded, unload };
}

export type UseLinkTagReturn = ReturnType<typeof useLinkTag>;
