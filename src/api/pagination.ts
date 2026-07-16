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
