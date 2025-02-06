import { Serializer } from './Serializer';
import type { Class } from '@whoj/utils-types';
import { PhpSerializer } from '../serializers/phpSerializer';
import { JsonSerializer } from '../serializers/jsonSerializer';
import { isString, isObject } from '@whoj/utils-core';
import type { StringEncrypter, Encrypter as EncrypterContract } from './contracts';
import { DecryptException, InvalidArgException } from './exceptions';
import type { Cipher, Decipher, CipherGCM, DecipherGCM, CipherGCMTypes } from 'node:crypto';
import { createHmac, randomBytes, createCipheriv, timingSafeEqual, createDecipheriv } from 'node:crypto';

interface JsonPayload {
  iv: string;
  value: string;
  mac: string;
  tag?: string;
}

interface EncrypterOptions {
  serializeMode?: 'php' | 'json';
}

export type SupportedCipher = typeof supportedCiphers[number];

const supportedCiphers = [
  'aes-128-cbc',
  'aes-256-cbc',
  'aes-128-gcm',
  'aes-256-gcm'
] as const;

export class Encrypter implements EncrypterContract, StringEncrypter {
  private static readonly supportedCiphers = supportedCiphers;

  private readonly key: Buffer;
  private readonly isGcm: boolean;
  private previousKeys: Array<Buffer> = [];
  private hashAlgorithm: string = 'sha256';

  protected serializer: Serializer;

  constructor(
    key: string,
    protected readonly cipher: SupportedCipher = 'aes-256-cbc',
    protected options: EncrypterOptions = { serializeMode: 'php' }
  ) {
    this.key = this.keyBuffer(key, cipher);
    this.isGcm = cipher.toLowerCase().endsWith('-gcm');
    this.setSerializer();
  }

