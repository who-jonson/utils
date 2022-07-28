import type { PropType, StyleValue, VNode } from 'vue-demi';
import type { Nullable, Numberish } from '@whoj/utils-core';
import { defineProp } from './prop';

export class Prop {
  static get string() {
    return defineProp<string>(String);
  }

  static get number() {
    return defineProp<number>(Number);
  }

  static get stringNumber() {
    return defineProp<number | string>([String, Number]);
  }

  static get boolean() {
    return defineProp<boolean>(Boolean);
  }

  static get symbol() {
    return defineProp<symbol>(Symbol);
  }

  static get date() {
    return defineProp<Date>(Date);
  }

  static get vNode() {
    return defineProp<VNode | string | null>([String, Object]);
  }

  static get css() {
    return defineProp<StyleValue>(Object);
  }

  static object<T = Record<string, any>>() {
    return defineProp<T>(Object);
  }

  static array<T = Record<string, any>>() {
    return defineProp<Array<T>>(Array);
  }

  static function<T =() => void>() {
    return { type: Function as PropType<T> };
  }

  static boolOpt(def = false) {
    return defineProp<Nullable<boolean>>(Boolean).def(def);
  }

  static numberOpt(def?: number) {
    return defineProp<Nullable<number>>(Number).def(def || null);
  }

  static stringOpt(def?: string) {
    return defineProp<Nullable<string>>(String).def(def || null);
  }

  static numberishOpt(def?: Numberish) {
    return defineProp<Nullable<Numberish>>([Number, String]).def(def || null);
  }
}
