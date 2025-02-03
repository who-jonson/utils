import type { ComponentPublicInstance } from 'vue-demi';
import type { Refable, ComputedRefable } from '../types';
import { unrefOf } from './unrefOf';

export type VueInstance = ComponentPublicInstance;
export type NullableElement = HTMLElement | SVGElement | VueInstance | undefined | null;
export type RefableElement<T extends NullableElement = NullableElement> = Refable<T>;
export type ComputedRefableElement<T extends NullableElement = NullableElement> = ComputedRefable<T>;

export type UnRefElementReturn<T extends NullableElement = NullableElement> = T extends VueInstance ? Exclude<NullableElement, VueInstance> : T | undefined;

/**
 * Get the dom element of a ref of element or Vue component instance
 *
 * @param elRef
 *
 * @__NO_SIDE_EFFECTS__
 */
export function unrefElement<T extends NullableElement>(elRef: ComputedRefableElement<T>): UnRefElementReturn<T> {
  const plain = unrefOf(elRef);
  return (plain as VueInstance)?.$el ?? plain;
}
