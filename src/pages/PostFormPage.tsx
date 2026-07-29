import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { PageHeader } from '@/components/forms/PageHeader';
import { FileField } from '@/components/forms/FileField';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreatePost, usePost, useUpdatePost } from '@/hooks/usePosts';

export default function PostFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const postQuery = usePost(id);
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState('News');
  const [status, setStatus] = useState('Published');
  // Left blank on create - the backend stamps the server's current date/time
  // when these are omitted, rather than the dashboard guessing with the
  // browser's own timezone. See the hint text next to the fields.
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (postQuery.data) {
      setTitle(postQuery.data.title);
      setDescription(postQuery.data.description);
      setPostType(postQuery.data.post_type);
      setStatus(postQuery.data.status);
      setPostDate(postQuery.data.post_date ?? '');
      setPostTime(postQuery.data.post_time ?? '');
      setIsPublic(postQuery.data.is_public ?? true);
    }
  }, [postQuery.data]);

  const currentCoverUrl =
    postQuery.data?.images?.find((img) => img.is_cover)?.image ??
    postQuery.data?.images?.[0]?.image ??
    postQuery.data?.cover_image ??
    null;

  const buildPayload = () => ({
    post_type: postType,
    title: title.trim(),
    description,
    post_date: postDate || undefined,
    post_time: postTime || undefined,
    status,
    is_public: isPublic,
    tags: [] as string[],
    cover_image: coverImage,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = buildPayload();
    if (isEdit && id) {
      updateMutation.mutate(
        { id, payload },
        { onSuccess: () => navigate('/dashboard/posts') }
      );
      return;
    }
    createMutation.mutate(payload, {
      onSuccess: () => navigate('/dashboard/posts'),
    });
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title={isEdit ? 'Edit post' : 'Create post'}
          backTo="/dashboard/posts"
          backLabel="Posts"
        />
        {isEdit && postQuery.isLoading ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-lg border bg-white p-6">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="space-y-2" data-color-mode="light">
              <label className="text-sm font-medium text-[#12233D]">Description</label>
              <MDEditor
                value={description}
                onChange={(value) => setDescription(value ?? '')}
                height={240}
                preview="live"
                textareaProps={{ required: true }}
              />
              <p className="text-xs text-gray-500">
                Supports Markdown (headings, bold, lists, links) - the mobile app renders it
                formatted.
              </p>
            </div>
            <FileField label="Cover image" onChange={setCoverImage} currentUrl={currentCoverUrl} />
            <div className="max-w-2xl space-y-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Post date (optional)"
                  type="date"
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                />
                <Input
                  label="Post time (optional)"
                  type="time"
                  value={postTime.slice(0, 5)}
                  onChange={(e) => setPostTime(e.target.value ? `${e.target.value}:00` : '')}
                />
              </div>
              <p className="text-xs text-gray-500">
                Leave blank to publish with the current date and time.
              </p>
            </div>
            <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <SearchableSelect
                label="Type"
                value={postType}
                onChange={setPostType}
                options={['Blog', 'News', 'Event', 'Match Update'].map((option) => ({
                  value: option,
                  label: option,
                }))}
                searchable={false}
              />
              <SearchableSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={['Published', 'Draft'].map((option) => ({
                  value: option,
                  label: option,
                }))}
                searchable={false}
              />
            </div>
            {isEdit ? (
              <label className="flex items-center gap-2 text-sm text-[#12233D]">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Public post (visible to guests and non-members)
              </label>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
