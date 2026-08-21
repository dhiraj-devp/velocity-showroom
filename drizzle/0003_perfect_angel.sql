ALTER TABLE `leads` ADD `source_detail` varchar(64);--> statement-breakpoint
ALTER TABLE `leads` ADD `utm_source` varchar(120);--> statement-breakpoint
ALTER TABLE `leads` ADD `utm_medium` varchar(120);--> statement-breakpoint
ALTER TABLE `leads` ADD `utm_campaign` varchar(120);--> statement-breakpoint
ALTER TABLE `leads` ADD `next_follow_up_at` timestamp NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `last_contacted_at` timestamp NULL;--> statement-breakpoint
UPDATE `leads` SET `source_detail` = `source` WHERE `source_detail` IS NULL;--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `source` varchar(32) NOT NULL;--> statement-breakpoint
UPDATE `leads` SET `source` = 'website' WHERE `source` IN ('vehicle_enquiry','book_viewing','test_drive','contact','register_interest');--> statement-breakpoint
UPDATE `leads` SET `source` = 'other' WHERE `source` NOT IN ('website','whatsapp','phone','instagram','facebook','google','referral','direct','other');--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `source` enum('website','whatsapp','phone','instagram','facebook','google','referral','direct','other') NOT NULL;--> statement-breakpoint
CREATE INDEX `leads_source_idx` ON `leads` (`source`);--> statement-breakpoint
CREATE INDEX `leads_follow_up_idx` ON `leads` (`next_follow_up_at`);
