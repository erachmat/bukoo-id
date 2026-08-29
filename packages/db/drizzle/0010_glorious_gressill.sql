CREATE TABLE `auth_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`window_start` integer NOT NULL,
	`locked_until` integer,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_attempts_key_unique` ON `auth_attempts` (`key`);--> statement-breakpoint
CREATE INDEX `auth_attempts_key_idx` ON `auth_attempts` (`key`);