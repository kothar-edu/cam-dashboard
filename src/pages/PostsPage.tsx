import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Post } from '@/api/posts';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { SettingsEmptyState, SettingsSummaryChip } from '@/components/settings/AppSettingsPanel';
import { useTenant } from '@/contexts/TenantContext';
import { usePosts, useDeletePost } from '@/hooks/usePosts';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

type PostsPageProps = {
  embedded?: boolean;
};

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function stripMarkdown(value: string) {
  return value
    .replace(/[#>*_`~\-\[\]()!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function PostsPage({ embedded = false }: PostsPageProps) {
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
  const totalCount = data?.count ?? 0;
  const totalLikes = posts.reduce((sum, post) => sum + (post.like_count ?? 0), 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const newPostLink = (
    <Link
      to="/dashboard/posts/new"
      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a3358]"
    >
      <Plus className="h-4 w-4" />
      New post
    </Link>
  );

  return (
    <div className="space-y-5">
      {embedded ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            News and events shown in the mobile app for {activeTenant.name}.
          </p>
          {newPostLink}
        </div>
      ) : (
        <PageHeader
          title="Posts"
          description={`${activeTenant.name} · news and events`}
          action={newPostLink}
        />
      )}

      {posts.length === 0 && pageIndex === 0 ? (
        <SettingsEmptyState
          title="No posts yet"
          description="Publish news and events so players and fans see updates in the app."
          action={newPostLink}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SettingsSummaryChip
              icon={<Newspaper className="h-3.5 w-3.5" />}
              label="Posts"
              value={String(totalCount)}
            />
            <SettingsSummaryChip
              icon={<Heart className="h-3.5 w-3.5" />}
              label="Likes (page)"
              value={String(totalLikes)}
            />
            <SettingsSummaryChip
              icon={<MessageCircle className="h-3.5 w-3.5" />}
              label="On this page"
              value={String(posts.length)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => {
                  setTargetRow(post);
                  setConfirmOpen(true);
                }}
              />
            ))}
          </div>

          {totalCount > PAGE_SIZE ? (
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-xs text-muted-foreground">
                Page {pageIndex + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <PaginationButton
                  disabled={pageIndex === 0}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                >
                  Previous
                </PaginationButton>
                <PaginationButton
                  disabled={pageIndex + 1 >= totalPages}
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  Next
                </PaginationButton>
              </div>
            </div>
          ) : null}
        </>
      )}

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

function PostCard({ post, onDelete }: { post: Post; onDelete: () => void }) {
  const excerpt = stripMarkdown(post.description || '').slice(0, 110);
  return (
    <article className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-[#E8A93B]/40">
      <div className="relative w-24 shrink-0 bg-gradient-to-br from-[#12233D] to-[#1a3358] sm:w-28">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Newspaper className="h-7 w-7 text-[#E8A93B]/70" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#12233D]/5 px-2 py-0.5 text-[11px] font-semibold text-[#12233D]">
            {post.post_type}
          </span>
          <span className="text-[11px] text-muted-foreground">{formatDate(post.post_date)}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#12233D]">
          {post.title}
        </h3>
        {excerpt ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {excerpt}
            {post.description && post.description.length > 110 ? '…' : ''}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3 w-3 text-[#E8A93B]" />
              {post.like_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {post.comment_count}
            </span>
          </div>
          <div className="flex gap-1.5">
            <Link
              to={`/dashboard/posts/${post.id}`}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-[#12233D] transition hover:border-[#E8A93B]/50 hover:bg-[#E8A93B]/5"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-[#12233D]',
        disabled ? 'opacity-40' : 'hover:border-[#E8A93B]/50 hover:bg-[#E8A93B]/5'
      )}
    >
      {children}
    </button>
  );
}
