import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import {
  communityPosts,
  communityComments,
  communityLikes,
  communityBookmarks,
  communityEvents,
  communityEventJoins,
  users,
  books,
} from '@bukoo/db';
import { createDb } from '../db/index.js';
import { createId } from '../lib/cuid.js';
import { buildCoverUrl } from '../lib/cover-url.js';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../types/env.js';

const community = new Hono<{ Bindings: Env }>();
community.use('*', authMiddleware);

const POST_TYPES = ['REVIEW', 'QUOTE', 'DISCUSSION', 'RECOMMENDATION'] as const;

// ---------------------------------------------------------------------------
// GET /v1/community/posts — cursor-paginated feed
// ---------------------------------------------------------------------------

const listPostsSchema = z.object({
  type: z.enum(POST_TYPES).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

community.get('/posts', zValidator('query', listPostsSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const { type, cursor, limit } = c.req.valid('query');

  const conditions = [];
  if (type) conditions.push(eq(communityPosts.type, type));
  if (cursor) conditions.push(sql`${communityPosts.createdAt} < ${cursor}`);

  const rows = await db
    .select({
      post: communityPosts,
      user: { id: users.id, name: users.name, avatar: users.avatar },
      book: { id: books.id, title: books.title, author: books.author, coverKey: books.coverKey },
    })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.userId, users.id))
    .leftJoin(books, eq(communityPosts.bookId, books.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(communityPosts.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const postIds = pageRows.map((r) => r.post.id);
  let likedSet = new Set<string>();
  let bookmarkedSet = new Set<string>();
  if (postIds.length > 0) {
    const [likes, bookmarks] = await Promise.all([
      db
        .select({ postId: communityLikes.postId })
        .from(communityLikes)
        .where(and(inArray(communityLikes.postId, postIds), eq(communityLikes.userId, userId))),
      db
        .select({ postId: communityBookmarks.postId })
        .from(communityBookmarks)
        .where(and(inArray(communityBookmarks.postId, postIds), eq(communityBookmarks.userId, userId))),
    ]);
    likedSet = new Set(likes.map((l) => l.postId));
    bookmarkedSet = new Set(bookmarks.map((b) => b.postId));
  }

  const posts = pageRows.map(({ post, user, book }) => ({
    id: post.id,
    type: post.type,
    content: post.content,
    bookId: post.bookId,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    bookmarkCount: post.bookmarkCount,
    likedByMe: likedSet.has(post.id),
    bookmarkedByMe: bookmarkedSet.has(post.id),
    createdAt: post.createdAt,
    user: {
      id: user.id,
      name: user.name ?? 'Pembaca BUKOO',
      avatarUrl: user.avatar,
    },
    book: book ? { id: book.id, title: book.title, author: book.author, coverUrl: buildCoverUrl(book.coverKey) } : null,
  }));

  return c.json({ items: posts, nextCursor: hasMore ? pageRows[pageRows.length - 1].post.createdAt : null });
});

// ---------------------------------------------------------------------------
// POST /v1/community/posts
// ---------------------------------------------------------------------------

const createPostSchema = z.object({
  type: z.enum(POST_TYPES),
  content: z.string().min(1).max(280),
  bookId: z.string().min(1).max(100).optional(),
});

community.post('/posts', zValidator('json', createPostSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const { type, content, bookId } = c.req.valid('json');

  if (bookId) {
    const book = await db.query.books.findFirst({ where: eq(books.id, bookId) });
    if (!book) return c.json({ error: 'Book not found' }, 404);
  }

  const id = createId();
  await db.insert(communityPosts).values({ id, userId, type, content, bookId: bookId ?? null });

  const created = await db
    .select({
      post: communityPosts,
      user: { id: users.id, name: users.name, avatar: users.avatar },
      book: { id: books.id, title: books.title, author: books.author, coverKey: books.coverKey },
    })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.userId, users.id))
    .leftJoin(books, eq(communityPosts.bookId, books.id))
    .where(eq(communityPosts.id, id));

  const row = created[0];
  return c.json(
    {
      id: row.post.id,
      type: row.post.type,
      content: row.post.content,
      bookId: row.post.bookId,
      likeCount: row.post.likeCount,
      commentCount: row.post.commentCount,
      bookmarkCount: row.post.bookmarkCount,
      likedByMe: false,
      bookmarkedByMe: false,
      createdAt: row.post.createdAt,
      user: {
        id: row.user.id,
        name: row.user.name ?? 'Pembaca BUKOO',
        avatarUrl: row.user.avatar,
      },
      book: row.book
        ? { id: row.book.id, title: row.book.title, author: row.book.author, coverUrl: buildCoverUrl(row.book.coverKey) }
        : null,
    },
    201,
  );
});

// ---------------------------------------------------------------------------
// DELETE /v1/community/posts/:id — author only
// ---------------------------------------------------------------------------

community.delete('/posts/:id', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const id = c.req.param('id');

  const post = await db.query.communityPosts.findFirst({ where: eq(communityPosts.id, id) });
  if (!post) return c.json({ error: 'Post not found' }, 404);
  if (post.userId !== userId) return c.json({ error: 'Forbidden' }, 403);

  await db.delete(communityPosts).where(eq(communityPosts.id, id));
  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// Like / unlike
// ---------------------------------------------------------------------------

community.post('/posts/:id/like', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const postId = c.req.param('id');

  const post = await db.query.communityPosts.findFirst({ where: eq(communityPosts.id, postId) });
  if (!post) return c.json({ error: 'Post not found' }, 404);

  const existing = await db
    .select({ postId: communityLikes.postId })
    .from(communityLikes)
    .where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)));

  if (existing.length === 0) {
    await db.insert(communityLikes).values({ postId, userId });
    await db
      .update(communityPosts)
      .set({ likeCount: post.likeCount + 1 })
      .where(eq(communityPosts.id, postId));
  }
  return c.json({ liked: true, likeCount: post.likeCount + (existing.length === 0 ? 1 : 0) });
});

