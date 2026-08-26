-- FTS5 full-text search index and automatic sync triggers for books
CREATE VIRTUAL TABLE IF NOT EXISTS books_fts USING fts5(
  id UNINDEXED,
  title,
  author,
  description,
  synopsis,
  genre,
  tags,
  tokenize = 'unicode61'
);

-- Populate existing rows
INSERT INTO books_fts(id, title, author, description, synopsis, genre, tags)
SELECT id, title, author, COALESCE(description, ''), COALESCE(synopsis, ''), genre, tags FROM books;

-- Triggers to keep FTS5 index automatically in sync with books table
CREATE TRIGGER IF NOT EXISTS books_ai AFTER INSERT ON books BEGIN
  INSERT INTO books_fts(id, title, author, description, synopsis, genre, tags)
  VALUES (new.id, new.title, new.author, COALESCE(new.description, ''), COALESCE(new.synopsis, ''), new.genre, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS books_ad AFTER DELETE ON books BEGIN
  INSERT INTO books_fts(books_fts, id, title, author, description, synopsis, genre, tags)
  VALUES ('delete', old.id, old.title, old.author, COALESCE(old.description, ''), COALESCE(old.synopsis, ''), old.genre, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS books_au AFTER UPDATE ON books BEGIN
  INSERT INTO books_fts(books_fts, id, title, author, description, synopsis, genre, tags)
  VALUES ('delete', old.id, old.title, old.author, COALESCE(old.description, ''), COALESCE(old.synopsis, ''), old.genre, old.tags);
  INSERT INTO books_fts(id, title, author, description, synopsis, genre, tags)
  VALUES (new.id, new.title, new.author, COALESCE(new.description, ''), COALESCE(new.synopsis, ''), new.genre, new.tags);
END;
