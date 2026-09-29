CREATE TABLE `book_discovery_cta_last_clicks` (
	`account_id` text NOT NULL,
	`book_id` text NOT NULL,
	`last_clicked_at` text NOT NULL,
	PRIMARY KEY(`account_id`, `book_id`),
	FOREIGN KEY (`account_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `book_discovery_daily_metrics` (
	`book_id` text NOT NULL,
	`metric_date` text NOT NULL,
	`anonymous_detail_views` integer DEFAULT 0 NOT NULL,
	`anonymous_app_cta_clicks` integer DEFAULT 0 NOT NULL,
	`signed_in_detail_views` integer DEFAULT 0 NOT NULL,
	`signed_in_app_cta_clicks` integer DEFAULT 0 NOT NULL,
	`attributed_reader_days` integer DEFAULT 0 NOT NULL,
	`unattributed_reader_days` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	PRIMARY KEY(`book_id`, `metric_date`),
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `book_discovery_daily_metrics_date_idx` ON `book_discovery_daily_metrics` (`metric_date`);--> statement-breakpoint
ALTER TABLE `reading_sync_batches` ADD `is_discovery_attributed` integer DEFAULT false NOT NULL;