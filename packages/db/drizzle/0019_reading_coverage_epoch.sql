CREATE TABLE `reading_coverage_blocks` (
	`user_id` text NOT NULL,
	`book_id` text NOT NULL,
	`content_version` text NOT NULL,
	`block_index` integer NOT NULL,
	`exposure_micros` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	PRIMARY KEY(`user_id`, `book_id`, `content_version`, `block_index`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reading_coverage_blocks_user_book_idx` ON `reading_coverage_blocks` (`user_id`,`book_id`);--> statement-breakpoint
ALTER TABLE `books` ADD `total_words` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reading_progress` ADD `progress_epoch` integer DEFAULT 1 NOT NULL;