community.delete('/posts/:id/like', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const postId = c.req.param('id');

  const post = await db.query.communityPosts.findFirst({ where: eq(communityPosts.id, postId) });
  if (!post) return c.json({ error: 'Post not found' }, 404);

  const existing = await db
    .select({ postId: communityLikes.postId })
    .from(communityLikes)
    .where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)));

  if (existing.length > 0) {
    await db.delete(communityLikes).where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)));
    await db
      .update(communityPosts)
      .set({ likeCount: Math.max(0, post.likeCount - 1) })
      .where(eq(communityPosts.id, postId));
  }
  return c.json({ liked: false, likeCount: Math.max(0, post.likeCount - (existing.length > 0 ? 1 : 0)) });
});

// ---------------------------------------------------------------------------
// Bookmark / unbookmark
// ---------------------------------------------------------------------------

community.post('/posts/:id/bookmark', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const postId = c.req.param('id');

  const post = await db.query.communityPosts.findFirst({ where: eq(communityPosts.id, postId) });
  if (!post) return c.json({ error: 'Post not found' }, 404);

  const existing = await db
    .select({ postId: communityBookmarks.postId })
    .from(communityBookmarks)
    .where(and(eq(communityBookmarks.postId, postId), eq(communityBookmarks.userId, userId)));

  if (existing.length === 0) {
    await db.insert(communityBookmarks).values({ postId, userId });
    await db
      .update(communityPosts)
      .set({ bookmarkCount: post.bookmarkCount + 1 })
      .where(eq(communityPosts.id, postId));
  }
  return c.json({ bookmarked: true });
});

community.delete('/posts/:id/bookmark', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const postId = c.req.param('id');

  const post = await db.query.communityPosts.findFirst({ where: eq(communityPosts.id, postId) });
  if (!post) return c.json({ error: 'Post not found' }, 404);

  const existing = await db
    .select({ postId: communityBookmarks.postId })
    .from(communityBookmarks)
    .where(and(eq(communityBookmarks.postId, postId), eq(communityBookmarks.userId, userId)));

  if (existing.length > 0) {
    await db.delete(communityBookmarks).where(and(eq(communityBookmarks.postId, postId), eq(communityBookmarks.userId, userId)));
    await db
      .update(communityPosts)
      .set({ bookmarkCount: Math.max(0, post.bookmarkCount - 1) })
      .where(eq(communityPosts.id, postId));
  }
  return c.json({ bookmarked: false });
});

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

