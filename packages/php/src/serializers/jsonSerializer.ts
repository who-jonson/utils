import { isString } from '@whoj/utils-core';

import type { Serializer } from '../laravel/contracts';

export class JsonSerializer implements Serializer {
  /**
   * Serialize
   *
   * @param data
   */
  serialize(data: any) {
    if (typeof data === 'object')
      return `j:${JSON.stringify(data)}`;

    return String(data);
  }

  /**
   * Unserialize
   *  if cannot unserialize return data untouched
   *
   * @param str
   */
  unserialize<T = any>(str: string): T {
    if (!isString(str))
      return undefined;

    if (JsonSerializer.isJson(str)) {
      return JsonSerializer.parseJson(str);
    }
    return str as any;
  }

  /**
   * Parse JSON
   * @param str
   */
  static parseJson<T>(str: string): T {
    try {
      return JSON.parse(str.slice(2));
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (err) {
      return undefined;
    }
  }

  /**
   * Is Json, a la expressJs,
   *  if str is 'j:{"foo": "bar"}' if JSON
   *
   * @param str
   */
  static isJson(str: string): any {
    return str.substring(0, 2) === 'j:';
  }
}
