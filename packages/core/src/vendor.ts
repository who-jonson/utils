import { camelCase, kebabCase, pascalCase, snakeCase, titleCase, trainCase } from 'scule';

/**
 * @category String
 */
export function changeCase(str: string, to: 'camel' | 'snake' | 'kebab' | 'pascal') {
  switch (to) {
    case 'camel':
      return camelCase(str);
    case 'kebab':
      return kebabCase(str);
    case 'pascal':
      return pascalCase(str);
    case 'snake':
      return snakeCase(str);
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
