export type Paginated<T> = { count: number; results: T[] };

export type ListParams = {
  limit?: number;
  offset?: number;
  search?: string;
  [key: string]: string | number | undefined;
};

export function parsePaginated<T>(data: Paginated<T> | T[]): Paginated<T> {
  if (Array.isArray(data)) {
    return { count: data.length, results: data };
  }
  return {
    count: data.count ?? data.results?.length ?? 0,
    results: data.results ?? [],
  };
}

/**
 * Params for a list request that fills a dropdown rather than a paged table.
 *
 * Every list endpoint is paginated server-side (default 20; 200 is the hard ceiling on most of them), so
 * a picker that passes no limit silently shows the first 20 rows and offers no
 * way to reach the rest. Pickers pass this instead.
 */
export const PICKER_LIST_PARAMS: ListParams = { limit: 200 };
