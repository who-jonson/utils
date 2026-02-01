# Dependency Upgrade Notes

**Date:** 2026-02-01
**Branch:** deps/upgrade-to-latest

## Breaking Changes Encountered

### Critical (Fixed Immediately)
- (none yet)

### Non-Critical (Batched)
- **TypeScript typecheck fails with TS6305 errors**: Pre-existing issue with `composite: true` and generated `.d.ts` files. Build and tests pass successfully. Typecheck command may need updating to use tsc -b or exclude composite flag.
- **Lint errors on build artifacts**: ESLint is picking up generated `.cjs`/`.mjs`/`.d.cts`/`.d.mts` files in source tree during lint. These appear to be symlinks or build artifacts that should be excluded from linting. Auto-fixable issues were fixed.
- **Pre-existing unused variable warnings**: 9 warnings about unused variables in source code (not related to dependency upgrades)

## Rollbacks/Blocked Upgrades
- (none yet)

## pnpm Catalog Migration
- ✅ Created comprehensive catalog in pnpm-workspace.yaml
- ✅ Migrated all dependencies to use catalog: protocol
- ✅ Removed overrides section (replaced by catalog)
- ✅ Fixed catalog version mismatches:
  - fuse.js: ^6.6.2 → ^7.0.0 (matches installed version)
  - unplugin: 3.0.0 → ^3.0.0 (consistency with other deps)
  - Updated packages/vue peerDependencies to use catalog: protocol
- ✅ All validations pass with catalog system
  - Build: All packages build successfully
  - Tests: 8/8 tests pass
  - Lint: No errors (only pre-existing warnings)

## Batches Completed
- [x] Batch 1: Build & Bundling Tools - COMPLETED
  - All packages build successfully with rollup, esbuild, typescript upgrades
  - All tests pass (8/8)
  - No critical issues encountered
- [ ] Batch 2: Testing & Development Tools
- [x] Batch 3: Framework & Core Runtime (+ Vue 3 migration) - COMPLETED
  - Upgraded Vue to 3.5.27
  - Completed Vue 3 migration (removed vue-demi)
  - All builds, tests, and validations pass
- [ ] Batch 4: Utility Dependencies & Peer Dependencies
- [x] Catalog Migration - COMPLETED

## Vue 3 Migration
- ✅ Removed vue-demi from all dependencies
- ✅ Updated all imports from 'vue-demi' to 'vue'
- ✅ Removed isVue3 compatibility checks
- ✅ Updated peerDependencies to Vue >=3.2
- ✅ Removed vue-demi from build configuration
- ✅ All packages build and test successfully with Vue 3

## Breaking Changes
- **@whoj/utils-vue**: Now requires Vue >=3.2.0 (Vue 2 support dropped)
  - Removed vue-demi dependency completely
  - All Vue 2 compatibility code removed
  - Directive lifecycle hooks updated to Vue 3 only (beforeMount instead of bind)
  - Updated CLAUDE.md to reflect Vue 3-only support
  - Fixed fuse.js peerDependency to support v7 (was only listing v6)
  - Vue peerDependency remains >=3.2.0 (supports Vue 3 and future Vue 4)

