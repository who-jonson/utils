import { createCachedFunction } from '@whoj/utils-core';

import type { SupportedCipher } from './Encrypter';

import { Encrypter } from './Encrypter';

const encrypter = createCachedFunction(
  (...args: ConstructorParameters<typeof Encrypter>): InstanceType<typeof Encrypter> => new Encrypter(...args),
  { ttl: 2 * 60 * 1000, updateAgeOnGet: false }
);

function _encrypt(
  value: any,
  key: string,
  { cipher = 'aes-128-cbc', serialize = true }: { serialize?: boolean; cipher?: SupportedCipher } = {}
): string {
  return encrypter(key, cipher).encrypt(value, serialize);
}

function _encryptString(
  value: string,
  key: string,
  cipher: SupportedCipher = 'aes-128-cbc'
): string {
  return encrypter(key, cipher).encryptString(value);
}

function _decrypt<T = any, S extends boolean = true>(
  value: string,
  key: string,
  { cipher = 'aes-128-cbc', unserialize = true as S }: { unserialize?: S; cipher?: SupportedCipher } = {}
): S extends true ? T : string {
  return encrypter(key, cipher).decrypt(value, unserialize);
}

function _decryptString(
  value: string,
  key: string,
  cipher: SupportedCipher = 'aes-128-cbc'
): string {
  return encrypter(key, cipher).decryptString(value);
}

export const encrypt = /* @__PURE__ */ createCachedFunction(_encrypt);

export const decrypt = /* @__PURE__ */ createCachedFunction(_decrypt);

export const encryptString = /* @__PURE__ */ createCachedFunction(_encryptString);

export const decryptString = /* @__PURE__ */ createCachedFunction(_decryptString);
