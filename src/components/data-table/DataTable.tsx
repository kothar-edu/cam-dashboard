import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  hideBelow?: 'sm' | 'md' | 'lg';
};

export type DataTablePagination = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
};

type DataTableProps<T extends { id: string | number }> = {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: DataTablePagination;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  emptyMessage?: string;
};

const hideBelowClass: Record<NonNullable<DataTableColumn<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

function LoadingRows({ columns }: { columns: DataTableColumn<unknown>[] }) {
  return (
    <>
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <TableRow key={`loading-${rowIndex}`} data-testid="data-table-loading">
          {columns.map((column) => (
            <TableCell
              key={`loading-cell-${column.id}`}
              className={[
                column.className,
                column.hideBelow ? hideBelowClass[column.hideBelow] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="h-4 w-full min-w-[4rem] animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  pagination,
  onPaginationChange,
  emptyMessage = 'No results found.',
}: DataTableProps<T>) {
  const pageCount = pagination
    ? Math.max(1, Math.ceil(pagination.totalCount / pagination.pageSize))
    : 1;
  const canPrevious = pagination ? pagination.pageIndex > 0 : false;
  const canNext = pagination ? pagination.pageIndex < pageCount - 1 : false;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border bg-white">
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={[
                      'whitespace-nowrap',
                      column.className,
                      column.hideBelow ? hideBelowClass[column.hideBelow] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <LoadingRows columns={columns as DataTableColumn<unknown>[]} />
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={[
                          column.className,
                          column.hideBelow ? hideBelowClass[column.hideBelow] : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && onPaginationChange ? (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="min-w-0">
            Page {pagination.pageIndex + 1} of {pageCount} ({pagination.totalCount} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded border px-3 py-1.5 disabled:opacity-50 sm:flex-initial"
              disabled={!canPrevious}
              onClick={() =>
                onPaginationChange({
                  pageIndex: pagination.pageIndex - 1,
                  pageSize: pagination.pageSize,
                })
              }
            >
              Previous
            </button>
            <button
              type="button"
              className="flex-1 rounded border px-3 py-1.5 disabled:opacity-50 sm:flex-initial"
              disabled={!canNext}
              onClick={() =>
                onPaginationChange({
                  pageIndex: pagination.pageIndex + 1,
                  pageSize: pagination.pageSize,
                })
              }
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
