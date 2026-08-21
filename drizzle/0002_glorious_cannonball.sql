CREATE TABLE `vehicle_360_frames` (
	`id` varchar(64) NOT NULL,
	`vehicle_id` varchar(64) NOT NULL,
	`url` varchar(512) NOT NULL,
	`alt` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vehicle_360_frames_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vehicle_360_frames` ADD CONSTRAINT `vehicle_360_frames_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `vehicle_360_frames_vehicle_idx` ON `vehicle_360_frames` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `vehicle_360_frames_order_idx` ON `vehicle_360_frames` (`vehicle_id`,`sort_order`);