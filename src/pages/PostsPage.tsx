import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '@/api/posts';
import { DataTable } from '@/components/data-table/DataTable';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenant } from '@/contexts/TenantContext';
import { usePosts, useDeletePost } from '@/hooks/usePosts';

const PAGE_SIZE = 20;

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PostsPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Post | null>(null);
  const { data, isLoading, isError } = usePosts({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });
  const deletePost = useDeletePost();

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load posts.
        </p>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load posts. Check your API connection and tenant access.
      </div>
    );
  }

  const posts = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Posts</h1>
          <p className="text-sm text-muted-foreground">
            {activeTenant.name} · news and events
          </p>
        </div>
        <Link
          to="/dashboard/posts/new"
          className="inline-flex w-full items-center justify-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white sm:w-auto"
        >
          New Post
        </Link>
      </div>

      <DataTable
        columns={[
          { id: 'title', header: 'Title', cell: (row) => row.title },
          { id: 'type', header: 'Type', cell: (row) => row.post_type },
          {
            id: 'date',
            header: 'Date',
            cell: (row) => formatDate(row.post_date),
          },
          { id: 'likes', header: 'Likes', cell: (row) => row.like_count },
          {
            id: 'actions',
            header: 'Actions',
            cell: (row) => (
              <>
                <Link
                  to={`/dashboard/posts/${row.id}`}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-[#12233D]"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => { setTargetRow(row); setConfirmOpen(true); }}
                  className="ml-2 inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-red-600"
                >
                  Delete
                </button>
              </>
            ),
          },
        ]}
        data={posts}
        loading={isLoading}
        emptyMessage="No posts found."
        pagination={
          data ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count } : undefined
        }
        onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this post?"
        description="This permanently removes the post and cannot be undone."
        confirmLabel="Delete"
        isLoading={deletePost.isPending}
        onConfirm={() => {
          if (!targetRow) return;
          deletePost.mutate(targetRow.id, { onSuccess: () => setConfirmOpen(false) });
        }}
      />
    </div>
  );
}
