CREATE TABLE `bookings` (
	`id` varchar(64) NOT NULL,
	`vehicle_id` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(160),
	`booking_type` enum('viewing','test_drive') NOT NULL,
	`booking_date` date NOT NULL,
	`booking_time` varchar(8) NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`logo_url` varchar(512),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` varchar(512),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `dealership_settings` (
	`id` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`legal_name` varchar(180),
	`phone` varchar(32) NOT NULL,
	`whatsapp` varchar(32) NOT NULL,
	`email` varchar(160) NOT NULL,
	`address` varchar(255),
	`city` varchar(80),
	`country` varchar(80),
	`currency` varchar(8) NOT NULL DEFAULT 'INR',
	`primary_contact_name` varchar(120),
	`opening_hours` varchar(160),
	`maps_url` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dealership_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` varchar(64) NOT NULL,
	`vehicle_id` varchar(64),
	`name` varchar(160) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(160),
	`message` text,
	`source` enum('vehicle_enquiry','whatsapp','book_viewing','test_drive','contact','register_interest') NOT NULL,
	`page_path` varchar(255),
	`status` enum('new','contacted','qualified','won','lost') NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_images` (
	`id` varchar(64) NOT NULL,
	`vehicle_id` varchar(64) NOT NULL,
	`url` varchar(512) NOT NULL,
	`alt` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_primary` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vehicle_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_models` (
	`id` varchar(64) NOT NULL,
	`brand_id` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicle_models_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicle_models_brand_slug_uidx` UNIQUE(`brand_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` varchar(64) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`brand_id` varchar(64) NOT NULL,
	`model_id` varchar(64),
	`category_id` varchar(64) NOT NULL,
	`title` varchar(160) NOT NULL,
	`year` smallint unsigned NOT NULL,
	`price` int unsigned NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'INR',
	`mileage` int unsigned,
	`fuel_type` enum('petrol','diesel','electric','hybrid'),
	`transmission` enum('automatic','manual'),
	`condition` enum('new','used') NOT NULL,
	`availability` enum('available','reserved','sold','coming_soon') NOT NULL DEFAULT 'available',
	`description` text,
	`location` varchar(128),
	`is_featured` boolean NOT NULL DEFAULT false,
	`has_gallery` boolean NOT NULL DEFAULT false,
	`has_360_view` boolean NOT NULL DEFAULT false,
	`has_3d_experience` boolean NOT NULL DEFAULT false,
	`primary_image` varchar(512),
	`model_3d_url` varchar(512),
	`seo_title` varchar(180),
	`seo_description` varchar(320),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_images` ADD CONSTRAINT `vehicle_images_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_models` ADD CONSTRAINT `vehicle_models_brand_id_brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_brand_id_brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_model_id_vehicle_models_id_fk` FOREIGN KEY (`model_id`) REFERENCES `vehicle_models`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `bookings_vehicle_idx` ON `bookings` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `bookings_date_idx` ON `bookings` (`booking_date`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `bookings_created_idx` ON `bookings` (`created_at`);--> statement-breakpoint
CREATE INDEX `brands_active_idx` ON `brands` (`is_active`);--> statement-breakpoint
CREATE INDEX `categories_active_idx` ON `categories` (`is_active`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `leads_vehicle_idx` ON `leads` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `leads_created_idx` ON `leads` (`created_at`);--> statement-breakpoint
CREATE INDEX `vehicle_images_vehicle_idx` ON `vehicle_images` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `vehicle_images_primary_idx` ON `vehicle_images` (`vehicle_id`,`is_primary`);--> statement-breakpoint
CREATE INDEX `vehicle_models_brand_idx` ON `vehicle_models` (`brand_id`);--> statement-breakpoint
CREATE INDEX `vehicles_brand_idx` ON `vehicles` (`brand_id`);--> statement-breakpoint
CREATE INDEX `vehicles_model_idx` ON `vehicles` (`model_id`);--> statement-breakpoint
CREATE INDEX `vehicles_category_idx` ON `vehicles` (`category_id`);--> statement-breakpoint
CREATE INDEX `vehicles_availability_idx` ON `vehicles` (`availability`);--> statement-breakpoint
CREATE INDEX `vehicles_featured_idx` ON `vehicles` (`is_featured`);--> statement-breakpoint
CREATE INDEX `vehicles_price_idx` ON `vehicles` (`price`);--> statement-breakpoint
CREATE INDEX `vehicles_year_idx` ON `vehicles` (`year`);--> statement-breakpoint
CREATE INDEX `vehicles_created_idx` ON `vehicles` (`created_at`);