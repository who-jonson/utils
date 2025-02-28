// Forked from https://github.com/vueuse/vueuse/blob/main/packages/core/useStyleTag/index.ts
import type { Ref } from 'vue-demi';

import { ref, watch, readonly } from 'vue-demi';

import type { MaybeRef } from '../types';
import type { ConfigurableDocument } from '../_configurable';

import { tryOnMounted } from './tryOnMounted';
import { defaultDocument } from '../_configurable';
import { tryOnScopeDispose } from './tryOnScopeDispose';

export interface UseStyleTagOptions extends ConfigurableDocument {
  /**
   * DOM id of the style tag
   *
   * @default auto-incremented
   */
  id?: string;

  /**
   * Load the style immediately
   *
   * @default true
   */
  immediate?: boolean;

  /**
   * Manual controls the timing of loading and unloading
   *
   * @default false
   */
  manual?: boolean;

  /**
   * Media query for styles to apply
   */
  media?: string;
}

export interface UseStyleTagReturn {
  css: Ref<string>;
  id: string;
  isLoaded: Readonly<Ref<boolean>>;
  load: () => void;
  unload: () => void;
}

let _id = 0;

/**
 * Inject <style> element in head.
 *
 * Overload: Omitted id
 *
 * @see https://vueuse.org/useStyleTag
 * @param css
 * @param options
 */
export function useStyleTag(
  css: MaybeRef<string>,
  options: UseStyleTagOptions = {}
): UseStyleTagReturn {
  const isLoaded = ref(false);

  const {
    document = defaultDocument,
    id = `whoj.utils-vue_style_tag_${++_id}`,
    immediate = true,
    manual = false
  } = options;

  const cssRef = ref(css);

  let stop = () => { };
  const load = () => {
    if (!document) {
      return;
    }

    const el = (document.getElementById(id) || document.createElement('style')) as HTMLStyleElement;

    if (!el.isConnected) {
      el.type = 'text/css';
      el.id = id;
      if (options.media) {
        el.media = options.media;
      }
      document.head.appendChild(el);
    }

    if (isLoaded.value) {
      return;
    }

    stop = watch(
      cssRef,
      (value) => {
        el.textContent = value;
      },
      { immediate: true }
    );

    isLoaded.value = true;
  };

  const unload = /*@__NO_SIDE_EFFECTS__*/ () => {
    if (!document || !isLoaded.value) {
      return;
    }
    stop();
    document.head.removeChild(document.getElementById(id) as HTMLStyleElement);
    isLoaded.value = false;
  };

  if (immediate && !manual) {
    tryOnMounted(load);
  }

  if (!manual) {
    tryOnScopeDispose(unload);
  }

  return {
    css: cssRef,
    id,
    isLoaded: readonly(isLoaded),
    load,
    unload
  };
}
