import type { Serializer } from '../laravel/contracts';
import { EncryptException } from '../laravel/exceptions';
import { serialize, unserialize, isSerialized } from 'php-serialize';

export class PhpSerializer implements Serializer {
  /**
   * Serialize
   */
  serialize(data: any) {
    return serialize(data);
  }

  /**
   * Unserialize
   *  if not serialized return data untouched
   */
  unserialize<T = any>(data: any): T {
    if (!isSerialized(data))
      return data;
    try {
      return unserialize(data);
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e) {
      throw new EncryptException('phpUnSerialize Error unserialize data');
    }
  }
}
