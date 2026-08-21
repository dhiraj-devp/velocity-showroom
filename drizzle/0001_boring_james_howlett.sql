CREATE TABLE `lead_notes` (
	`id` varchar(64) NOT NULL,
	`lead_id` varchar(64) NOT NULL,
	`body` text NOT NULL,
	`created_by` varchar(160),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `lead_notes` ADD CONSTRAINT `lead_notes_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `lead_notes_lead_idx` ON `lead_notes` (`lead_id`);--> statement-breakpoint
CREATE INDEX `lead_notes_created_idx` ON `lead_notes` (`created_at`);