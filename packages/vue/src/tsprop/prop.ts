import type { Prop, PropType } from 'vue-demi';

export type VuePropType<T> = PropType<T> | true | null;

export type DefaultFactory<T> = (
  props: Record<string, unknown> | T,
) => T | null | undefined;

export type DefaultType<T> = T | DefaultFactory<T> | null | undefined | object;

export type RequiredProp<T, D> = Prop<T, D> & { required: true };

export type PropOptions<T, D> = Prop<T, D> & {
  def(value: D): PropOptions<T, D>,
  valid(validator: (value: D) => boolean): PropOptions<T, D>,
  get isRequired(): RequiredProp<T, D>
};

export type LiteralPropOptions<T> = Prop<T, T> & {
  def(value: T): LiteralPropOptions<T>,
  valid(validator: (value: T) => boolean): LiteralPropOptions<T>,
  get isRequired(): RequiredProp<T, T>
};

/* It's a class that takes a type parameter T, and returns a new instance of the VuePropType class, with a type property
set to the type parameter T */
export class PropFactory<T = any, D = T> {
  type?: VuePropType<T>;

  required?: boolean;

  default?: DefaultType<D>;

  validator?(value: D): boolean;

  /**
   * The constructor function takes a type parameter T, and returns a new instance of the VuePropType class, with a type
   * property set to the type parameter T
   * @param type - VuePropType<T>
   */
  constructor(type: VuePropType<T>) {
    this.type = type;
  }

  /**
   * If the value is not undefined, set the default value to the value, and return the options object.
   * @param {D} [value] - The value of the prop.
   * @returns The PropOptions<T, D> object.
   */
  def(value?: D): PropOptions<T, D> {
    this.default = value;
    return this;
  }

  /**
   * This function takes a validator function as an argument and sets the validator property of the PropOptions object to
   * the validator function.
   * @param validator - (value: D) => boolean
   * @returns The PropOptions object.
   */
  valid(validator: (value: D) => boolean): PropOptions<T, D> {
    this.validator = validator;
    return this;
  }

  /**
   * It returns the current instance of the class.
   * @returns The prop itself, but with the required flag set to true.
   */
  get isRequired() {
    this.required = true;
    return this as RequiredProp<T, D>;
  }
}

/**
 * It takes a VuePropType and returns a PropOptions
 * @param type - VuePropType<T>
 * @returns A function that takes a type and returns a PropOptions<T, D>
 */
export function defineProp<T, D = T>(type: VuePropType<T>): PropOptions<T, D> {
  return new PropFactory<T, D>(type);
}

/**
 * `literalType` is a function that takes a generic type `T` and returns a `LiteralPropOptions<T>` object
 * @returns A function that takes a type and returns a LiteralPropOptions<T>
 */
export function literalType<T>() {
  return defineProp<string | number | boolean, T>([
    String,
    Boolean,
    Number
  ]) as LiteralPropOptions<T>;
}
