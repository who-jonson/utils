import type { Class } from '@whoj/utils-types';

import { tap, isFunction } from '@whoj/utils-core';

import type { Serializer as SerializerInterface } from './contracts';

import { InvalidArgException } from './exceptions';

export class Serializer implements SerializerInterface {
  constructor(private readonly driver: InstanceType<Class<SerializerInterface>>) {}

  /**
   * Serialize
   */
  serialize(data: any) {
    if (!data)
      return;

    return this.driver.serialize(data);
  }

  /**
   * unserialize
   */
  unserialize<T>(data: string) {
    if (!data)
      return;

    return this.driver.unserialize<T>(data);
  }

  /**
   * get driver class name
   */
  get driverName() {
    return this.driver.constructor.name;
  }

  /**
   * validateSerializerDriver
   */
  static validateSerializerDriver<T extends Class<any>>(Driver: T): InstanceType<T> {
    return tap(new Driver(), (driver) => {
      if (!isFunction(driver.serialize) || !isFunction(driver.unserialize)) {
        throw new InvalidArgException('Invalid driver structure!');
      }

      return driver;
    });
  }
}
