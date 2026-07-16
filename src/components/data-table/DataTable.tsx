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

function LoadingRows({ columnCount }: { columnCount: number }) {
  return (
    <>
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <TableRow key={`loading-${rowIndex}`} data-testid="data-table-loading">
          {Array.from({ length: columnCount }).map((__, colIndex) => (
            <TableCell key={`loading-cell-${colIndex}`}>
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingRows columnCount={columns.length} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && onPaginationChange ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pagination.pageIndex + 1} of {pageCount} ({pagination.totalCount} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded border px-3 py-1 disabled:opacity-50"
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
              className="rounded border px-3 py-1 disabled:opacity-50"
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
