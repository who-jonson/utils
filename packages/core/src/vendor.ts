import { camelCase, kebabCase, snakeCase, pascalCase } from 'scule';

/**
 * @category String
 *
 * @__NO_SIDE_EFFECTS__
 */
export function changeCase(str: string, to: 'camel' | 'snake' | 'kebab' | 'pascal') {
  switch (to) {
    case 'camel':
      return /*@__PURE__*/ camelCase(str);
    case 'kebab':
      return /*@__PURE__*/ kebabCase(str);
    case 'pascal':
      return /*@__PURE__*/ pascalCase(str);
    case 'snake':
      return /*@__PURE__*/ snakeCase(str);
    default:
      return str;
  }
}

export * from 'throttle-debounce';

export {
  dotCase,
  pathCase,
  capitalCase,
  constantCase,
  sentenceCase
} from 'change-case';

export {
  flatCase,
  camelCase,
  kebabCase,
  snakeCase,
  titleCase,
  trainCase,
  lowerFirst,
  pascalCase,
  upperFirst,
  isUppercase,
  splitByCase,
  kebabCase as paramCase
} from 'scule';

export {
  deepKeys,
  escapePath,
  getProperty,
  hasProperty,
  setProperty,
  deleteProperty,
  getProperty as getObjProp,
  hasProperty as hasObjProp,
  setProperty as setObjProp,
  deleteProperty as deleteObjProp
} from 'dot-prop';
