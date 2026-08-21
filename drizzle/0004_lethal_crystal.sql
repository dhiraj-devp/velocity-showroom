CREATE TABLE `lead_activities` (
	`id` varchar(64) NOT NULL,
	`lead_id` varchar(64) NOT NULL,
	`type` enum('lead_created','note_added','whatsapp_clicked','call_clicked','viewing_requested','viewing_confirmed','viewing_completed','viewing_cancelled','status_changed','follow_up_scheduled','follow_up_completed') NOT NULL,
	`title` varchar(255) NOT NULL,
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `name` varchar(160);--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `bookings` ADD `lead_id` varchar(64);--> statement-breakpoint
ALTER TABLE `leads` ADD `visitor_key` varchar(64);--> statement-breakpoint
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `lead_activities_lead_idx` ON `lead_activities` (`lead_id`);--> statement-breakpoint
CREATE INDEX `lead_activities_created_idx` ON `lead_activities` (`lead_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `lead_activities_type_idx` ON `lead_activities` (`type`);--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `bookings_lead_idx` ON `bookings` (`lead_id`);--> statement-breakpoint
CREATE INDEX `leads_visitor_idx` ON `leads` (`visitor_key`);