  public encrypt(value: any, serializeData: boolean = true): string {
    const data = serializeData ? this.serializer.serialize(value) : value.toString();
    const iv = randomBytes(this.getIvLength(this.cipher));

    const cipher = createCipheriv(
      this.cipher,
      this.key,
      iv,
      this.isGcm // @ts-ignore
        ? { authTagLength: 16 }
        : undefined
    );

    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const payload: Record<string, string> = {
      iv: iv.toString('base64'),
      value: encrypted
    };

    if (this.isGcm) {
      payload.tag = cipher.getAuthTag().toString('base64');
    }
    else {
      payload.mac = this.calculateMac(payload.iv, encrypted);
    }

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  public decrypt<T = any, S extends boolean = true, Ret = S extends true ? T : string>(
    payload: string,
    unserializeData: S = true as S
  ): Ret {
    const json = Buffer.from(payload, 'base64').toString('utf8');
    const data = JSON.parse(json);

    const { iv: ivBase64, value: encryptedValue } = data;
    const iv = Buffer.from(ivBase64, 'base64');
    const encrypted = Buffer.from(encryptedValue, 'base64');

    if (this.isGcm) {
      if (!data.tag)
        throw new DecryptException('Authentication tag missing for GCM mode');
      const tag = Buffer.from(data.tag, 'base64');
      return this.decryptGcm<Ret>(encrypted, iv, tag, unserializeData);
    }

    if (!data.mac)
      throw new DecryptException('MAC missing for CBC mode');
    this.verifyMac(data.mac, ivBase64, encryptedValue);
    return this.decryptCbc<Ret>(encrypted, iv, unserializeData);
  }

  private decryptGcm<T>(encrypted: Buffer, iv: Buffer, tag: Buffer, unserializeData: boolean): T {
    const decipher = createDecipheriv(
      this.cipher,
      this.key,
      iv, // @ts-ignore
      { authTagLength: 16 }
    );
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return unserializeData
      ? this.serializer.unserialize<T>(decrypted.toString('utf8'))
      : decrypted.toString('utf8') as T;
  }

  private decryptCbc<T>(encrypted: Buffer, iv: Buffer, unserializeData: boolean): T {
    const decipher = createDecipheriv(this.cipher, this.key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return unserializeData
      ? this.serializer.unserialize<T>(decrypted.toString('utf8'))
      : decrypted.toString('utf8') as T;
  }

  private verifyMac(mac: string, iv: string, encryptedValue: string): void {
    const expectedMac = this.calculateMac(iv, encryptedValue);
    const receivedMacBuffer = Buffer.from(mac, 'hex');
    const expectedMacBuffer = Buffer.from(expectedMac, 'hex');

    if (!timingSafeEqual(expectedMacBuffer, receivedMacBuffer)) {
      throw new DecryptException('MAC mismatch');
    }
  }

  private calculateMac(iv: string, encryptedValue: string): string {
    const hmac = createHmac('sha256', this.key);
    hmac.update(iv + encryptedValue);
    return hmac.digest('hex');
  }

  public static supported(key: string, cipher: string): boolean {
    const cipherLower = cipher.toLowerCase();
    if (!Encrypter.supportedCiphers.includes(cipherLower as SupportedCipher)) {
      return false;
    }

    let keyBuffer: Buffer;
    if (key.startsWith('base64:')) {
      keyBuffer = Buffer.from(key.slice(7), 'base64');
    }
    else {
      keyBuffer = Buffer.from(key);
    }

    const requiredLength = cipherLower.includes('128') ? 16 : 32;
    return keyBuffer.length === requiredLength;
  }

  public static generateKey(cipher: string = 'aes-256-cbc'): string {
    const cipherLower = cipher.toLowerCase();
    if (!Encrypter.supportedCiphers.includes(cipherLower as SupportedCipher)) {
      throw new InvalidArgException(`Unsupported cipher: ${cipher}`);
    }

    const length = cipherLower.includes('128') ? 16 : 32;
    const key = randomBytes(length);
    return `base64:${key.toString('base64')}`;
  }

  public encryptString(value: string) {
    return this.encrypt(value, false);
  }

  public decryptString(value: string) {
    return this.decrypt(value, false);
  }

  /**
   * set serializer
   */
  public setSerializer<T extends Class<any>>(Driver?: T) {
    if (Driver) {
      this.serializer = /** @__PURE__ */ new Serializer(
        Serializer.validateSerializerDriver<T>(Driver)
      );
    }
    else {
      if (this.options.serializeMode === 'json') {
        this.serializer = /** @__PURE__ */ new Serializer(new JsonSerializer());
      }
      else {
        this.serializer = /** @__PURE__ */ new Serializer(new PhpSerializer());
      }
    }

    return this;
  }

  private keyBuffer(key: string, cipher: SupportedCipher = this.cipher): Buffer {
    const cipherLower = cipher.toLowerCase();
    if (!Encrypter.supportedCiphers.includes(cipherLower as SupportedCipher)) {
      throw new InvalidArgException(`Unsupported cipher or incorrect key length. Supported ciphers are: ${Encrypter.supportedCiphers.join(', ')}.`);
    }
    let keyBuffer: Buffer;
    if (key.startsWith('base64:')) {
      keyBuffer = Buffer.from(key.slice(7), 'base64');
    }
    else {
      keyBuffer = Buffer.from(key);
    }

    const requiredLength = cipherLower.includes('128') ? 16 : 32;
    if (keyBuffer.length !== requiredLength) {
      throw new InvalidArgException(`Invalid key length for cipher ${cipher}. Expected ${requiredLength} bytes.`);
    }

    return keyBuffer;
  }

  private hash(
    iv: string | Buffer,
    value: string | Buffer,
    key: Buffer = this.key,
    authTag?: string | Buffer
  ): string {
    // In GCM mode, include the auth tag in MAC calculation
    const dataToHash = Buffer.concat(
      !authTag
        ? [Buffer.from(iv), Buffer.from(value)]
        : [Buffer.from(iv), Buffer.from(value), Buffer.from(authTag)]
    );

    return createHmac(this.hashAlgorithm, key)
      .update(dataToHash)
      .digest('hex');
  }

  protected getJsonPayload(payload: string): JsonPayload {
    if (!isString(payload)) {
      throw new DecryptException('The payload is invalid.');
    }

    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      if (!this.validPayload(decoded)) {
        throw new DecryptException('Invalid payload structure!');
      }
      return decoded;
    }
    catch (e) {
      if (e instanceof DecryptException) {
        throw e;
      }
      throw new DecryptException('The payload is invalid!');
    }
  }

  protected validPayload(payload: any): boolean {
    if (!isObject<JsonPayload>(payload)) {
      return false;
    }

    const { iv, value, mac, tag } = payload;
    if (!iv || !value || !mac) {
      throw new InvalidArgException('Invalid payload structure.');
    }

    return !(tag && !isString(tag));
  }

  get getKey() {
    return this.key;
  }

  get getAllKeys() {
    return [this.key, ...this.previousKeys];
  }

  get getPreviousKeys() {
    return this.previousKeys;
  }

  public setPreviousKeys(keys: Array<string>): this {
    this.previousKeys = keys.map(
      key => this.keyBuffer(key)
    ).filter(Boolean);

    return this;
  }

  protected getIvLength(cipher: SupportedCipher = this.cipher): number {
    // GCM recommends 12-byte IV
    return cipher.includes('gcm') ? 12 : 16;
  }

  protected createIV<Alg extends (string | CipherGCMTypes), D extends boolean = false>(
    cipher: Alg = this.cipher as Alg,
    key: Buffer,
    iv: Buffer,
    decipher: D = false as D
  ): D extends true
      ? Alg extends CipherGCMTypes ? DecipherGCM : Decipher
      : Alg extends CipherGCMTypes ? CipherGCM : Cipher {
    // @ts-ignore
    return !decipher
      ? createCipheriv(cipher, key, iv)
      : createDecipheriv(cipher, key, iv);
  }
}

// public decrypt<T = any, S extends boolean = true>(
//     payload: string,
//     unserialize: S = true as S
//   ): S extends true ? T : string {
//     const decodedPayload = this.getJsonPayload(payload);
//     const iv = Buffer.from(decodedPayload.iv, 'base64');
//     const encryptedData = Buffer.from(decodedPayload.value, 'base64');
//
//     let tag;
//     if (this.cipher.includes('gcm')) {
//       if (!decodedPayload.tag) {
//         throw new DecryptException('Missing authentication tag.');
//       }
//       tag = Buffer.from(decodedPayload.tag, 'base64');
//     }
//
//     let foundValidMac = false;
//     let decrypted: Buffer | false = false;
//
//     for (const key of this.getAllKeys) {
//       // Verify MAC
//       const calculatedMac = this.cipher.includes('gcm')
//         ? this.hash(iv, encryptedData, key, tag)
//         : this.hash(iv, encryptedData, key);
//
//       foundValidMac ||= this.verifyMac(
//         Buffer.from(decodedPayload.mac, 'hex'),
//         Buffer.from(calculatedMac, 'hex')
//       );
//       if (!foundValidMac) {
//         continue;
//       }
//
//       const decipher = this.createIV(this.cipher, key, iv, true);
//       if (tag) {
//         (decipher as DecipherGCM).setAuthTag(tag);
//       }
//       try {
//         decrypted = Buffer.concat([
//           decipher.update(encryptedData),
//           decipher.final()
//         ]);
//         break;
//       }
//       catch {
//         decrypted = false;
//       }
//     }
//
//     if (!foundValidMac) {
//       throw new DecryptException('The MAC is invalid.');
//     }
//
//     if (decrypted === false) {
//       throw new DecryptException('Could not decrypt the data!');
//     }
//
//     return !unserialize
//       ? decrypted as any
//       : this.serializer.unserialize<T>(decrypted.toString('utf8'));
//   }
