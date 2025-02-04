export interface Encrypter {
  /**
   * Encrypt the given value.
   *
   * @param {any} value
   * @param {boolean|undefined} serialize
   *
   * @return string
   *
   * @throws {EncryptException}
   */
  encrypt(value: any, serialize?: boolean): string;

  /**
   * Decrypt the given value.
   *
   * @param {any} value
   * @param {<S>} unserialize
   *
   * @returns {string | <T>}
   *
   * @throws {DecryptException}
   */
  decrypt<T = any, S extends boolean = true>(value: any, unserialize?: S): S extends true ? T : string;

  /**
   * Get the encryption key that the encrypter is currently using.
   *
   * @returns {Buffer}
   */
  get getKey(): Buffer;

  /**
   * Get the current encryption key and all previous encryption keys.
   *
   * @returns {Array<Buffer>}
   */
  get getAllKeys(): Array<Buffer>;

  /**
   * Get the previous encryption keys.
   *
   * @returns {Array<Buffer>}
   */
  get getPreviousKeys(): Array<Buffer>;
}

export interface StringEncrypter {
  /**
   * Encrypt the given string.
   *
   * @param {any} value
   *
   * @return string
   *
   * @throws {EncryptException}
   */
  encryptString(value: string): string;

  /**
   * Decrypt the given string.
   *
   * @param {any} value
   *
   * @returns {string}
   *
   * @throws {DecryptException}
   */
  decryptString(value: string): string;
}

export interface Serializer {
  serialize(data: any): string;

  unserialize<T = any>(data: string): T;
}

export {};
