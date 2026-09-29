CREATE TABLE `reading_sync_batches` (
	`sync_batch_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`book_id` text NOT NULL,
	`payload_hash` text NOT NULL,
	`attempt_id` text NOT NULL,
	`metric_date` text NOT NULL,
	`is_start` integer DEFAULT false NOT NULL,
	`is_completion` integer DEFAULT false NOT NULL,
	`is_new_reader_day` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reading_sync_batches_user_book_idx` ON `reading_sync_batches` (`user_id`,`book_id`);