CREATE TABLE `vehicle_internal` (
	`vehicle_id` varchar(64) NOT NULL,
	`registration_number` varchar(32),
	`vin_or_chassis_number` varchar(64),
	`ownership_count` smallint unsigned,
	`service_history_available` boolean NOT NULL DEFAULT false,
	`insurance_expiry` date,
	`number_of_keys` smallint unsigned,
	`purchase_price` int unsigned,
	`purchase_source` varchar(160),
	`internal_notes` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicle_internal_vehicle_id` PRIMARY KEY(`vehicle_id`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_reservations` (
	`id` varchar(64) NOT NULL,
	`vehicle_id` varchar(64) NOT NULL,
	`lead_id` varchar(64),
	`reservation_amount` int unsigned,
	`status` enum('active','completed','cancelled','expired') NOT NULL DEFAULT 'active',
	`expires_at` timestamp NULL,
	`notes` text,
	`created_by` varchar(160),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicle_reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `lead_activities` MODIFY COLUMN `type` enum('lead_created','note_added','whatsapp_clicked','call_clicked','viewing_requested','viewing_confirmed','viewing_completed','viewing_cancelled','status_changed','follow_up_scheduled','follow_up_completed','follow_up_cleared','whatsapp_follow_up_opened','deal_value_updated','lead_assigned','reservation_created','reservation_cancelled','reservation_completed','reservation_expired') NOT NULL;--> statement-breakpoint
ALTER TABLE `vehicle_internal` ADD CONSTRAINT `vehicle_internal_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_reservations` ADD CONSTRAINT `vehicle_reservations_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_reservations` ADD CONSTRAINT `vehicle_reservations_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `reservations_vehicle_idx` ON `vehicle_reservations` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `reservations_lead_idx` ON `vehicle_reservations` (`lead_id`);--> statement-breakpoint
CREATE INDEX `reservations_status_idx` ON `vehicle_reservations` (`status`);--> statement-breakpoint
CREATE INDEX `reservations_expires_idx` ON `vehicle_reservations` (`expires_at`);