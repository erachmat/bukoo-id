ALTER TABLE `books` ADD `catalog_fingerprint` text;--> statement-breakpoint
ALTER TABLE `books` ADD `archived_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `books_publisher_catalog_fingerprint_idx` ON `books` (`publisher_user_id`,`catalog_fingerprint`);