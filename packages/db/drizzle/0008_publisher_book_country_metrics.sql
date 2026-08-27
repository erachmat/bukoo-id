CREATE TABLE `publisher_book_country_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`book_id` text NOT NULL,
	`metric_date` text NOT NULL,
	`country_code` text NOT NULL,
	`reader_days` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publisher_book_country_metrics_book_date_country_idx` ON `publisher_book_country_metrics` (`book_id`,`metric_date`,`country_code`);
--> statement-breakpoint
CREATE INDEX `publisher_book_country_metrics_book_date_idx` ON `publisher_book_country_metrics` (`book_id`,`metric_date`);
