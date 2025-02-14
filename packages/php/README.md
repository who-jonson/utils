# @whoj/utils-php

<p>
  <a href="https://www.npmjs.com/package/@whoj/utils-php">
    <img src="https://badgen.net/npm/v/@whoj/utils-php?icon=npm&color=green&label=" alt="Version">
  </a>
  <a href="#">
    <img src="https://badgen.net/npm/types/@whoj/utils-php?color=blue&icon=typescript&label=" alt="Typings">
  </a>
  <a href="https://bundlephobia.com/package/@whoj/utils-php">
    <img src="https://badgen.net/bundlephobia/tree-shaking/@whoj/utils-php" alt="tree-shaking support">
  </a>
  <a href="https://bundlephobia.com/package/@whoj/utils-php">
    <img src="https://badgen.net/bundlephobia/minzip/@whoj/utils-php?label=minzipped" alt="minified + gzip">
  </a>
  <a href="https://bundlephobia.com/package/@whoj/utils-php">
    <img src="https://badgen.net/bundlephobia/dependency-count/@whoj/utils-php?label=Dependency" alt="dependency count">
  </a>
  <a href="https://bundlephobia.com/package/@whoj/utils-php">
    <img src="https://badgen.net/packagephobia/install/@whoj/utils-php" alt="install size">
  </a>
  <a href="https://bundlephobia.com/package/@whoj/utils-php">
    <img src="https://badgen.net/packagephobia/publish/@whoj/utils-php" alt="publish size">
  </a>
  <a href="https://github.com/who-jonson/utils/blob/master/LICENSE">
    <img src="https://badgen.net/npm/license/@whoj/utils-php?label=License" alt="License">
  </a>
</p>


### Install

<!-- automd:pm-install name="@whoj/utils-php" -->

```sh
# ✨ Auto-detect
npx nypm install @whoj/utils-php

# npm
npm install @whoj/utils-php

# yarn
yarn add @whoj/utils-php

# pnpm
pnpm install @whoj/utils-php

# bun
bun install @whoj/utils-php

# deno
deno install @whoj/utils-php
```

<!-- /automd -->

<!-- automd:jsdocs src="./src/laravel/Encrypter" -->

### `Encrypter()`

<!-- /automd -->

<!-- automd:file src="./src/laravel/contracts.ts" name="Interfaces" code -->

```ts Interfaces
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

```

<!-- /automd -->


[MIT](../../LICENSE) License © 2020-PRESENT [Jonson B.](https://github.com/who-jonson)
