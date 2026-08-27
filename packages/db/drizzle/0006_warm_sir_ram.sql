CREATE TABLE `publisher_campaign_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`publisher_user_id` text NOT NULL,
	`book_id` text NOT NULL,
	`campaign_name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`goal` text,
	`notes` text,
	`budget` integer,
	`status` text DEFAULT 'SUBMITTED' NOT NULL,
	`submitted_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`reviewed_at` text,
	`reviewer_user_id` text,
	`review_note` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`publisher_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewer_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `publisher_campaign_requests_user_created_idx` ON `publisher_campaign_requests` (`publisher_user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `publisher_campaign_requests_status_updated_idx` ON `publisher_campaign_requests` (`status`,`updated_at`);