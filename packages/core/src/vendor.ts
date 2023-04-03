import { camelCase, kebabCase, pascalCase, snakeCase } from 'scule';

export { throttle, debounce } from 'throttle-debounce';

export {
  getProperty as getObjProp,
  setProperty as setObjProp,
  hasProperty as hasObjProp,
  deleteProperty as deleteObjProp
} from 'dot-prop';

export { dotCase } from 'dot-case';
export { pathCase } from 'path-case';
export { paramCase } from 'param-case';

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

export { camelCase, kebabCase, pascalCase, snakeCase };
