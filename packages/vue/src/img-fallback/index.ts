import { isVue3 } from 'vue-demi';
import type { DirectiveBinding, ObjectDirective, Plugin } from 'vue-demi';
import { isObject, isString } from '@whoj/utils-core';
import { loadingImg } from './assets';

export interface ImgFallbackOptions {
  error?: string
  loading?: string
}

type ImgFallbackObjDirective<T extends HTMLImageElement, V extends ImgFallbackOptions | string = ImgFallbackOptions> = ObjectDirective<T, V>;

function makeImgFallbackDir<ImgT extends HTMLImageElement, ImgV extends ImgFallbackOptions | string = ImgFallbackOptions>(options: ImgFallbackOptions = {}): ImgFallbackObjDirective<ImgT, ImgV> {
  return <ImgFallbackObjDirective<ImgT, ImgV>>{
    [`${isVue3 ? 'beforeMount' : 'bind'}`]: (el: ImgT, binding: DirectiveBinding<ImgV>) => {
      const { value } = binding;
      const defaultLoading = options?.loading || loadingImg;
      const defaultError = options?.error || options?.loading || loadingImg;
      const img = new Image();

      let loading = defaultLoading;
      let error = defaultError;
      const original = el.src;

      if (!value) {
        console.warn(
          `Vue Img Fallback Warning: Directive value is ${typeof value}. Now using default values.`
        );
      }

      if (isString(value)) {
        // @ts-ignore
        loading = error = value;
      }
      else if (isObject<ImgFallbackOptions>(value)) {
        // @ts-ignore
        loading = value.loading || defaultLoading;
        // @ts-ignore
        error = value.error || defaultError;
      }

      img.src = original;

      el.src = loading;

      img.onload = () => {
        el.src = original;
      };

      img.onerror = () => {
        el.src = error;
      };
    }
  };
}

/* Creating a directive that can be used in the template. */
export const vImgFallback = makeImgFallbackDir<HTMLImageElement>();

// TODO: Add Composable
// export function useImgFallback<ImgT extends HTMLImageElement>(el: ImgT | Ref<ImgT>, options?: ImgFallbackOptions) {
//   const imgEl = el instanceof HTMLImageElement ? el : el.value;
// }

/* A plugin that can be used in Vue. */
export const ImgFallback: Plugin = {
  install(app, options?: ImgFallbackOptions) {
    app.directive('img-fallback', makeImgFallbackDir<HTMLImageElement, ImgFallbackOptions>(options));
  }
};
