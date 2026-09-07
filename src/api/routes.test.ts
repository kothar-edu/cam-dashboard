import { describe, it, expect, afterEach, vi } from 'vitest';
import { apiClient } from './client';
import { listPosts, getPost, deletePost } from './posts';
import { listVotingPolls, listNomineeVotingPlayers } from './voting';

/**
 * Pins the paths that moved in the backend revamp.
 *
 * These calls are otherwise only exercised through mocked hooks, so a wrong
 * path here typecheck-passes, unit-test-passes, and 404s in the browser -
 * which is exactly how the old newsfeed and voting URLs survived the move.
 */
describe('endpoint paths that moved', () => {
  const emptyPage = { data: { count: 0, results: [] } };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads posts from /newsfeed/, not the old top-level newsfeed/api/v1 prefix', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(emptyPage);

    await listPosts();
    await getPost('7');

    expect(getSpy.mock.calls.map((call) => call[0])).toEqual([
      '/newsfeed/post/',
      '/newsfeed/post/7/',
    ]);
  });

  it('deletes a post through the same prefix', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({ data: null });

    await deletePost('7');

    expect(deleteSpy).toHaveBeenCalledWith('/newsfeed/post/7/');
  });

  it('reads voting from /newsfeed/, not /game/ - voting is owned by the newsfeed app now', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(emptyPage);

    await listVotingPolls();
    await listNomineeVotingPlayers();

    expect(getSpy.mock.calls.map((call) => call[0])).toEqual([
      '/newsfeed/voting/',
      '/newsfeed/nominee-voting-player/',
    ]);
  });
});
