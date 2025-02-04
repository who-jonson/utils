import { Serializer } from './Serializer';
import type { Class } from '@whoj/utils-types';
import { PhpSerializer } from '../serializers/phpSerializer';
import { JsonSerializer } from '../serializers/jsonSerializer';
import { isString, isObject, objectKeys } from '@whoj/utils-core';
import type { StringEncrypter, Encrypter as EncrypterContract } from './contracts';
import { EncryptException, DecryptException, InvalidArgException } from './exceptions';
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

export class Encrypter implements EncrypterContract, StringEncrypter {
  private readonly key: Buffer;
  private previousKeys: Array<Buffer> = [];

  protected serializer: Serializer;

  private static supportedCiphers = {
    'aes-128-cbc': { size: 16, aead: false },
    'aes-256-cbc': { size: 32, aead: false },
    'aes-128-gcm': { size: 16, aead: true },
    'aes-256-gcm': { size: 32, aead: true }
  } as const;

  constructor(
    key: string | Buffer,
    protected readonly cipher: keyof typeof Encrypter.supportedCiphers = 'aes-128-cbc',
    protected options: EncrypterOptions = { serializeMode: 'php' }
  ) {
    this.key = this.keyBuffer(key);
    this.setSerializer();
  }

  public static supported(key: Buffer, cipher: string): boolean {
    const cipherInfo = Encrypter.supportedCiphers[cipher.toLowerCase()];

    return !cipherInfo
      ? false
      : Buffer.byteLength(key) === cipherInfo.size;
  }

  public static generateKey(cipher: string): Buffer {
    return randomBytes(Encrypter.supportedCiphers[cipher.toLowerCase()]?.size ?? 32);
  }

  public encrypt(value: any, serialize: boolean = true): string {
    if (serialize) {
      value = this.serializer.serialize(value);
    }
    const iv = randomBytes(this.getIvLength());
    const cipher = createCipheriv(
      this.cipher,
      this.key,
      iv, // @ts-ignore
      { authTagLength: 16 }
    );
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final()
    ]).toString('base64');
    const tag = cipher.getAuthTag();

    if (!encrypted) {
      throw new EncryptException('Could not encrypt the data!');
    }

    const mac = Encrypter.supportedCiphers[this.cipher.toLowerCase()].aead
      ? ''
      : this.hash(iv.toString('base64'), encrypted, this.key);

    const payload = JSON.stringify({
      iv: iv.toString('base64'),
      value: encrypted,
      mac,
      tag: tag?.toString('base64')
    } satisfies JsonPayload);

    return Buffer.from(payload).toString('base64');
  }

  public encryptString(value: string) {
    return this.encrypt(value, false);
  }

  public decrypt<T = any, S extends boolean = true>(
    payload: string,
    unserialize: S = true as S
  ): S extends true ? T : string {
    const decodedPayload = this.getJsonPayload(payload);
    const iv = Buffer.from(decodedPayload.iv, 'base64');
    const tag = decodedPayload.tag
      ? Buffer.from(decodedPayload.tag, 'base64')
      : undefined;
    const shouldValidateMac = this.shouldValidateMac();
    let foundValidMac = false;
    let decrypted: string | false = false;

    for (const key of this.getAllKeys) {
      if (shouldValidateMac) {
        foundValidMac ||= this.validMacForKey(decodedPayload, key);
        if (!foundValidMac) {
          continue;
        }
      }

      const decipher = createDecipheriv(
        this.cipher,
        key,
        iv, // @ts-ignore
        { authTagLength: 16 }
      );

      if (tag)
        decipher.setAuthTag(tag);
      try {
        decrypted = Buffer.concat([
          decipher.update(decodedPayload.value, 'base64'),
          decipher.final()
        ]).toString('utf8');
        break;
      }
      catch {
        decrypted = false;
      }
    }

    if (shouldValidateMac && !foundValidMac) {
      throw new DecryptException('The MAC is invalid.');
    }

    if (decrypted === false) {
      throw new DecryptException('Could not decrypt the data!');
    }

    return !unserialize
      ? decrypted as any
      : this.serializer.unserialize<T>(decrypted);
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

  private keyBuffer(key: string | Buffer): Buffer {
    if (isString(key)) {
      if (key.startsWith('base64:')) {
        key = key.substring(7);
        key = Buffer.from(key, 'base64');
      }
      else {
        key = Buffer.from(key);
      }
    }

    if (!Encrypter.supported(key, this.cipher)) {
      const ciphers = objectKeys(Encrypter.supportedCiphers).join(', ');
      throw new InvalidArgException(`Unsupported cipher or incorrect key length. Supported ciphers are: ${ciphers}.`);
    }

    return key;
  }

  protected hash(iv: string, value: string, key: string | Buffer): string {
    return createHmac('sha256', key)
      .update(iv + value)
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
    for (const item of ['iv', 'value', 'mac']) {
      if (!isString(payload[item])) {
        return false;
      }
    }
    if (payload.tag && !isString(payload.tag)) {
      return false;
    }
    return Buffer.from(payload.iv, 'base64').length === this.getIvLength();
  }

  protected validMac(payload: JsonPayload): boolean {
    return this.validMacForKey(payload, this.key);
  }

  protected validMacForKey(payload: JsonPayload, key: Buffer): boolean {
    const expected = Buffer.from(payload.mac, 'hex');
    const actual = Buffer.from(this.hash(payload.iv, payload.value, key), 'hex');

    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  protected ensureTagIsValid(tag: string): void {
    if (Encrypter.supportedCiphers[this.cipher.toLowerCase()].aead && tag.length !== 16) {
      throw new DecryptException('Could not decrypt the data.');
    }

    if (!Encrypter.supportedCiphers[this.cipher.toLowerCase()].aead) {
      throw new DecryptException('Unable to use tag because the cipher algorithm does not support AEAD.');
    }
  }

  protected shouldValidateMac(): boolean {
    return !Encrypter.supportedCiphers[this.cipher.toLowerCase()].aead;
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

  public setPreviousKeys(keys: Array<string | Buffer>): this {
    this.previousKeys = keys.map(
      key => this.keyBuffer(key)
    ).filter(Boolean);

    return this;
  }

  protected getIvLength(): number {
    return Encrypter.supportedCiphers[this.cipher.toLowerCase()].size;
  }
}
