// Forked from https://github.com/vueuse/vueuse/blob/main/packages/core/useStyleTag/index.ts
import type { Ref } from 'vue-demi';
import { ref, watch, readonly } from 'vue-demi';
import { tryOnMounted } from './tryOnMounted';
import { tryOnScopeDispose } from './tryOnScopeDispose';
import type { MaybeRef } from '../types';
import { defaultDocument } from '../_configurable';
import type { ConfigurableDocument } from '../_configurable';

export interface UseStyleTagOptions extends ConfigurableDocument {
  /**
   * Media query for styles to apply
   */
  media?: string;

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
   * DOM id of the style tag
   *
   * @default auto-incremented
   */
  id?: string;
}

export interface UseStyleTagReturn {
  id: string;
  css: Ref<string>;
  load: () => void;
  unload: () => void;
  isLoaded: Readonly<Ref<boolean>>;
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
    immediate = true,
    manual = false,
    id = `whoj.utils-vue_style_tag_${++_id}`
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
    id,
    css: cssRef,
    unload,
    load,
    isLoaded: readonly(isLoaded)
  };
}