community.get('/posts/:id/comments', async (c) => {
  const db = createDb(c.env.DB);
  const postId = c.req.param('id');

  const post = await db.query.communityPosts.findFirst({ where: eq(communityPosts.id, postId) });
  if (!post) return c.json({ error: 'Post not found' }, 404);

  const rows = await db
    .select({
      id: communityComments.id,
      content: communityComments.content,
      createdAt: communityComments.createdAt,
      user: { id: users.id, name: users.name, avatar: users.avatar },
    })
    .from(communityComments)
    .innerJoin(users, eq(communityComments.userId, users.id))
    .where(eq(communityComments.postId, postId))
    .orderBy(desc(communityComments.createdAt));

  return c.json(
    rows.map((row) => ({
      id: row.id,
      content: row.content,
      createdAt: row.createdAt,
      user: { id: row.user.id, name: row.user.name ?? 'Pembaca BUKOO', avatarUrl: row.user.avatar },
    })),
  );
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

community.post('/posts/:id/comments', zValidator('json', createCommentSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const postId = c.req.param('id');
  const { content } = c.req.valid('json');

  const post = await db.query.communityPosts.findFirst({ where: eq(communityPosts.id, postId) });
  if (!post) return c.json({ error: 'Post not found' }, 404);

  const id = createId();
  await db.insert(communityComments).values({ id, postId, userId, content });
  await db
    .update(communityPosts)
    .set({ commentCount: post.commentCount + 1 })
    .where(eq(communityPosts.id, postId));

  const created = await db
    .select({
      id: communityComments.id,
      content: communityComments.content,
      createdAt: communityComments.createdAt,
      user: { id: users.id, name: users.name, avatar: users.avatar },
    })
    .from(communityComments)
    .innerJoin(users, eq(communityComments.userId, users.id))
    .where(eq(communityComments.id, id));

  const row = created[0];
  return c.json(
    {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt,
      user: { id: row.user.id, name: row.user.name ?? 'Pembaca BUKOO', avatarUrl: row.user.avatar },
    },
    201,
  );
});

community.delete('/comments/:id', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const id = c.req.param('id');

  const comment = await db.query.communityComments.findFirst({ where: eq(communityComments.id, id) });
  if (!comment) return c.json({ error: 'Comment not found' }, 404);

  const post = await db.query.communityPosts.findFirst({ where: eq(communityPosts.id, comment.postId) });
  const isPostOwner = !!post && post.userId === userId;
  if (comment.userId !== userId && !isPostOwner) return c.json({ error: 'Forbidden' }, 403);

  await db.delete(communityComments).where(eq(communityComments.id, id));
  if (post) {
    await db
      .update(communityPosts)
      .set({ commentCount: Math.max(0, post.commentCount - 1) })
      .where(eq(communityPosts.id, post.id));
  }
  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// Reading Club events
// ---------------------------------------------------------------------------

community.get('/events', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');

  const rows = await db
    .select({
      event: communityEvents,
      book: { id: books.id, title: books.title, author: books.author, coverKey: books.coverKey },
      joinCount: sql<number>`(
        SELECT COUNT(*) FROM community_event_joins j WHERE j.event_id = ${communityEvents.id}
      )`,
      joinedByMe: sql<number>`(
        SELECT COUNT(*) FROM community_event_joins j2
        WHERE j2.event_id = ${communityEvents.id} AND j2.user_id = ${userId}
      )`,
    })
    .from(communityEvents)
    .leftJoin(books, eq(communityEvents.bookId, books.id))
    .orderBy(desc(communityEvents.createdAt));

  return c.json(
    rows.map(({ event, book, joinCount, joinedByMe }) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      bookId: event.bookId,
      startDate: event.startDate,
      endDate: event.endDate,
      targetProgressPercent: event.targetProgressPercent,
      joinCount,
      joinedByMe: joinedByMe > 0,
      book: book ? { id: book.id, title: book.title, author: book.author, coverUrl: buildCoverUrl(book.coverKey) } : null,
    })),
  );
});

community.post('/events/:id/join', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const eventId = c.req.param('id');

  const event = await db.query.communityEvents.findFirst({ where: eq(communityEvents.id, eventId) });
  if (!event) return c.json({ error: 'Event not found' }, 404);

  await db.insert(communityEventJoins).values({ eventId, userId }).onConflictDoNothing();
  return c.json({ joined: true });
});

community.delete('/events/:id/join', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const eventId = c.req.param('id');

  await db
    .delete(communityEventJoins)
    .where(and(eq(communityEventJoins.eventId, eventId), eq(communityEventJoins.userId, userId)));
  return c.json({ joined: false });
});

export default community;
