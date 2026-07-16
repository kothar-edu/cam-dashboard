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
  images?: Array<{ image_url: string; is_cover: boolean }>;
};

export type PostPayload = {
  post_type: string;
  title: string;
  description: string;
  post_date: string;
  post_time: string;
  status: string;
  tags?: string[];
  images?: Array<{ image_url: string; is_cover: boolean }>;
};

export async function getPost(id: string): Promise<PostDetail> {
  const { data } = await newsfeedClient.get<PostDetail>(`/post/${id}/`);
  return data;
}

export async function createPost(payload: PostPayload): Promise<PostDetail> {
  const { data } = await newsfeedClient.post<PostDetail>('/post/', payload);
  return data;
}

export async function updatePost(id: string, payload: PostPayload): Promise<PostDetail> {
  const { data } = await newsfeedClient.patch<PostDetail>(`/post/${id}/`, payload);
  return data;
}
