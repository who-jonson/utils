import type { UserConfig } from 'vite';
import type { BuildConfig } from 'unbuild';
import type { RollupOptions } from 'rollup';

import minimist from 'minimist';
import { rollup } from 'rollup';
import { build as vite } from 'vite';
import { build as unBuild } from 'unbuild';

type BuilderType = 'vite' | 'rollup' | 'unbuild';

interface WhojBuild<T extends BuilderType> {
  builder: T;
  mode?: 'production' | 'development';
  rootDir?: string;
  stub?: boolean;
}

type Functionable<T> = T | ReturnType<(...args: never[]) => T>;
type Awaitable<T> = T | PromiseLike<T>;

type BuilderConfigType<T>
  = T extends 'rollup' ? Functionable<RollupOptions>
    : T extends 'vite' ? Awaitable<UserConfig>
      : Awaitable<BuildConfig>;

type BuilderReturnType<T>
  = T extends 'rollup' ? ReturnType<typeof rollup>
    : T extends 'vite' ? ReturnType<typeof vite>
      : ReturnType<typeof unBuild>;

interface BuilderResult<T extends BuilderType> {
  <D extends WhojBuild<T>, K = BuilderConfigType<T>>
  (options: D, builderConfig: K): BuilderReturnType<T>;
}

const rollupBuild: BuilderResult<'rollup'> = function (options, builderConfig) {
  // @ts-ignore
  return rollup(builderConfig);
};

const viteBuild: BuilderResult<'vite'> = function (options, builderConfig) {
  return vite({
    configFile: false,
    mode: options.mode,
    ...builderConfig
  });
};

const unbuild: BuilderResult<'unbuild'> = function ({ rootDir = process.cwd(), stub = false }, builderConfig) {
  // @ts-ignore
  return unBuild(rootDir, stub, builderConfig);
};

function isValidBuilder(builder: string): builder is BuilderType {
  return ['vite', 'rollup', 'unbuild'].includes(builder);
}

function getBuilder(builder: string): BuilderType {
  return isValidBuilder(builder)
    ? builder
    : 'unbuild';
}

async function run<T extends BuilderType>(options: WhojBuild<T>, config: BuilderConfigType<T>) {
  const builder = getBuilder(options.builder);
  if (builder === 'rollup') {
    return rollupBuild({ ...options, builder }, config);
  }
  else if (builder === 'vite') {
    return viteBuild({ ...options, builder }, config);
  }
  else {
    return unbuild({ ...options, builder }, config);
  }
}

(async (args?: any) => {
  const opt = {
    builder: getBuilder(args?.builder),
    mode: args?.mode || process.env.NODE_ENV,
    rootDir: args?.root || args?.rootDir || process.cwd(),
    stub: !!args?.stub
  };

  await run<typeof opt.builder>(opt, {});
})(minimist(process.argv.slice(2)));
