CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`entity_type` text,
	`entity_id` text,
	`data` text,
	`read_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_created_idx` ON `notifications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_created_idx` ON `notifications` (`user_id`,`read_at`,`created_at`);--> statement-breakpoint
CREATE TABLE `publisher_book_daily_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`book_id` text NOT NULL,
	`metric_date` text NOT NULL,
	`read_starts` integer DEFAULT 0 NOT NULL,
	`completed_reads` integer DEFAULT 0 NOT NULL,
	`reading_seconds` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publisher_book_daily_metrics_book_date_idx` ON `publisher_book_daily_metrics` (`book_id`,`metric_date`);--> statement-breakpoint
CREATE TABLE `publisher_book_reader_days` (
	`book_id` text NOT NULL,
	`user_id` text NOT NULL,
	`read_date` text NOT NULL,
	`first_read_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`last_read_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	PRIMARY KEY(`book_id`, `user_id`, `read_date`),
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `publisher_book_reader_days_date_idx` ON `publisher_book_reader_days` (`read_date`);--> statement-breakpoint
CREATE TABLE `publisher_payout_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`publisher_user_id` text NOT NULL,
	`method` text DEFAULT 'BANK' NOT NULL,
	`bank_code` text,
	`account_holder_name` text,
	`masked_account` text,
	`external_account_ref` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`publisher_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `publisher_payout_accounts_user_idx` ON `publisher_payout_accounts` (`publisher_user_id`);--> statement-breakpoint
CREATE TABLE `publisher_payouts` (
	`id` text PRIMARY KEY NOT NULL,
	`publisher_user_id` text NOT NULL,
	`royalty_period_id` text,
	`payout_account_id` text,
	`amount` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`status` text DEFAULT 'SCHEDULED' NOT NULL,
	`scheduled_at` text,
	`processed_at` text,
	`external_ref` text,
	`failure_reason` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`publisher_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`royalty_period_id`) REFERENCES `publisher_royalty_periods`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`payout_account_id`) REFERENCES `publisher_payout_accounts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `publisher_payouts_user_idx` ON `publisher_payouts` (`publisher_user_id`);--> statement-breakpoint
CREATE TABLE `publisher_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text,
	`legal_name` text,
	`contact_email` text,
	`contact_phone` text,
	`website` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publisher_profiles_user_id_unique` ON `publisher_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `publisher_profiles_user_idx` ON `publisher_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `publisher_royalty_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`period_id` text NOT NULL,
	`publisher_user_id` text NOT NULL,
	`book_id` text,
	`read_seconds` integer DEFAULT 0 NOT NULL,
	`rate_bps` integer DEFAULT 0 NOT NULL,
	`gross_amount` integer DEFAULT 0 NOT NULL,
	`net_amount` integer DEFAULT 0 NOT NULL,
	`calc_meta` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`period_id`) REFERENCES `publisher_royalty_periods`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`publisher_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publisher_royalty_lines_period_book_idx` ON `publisher_royalty_lines` (`period_id`,`book_id`);--> statement-breakpoint
CREATE INDEX `publisher_royalty_lines_user_idx` ON `publisher_royalty_lines` (`publisher_user_id`);--> statement-breakpoint
CREATE TABLE `publisher_royalty_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`publisher_user_id` text NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`revenue_pool` integer DEFAULT 0 NOT NULL,
	`publisher_share` integer DEFAULT 0 NOT NULL,
	`calc_version` text,
	`finalized_at` text,
	`paid_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`publisher_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `publisher_royalty_periods_user_idx` ON `publisher_royalty_periods` (`publisher_user_id`);--> statement-breakpoint
CREATE TABLE `publisher_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`publisher_user_id` text NOT NULL,
	`book_id` text,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`isbn` text,
	`synopsis` text,
	`genre` text DEFAULT '[]' NOT NULL,
	`language` text DEFAULT 'ID' NOT NULL,
	`published_year` integer,
	`total_pages` integer,
	`subscription_required` text DEFAULT 'FREE' NOT NULL,
	`epub_key` text,
	`cover_key` text,
	`release_window` text,
	`positioning` text,
	`store_url` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`reviewer_user_id` text,
	`review_note` text,
	`submitted_at` text,
	`reviewed_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`publisher_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewer_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `publisher_submissions_user_created_idx` ON `publisher_submissions` (`publisher_user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `publisher_submissions_status_updated_idx` ON `publisher_submissions` (`status`,`updated_at`);--> statement-breakpoint
ALTER TABLE `books` ADD `publication_status` text DEFAULT 'DRAFT' NOT NULL;