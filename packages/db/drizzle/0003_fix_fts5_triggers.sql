-- Corrective migration: make books_fts sync triggers D1-safe.
--
-- BACKGROUND
-- 0001_fts5_books.sql created `books_fts` plus three sync triggers that use the
-- FTS5 special 'delete' command:
--     INSERT INTO books_fts(books_fts, ...) VALUES ('delete', ...)
-- Cloudflare D1 does NOT support that command: ANY write (INSERT/UPDATE/DELETE)
-- to the base `books` table fails with SQLITE_ERROR 7500.
--
-- D1 FTS5 constraint (verified empirically 2026-08-17): D1 does not support
-- DELETE/UPDATE against an FTS5 virtual table AT ALL — not even a plain
-- `DELETE FROM books_fts WHERE rowid IN (...)` — it also throws SQLITE_ERROR
-- 7500. Only INSERT into the FTS index works. (Local miniflare DOES support
-- FTS deletes, which is why local testing can pass while remote D1 fails.)
--
-- Therefore the only D1-safe design is:
--   * books_ai  (AFTER INSERT)  -> plain INSERT into books_fts   [KEEP — safe]
--   * books_ad  (AFTER DELETE)  -> NO trigger. Soft-removal is handled by the
--     `is_published = 0` flag; the API search JOINs on b.is_published = 1, so
--     unpublished books never surface. Hard-DELETE leaves a harmless orphan row
--     in books_fts that the JOIN filters out.
--   * books_au  (AFTER UPDATE)  -> NO trigger. The search query reads fields
--     from `books b` (not f.*), so stale FTS terms only affect MATCH, not
--     correctness of returned data; the JOIN keeps rows aligned by id.
--
-- This migration:
--   1. Drops any broken/unsafe FTS triggers that exist (fresh DBs, other envs).
--   2. Recreates ONLY the insert trigger.
-- Idempotent: DROP/CREATE IF NOT EXISTS.

DROP TRIGGER IF EXISTS books_ai;
DROP TRIGGER IF EXISTS books_ad;
DROP TRIGGER IF EXISTS books_au;

-- AFTER INSERT: index the new row (the only D1-safe sync point).
CREATE TRIGGER IF NOT EXISTS books_ai AFTER INSERT ON books BEGIN
  INSERT INTO books_fts(id, title, author, description, synopsis, genre, tags)
  VALUES (new.id, new.title, new.author, COALESCE(new.description, ''), COALESCE(new.synopsis, ''), new.genre, new.tags);
END;
