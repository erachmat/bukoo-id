import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  communityApi,
  CommunityPostDto,
  CommunityPostType,
  CommunityEventDto,
  CommunityCommentDto,
} from './api';
import { useAuthStore } from '../stores/authStore';

const POSTS_CACHE_KEY = '@bukoo_community_posts_cache';
const EVENTS_CACHE_KEY = '@bukoo_community_events_cache';

function isAuthenticated(): boolean {
  return !!useAuthStore.getState().user;
}

function cachePosts(posts: CommunityPostDto[]): void {
  AsyncStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(posts)).catch((e) =>
    console.error('[communityService] Error caching posts:', e),
  );
}

function cacheEvents(events: CommunityEventDto[]): void {
  AsyncStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(events)).catch((e) =>
    console.error('[communityService] Error caching events:', e),
  );
}

/**
 * Server-first community service with a read-through AsyncStorage cache used
 * only as an offline fallback. Mutations are optimistic with rollback.
 */
export const communityService = {
  getPosts: async (cursor?: string): Promise<{ items: CommunityPostDto[]; nextCursor: string | null }> => {
    if (!isAuthenticated()) {
      return { items: [], nextCursor: null };
    }
    try {
      const page = await communityApi.getPosts({ cursor });
      if (cursor) {
        const cached = await communityService.getCachedPosts();
        const seen = new Set(cached.map((p) => p.id));
        cachePosts([...cached, ...page.items.filter((p) => !seen.has(p.id))]);
      } else {
        cachePosts(page.items);
      }
      return page;
    } catch (e) {
      console.warn('[communityService] Feed fetch failed, using cache:', e);
      const cached = await communityService.getCachedPosts();
      return { items: cached, nextCursor: null };
    }
  },

  getCachedPosts: async (): Promise<CommunityPostDto[]> => {
    try {
      const data = await AsyncStorage.getItem(POSTS_CACHE_KEY);
      return data ? (JSON.parse(data) as CommunityPostDto[]) : [];
    } catch {
      return [];
    }
  },

  createPost: async (data: { type: CommunityPostType; content: string; bookId?: string }): Promise<CommunityPostDto> => {
    const created = await communityApi.createPost(data);
    const cached = await communityService.getCachedPosts();
    cachePosts([created, ...cached]);
    return created;
  },

  deletePost: async (id: string): Promise<void> => {
    await communityApi.deletePost(id);
    const cached = await communityService.getCachedPosts();
    cachePosts(cached.filter((p) => p.id !== id));
  },

  /** Optimistic like with rollback on failure. */
  toggleLike: async (post: CommunityPostDto): Promise<CommunityPostDto> => {
    const nextLiked = !post.likedByMe;
    const optimistic: CommunityPostDto = {
      ...post,
      likedByMe: nextLiked,
      likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
    };
    await communityService._patchCache(optimistic);
    try {
      await communityApi.setLike(post.id, nextLiked);
    } catch (e) {
      console.warn('[communityService] Like sync failed, rolling back:', e);
      await communityService._patchCache(post);
      throw e;
    }
    return optimistic;
  },

  /** Optimistic bookmark with rollback on failure. */
  toggleBookmark: async (post: CommunityPostDto): Promise<CommunityPostDto> => {
    const nextBookmarked = !post.bookmarkedByMe;
    const optimistic: CommunityPostDto = { ...post, bookmarkedByMe: nextBookmarked };
    await communityService._patchCache(optimistic);
    try {
      await communityApi.setBookmark(post.id, nextBookmarked);
    } catch (e) {
      console.warn('[communityService] Bookmark sync failed, rolling back:', e);
      await communityService._patchCache(post);
      throw e;
    }
    return optimistic;
  },

  getComments: async (postId: string): Promise<CommunityCommentDto[]> => {
    return communityApi.getComments(postId);
  },

  addComment: async (postId: string, content: string): Promise<CommunityCommentDto> => {
    const comment = await communityApi.addComment(postId, content);
    const cached = await communityService.getCachedPosts();
    cachePosts(
      cached.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)),
    );
    return comment;
  },

  getEvents: async (): Promise<CommunityEventDto[]> => {
    if (!isAuthenticated()) return [];
    try {
      const events = await communityApi.getEvents();
      cacheEvents(events);
      return events;
    } catch (e) {
      console.warn('[communityService] Events fetch failed, using cache:', e);
      try {
        const data = await AsyncStorage.getItem(EVENTS_CACHE_KEY);
        return data ? (JSON.parse(data) as CommunityEventDto[]) : [];
      } catch {
        return [];
      }
    }
  },

  /** Optimistic event join toggle with rollback on failure. */
  toggleJoinEvent: async (event: CommunityEventDto): Promise<CommunityEventDto> => {
    const nextJoined = !event.joinedByMe;
    const optimistic: CommunityEventDto = {
      ...event,
      joinedByMe: nextJoined,
      joinCount: Math.max(0, event.joinCount + (nextJoined ? 1 : -1)),
    };
    await communityService._patchEventCache(optimistic);
    try {
      await communityApi.setEventJoin(event.id, nextJoined);
    } catch (e) {
      console.warn('[communityService] Event join sync failed, rolling back:', e);
      await communityService._patchEventCache(event);
      throw e;
    }
    return optimistic;
  },

  _patchCache: async (post: CommunityPostDto): Promise<void> => {
    const cached = await communityService.getCachedPosts();
    cachePosts(cached.map((p) => (p.id === post.id ? post : p)));
  },

  _patchEventCache: async (event: CommunityEventDto): Promise<void> => {
    try {
      const data = await AsyncStorage.getItem(EVENTS_CACHE_KEY);
      const events: CommunityEventDto[] = data ? JSON.parse(data) : [];
      cacheEvents(events.map((e) => (e.id === event.id ? event : e)));
    } catch {
      // best-effort
    }
  },
};

