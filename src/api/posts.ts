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
