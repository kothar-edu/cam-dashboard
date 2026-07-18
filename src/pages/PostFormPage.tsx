import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { PageHeader } from '@/components/forms/PageHeader';
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
  const [postType, setPostType] = useState('Blog');
  const [status, setStatus] = useState('Published');
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('12:00:00');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (postQuery.data) {
      setTitle(postQuery.data.title);
      setDescription(postQuery.data.description);
      setPostType(postQuery.data.post_type);
      setStatus(postQuery.data.status);
      setPostDate(postQuery.data.post_date ?? '');
      setPostTime(postQuery.data.post_time ?? '12:00:00');
      setImageUrl(postQuery.data.images?.[0]?.image_url ?? postQuery.data.cover_image ?? '');
      setIsPublic(postQuery.data.is_public ?? true);
    }
  }, [postQuery.data]);

  const buildPayload = () => ({
    post_type: postType,
    title: title.trim(),
    description,
    post_date: postDate || new Date().toISOString().slice(0, 10),
    post_time: postTime,
    status,
    is_public: isPublic,
    tags: [] as string[],
    images: imageUrl ? [{ image_url: imageUrl, is_cover: true }] : undefined,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = buildPayload();
    if (isEdit && id) {
      updateMutation.mutate({ id, payload }, { onSuccess: () => navigate('/dashboard/posts') });
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => navigate('/dashboard/posts') });
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title={isEdit ? 'Edit post' : 'Create post'} backTo="/dashboard/posts" />
        {isEdit && postQuery.isLoading ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-lg border bg-white p-6">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#12233D]">Description</label>
              <textarea
                className="min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <Input label="Cover image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <Input label="Post date" type="date" value={postDate} onChange={(e) => setPostDate(e.target.value)} />
            <Input label="Post time" type="time" value={postTime.slice(0, 5)} onChange={(e) => setPostTime(`${e.target.value}:00`)} />
            <SearchableSelect
              label="Type"
              value={postType}
              onChange={setPostType}
              options={['Blog', 'News', 'Announcement'].map((option) => ({
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
            {isEdit ? (
              <label className="flex items-center gap-2 text-sm text-[#12233D]">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
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
