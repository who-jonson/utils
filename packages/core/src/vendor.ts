import { camelCase, kebabCase, pascalCase, snakeCase, titleCase, trainCase } from 'scule';

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

export {
  throttle,
  debounce
} from 'throttle-debounce';

export {
  getProperty,
  setProperty,
  hasProperty,
  deleteProperty,
  getProperty as getObjProp,
  setProperty as setObjProp,
  hasProperty as hasObjProp,
  deleteProperty as deleteObjProp
} from 'dot-prop';

export {
  dotCase,
  pathCase,
  capitalCase,
  constantCase,
  sentenceCase
} from 'change-case';

export {
  camelCase,
  kebabCase,
  pascalCase,
  snakeCase,
  titleCase,
  trainCase,
  kebabCase as paramCase
};
