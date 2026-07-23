import { newsfeedClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type Post = {
  id: string;
  post_type: string;
  title: string;
  slug: string;
  description: string;
  post_date: string | null;
  post_time: string | null;
  like_count: number;
  comment_count: number;
  cover_image: string | null;
};

export async function listPosts(params?: ListParams): Promise<Paginated<Post>> {
  const response = await newsfeedClient.get<Paginated<Post> | Post[]>('/post/', { params });
  return parsePaginated(response.data);
}

export type PostDetail = Post & {
  description: string;
  post_type: string;
  status: string;
  is_public: boolean;
  images?: Array<{ id: number; image: string | null; is_cover: boolean }>;
};

export type PostPayload = {
  post_type: string;
  title: string;
  description: string;
  // Left undefined when the admin doesn't set a date/time - the backend
  // defaults both to the server clock at creation time rather than have
  // the dashboard guess using the browser's own timezone.
  post_date?: string;
  post_time?: string;
  status: string;
  is_public: boolean;
  tags?: string[];
  cover_image?: File | null;
};

export async function getPost(id: string): Promise<PostDetail> {
  const { data } = await newsfeedClient.get<PostDetail>(`/post/${id}/`);
  return data;
}

function appendPostFields(form: FormData, payload: PostPayload) {
  form.append('post_type', payload.post_type);
  form.append('title', payload.title);
  form.append('description', payload.description);
  if (payload.post_date) form.append('post_date', payload.post_date);
  if (payload.post_time) form.append('post_time', payload.post_time);
  form.append('status', payload.status);
  form.append('is_public', String(payload.is_public));
  (payload.tags ?? []).forEach((tag) => form.append('tags', tag));
  if (payload.cover_image) form.append('cover_image', payload.cover_image);
}

function jsonPostFields(payload: PostPayload) {
  return {
    post_type: payload.post_type,
    title: payload.title,
    description: payload.description,
    ...(payload.post_date ? { post_date: payload.post_date } : {}),
    ...(payload.post_time ? { post_time: payload.post_time } : {}),
    status: payload.status,
    is_public: payload.is_public,
    tags: payload.tags ?? [],
  };
}

export async function createPost(payload: PostPayload): Promise<PostDetail> {
  if (payload.cover_image) {
    const form = new FormData();
    appendPostFields(form, payload);
    const { data } = await newsfeedClient.post<PostDetail>('/post/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await newsfeedClient.post<PostDetail>('/post/', jsonPostFields(payload));
  return data;
}

export async function updatePost(id: string, payload: PostPayload): Promise<PostDetail> {
  if (payload.cover_image) {
    const form = new FormData();
    appendPostFields(form, payload);
    const { data } = await newsfeedClient.patch<PostDetail>(`/post/${id}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await newsfeedClient.patch<PostDetail>(`/post/${id}/`, jsonPostFields(payload));
  return data;
}

export async function deletePost(id: string): Promise<void> {
  await newsfeedClient.delete(`/post/${id}/`);
}
