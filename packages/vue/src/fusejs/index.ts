import Fuse from 'fuse.js';
import { computed, ref, watch } from 'vue-demi';
import type { ComputedRef, Ref } from 'vue-demi';

export type FuseOptions<T> = Fuse.IFuseOptions<T>;

export type FuseResult<T> = Fuse.FuseResult<T>;

export type MaybeReactive<DataT> = ComputedRef<Array<DataT>> | Array<DataT> | Ref<Array<DataT>> | Ref<null> | Ref<null | Array<DataT>>;

export class FuseJS<DataT> {
  /**
   * @type Ref
   */
  fuse: Ref<Fuse<DataT>>;

  /**
   * @type Ref
   */
  resultsRaw: Ref<FuseResult<DataT>[]>;

  /**
   * @type ComputedRef
   */
  results: ComputedRef<Array<DataT>>;

  /**
   * @type Ref
   */
  search: Ref<string>;

  /**
   * @type ComputedRef
   */
  noResults: ComputedRef<boolean>;

  /**
   * @param items
   * @param options
   */
  loadItems(items: DataT[], options?: FuseOptions<DataT>) {
    this.fuse = ref(new Fuse(items, options));
    this.runSearch(this.search.value);
  }

  /**
   * @param search
   */
  runSearch(search?: string) {
    if (!this.fuse)
      return;

    if (!search) {
      this.resultsRaw.value = [];
      return;
    }
    this.resultsRaw.value = this.fuse.value.search(search as string);
  }

  /**
   * @constructor
   *
   * @param list
   * @param options
   */
  constructor(list: MaybeReactive<DataT>, options?: FuseOptions<DataT>) {
    this.search = ref('');

    let locArr: Array<DataT> = [];
    if (Array.isArray(list)) {
      locArr = list;
    }
    else if (list) {
      locArr = list.value ?? [];
      watch(list, () => {
        this.loadItems(list.value ?? []);
      });
    }
    this.fuse = ref(new Fuse(locArr, options));

    this.resultsRaw = ref([]);

    this.noResults = computed(() => {
      return this.results.value.length === 0 && this.search.value.length > 0;
    });

    this.results = computed(() => this.resultsRaw.value.map(r => r.item));

    watch(this.search, this.runSearch);
  }
}

export function useFuseJs<DataT>(list: MaybeReactive<DataT>, options?: FuseOptions<DataT>): FuseJS<DataT> {
  return new FuseJS<DataT>(list, options);
}
