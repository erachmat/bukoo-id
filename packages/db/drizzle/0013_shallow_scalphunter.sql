ALTER TABLE `publisher_royalty_lines` ADD `tax_rate_bps` integer DEFAULT 2300 NOT NULL;--> statement-breakpoint
ALTER TABLE `publisher_royalty_lines` ADD `taxable_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `publisher_royalty_lines` ADD `tax_amount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `publisher_royalty_lines` ADD `tax_type` text DEFAULT 'PPh_23' NOT NULL;