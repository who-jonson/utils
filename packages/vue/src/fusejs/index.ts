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
  /**
   * It takes an array of items and an optional FuseOptions object, and then it creates a new Fuse instance with those
   * items and options, and then it runs the search with the current search value
   * @param items - DataT[] - The items to search through.
   * @param options - FuseOptions<DataT>
   */
  loadItems(items: DataT[], options?: FuseOptions<DataT>) {
    this.fuse = ref(new Fuse(items, options));
    this.runSearch(this.search.value);
  }

  /**
   * If there is no search string, clear the results. Otherwise, search the fuse
   * @param {string} [search] - The search string to use.
   * @returns The results of the search.
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
   * We create a new Fuse instance with the list of items and options, and then we create a computed property that returns
   * the results of the search
   * @param list - This is the list of items that you want to search. It can be an array of items, or a reactive object
   * that contains an array of items.
   * @param options - FuseOptions<DataT>
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

/**
 * It takes a list of data and an optional options object, and returns a FuseJS object that can be used to search the list
 * @param list - The list of data to search through.
 * @param [options] - FuseOptions<DataT>
 * @returns A new instance of the FuseJS class.
 */
export function useFuseJs<DataT>(list: MaybeReactive<DataT>, options?: FuseOptions<DataT>): FuseJS<DataT> {
  return new FuseJS<DataT>(list, options);
}
