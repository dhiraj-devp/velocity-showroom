ALTER TABLE `lead_activities` MODIFY COLUMN `type` enum('lead_created','note_added','whatsapp_clicked','call_clicked','viewing_requested','viewing_confirmed','viewing_completed','viewing_cancelled','status_changed','follow_up_scheduled','follow_up_completed','follow_up_cleared','whatsapp_follow_up_opened','deal_value_updated','lead_assigned') NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `expected_deal_value` int unsigned;--> statement-breakpoint
ALTER TABLE `leads` ADD `final_sale_value` int unsigned;--> statement-breakpoint
ALTER TABLE `leads` ADD `lost_reason` enum('price_too_high','vehicle_sold_elsewhere','no_response','budget_issue','not_interested','purchased_elsewhere','other');--> statement-breakpoint
ALTER TABLE `leads` ADD `lost_reason_detail` varchar(160);--> statement-breakpoint
ALTER TABLE `leads` ADD `assigned_to` varchar(160);--> statement-breakpoint
ALTER TABLE `leads` ADD `created_by` varchar(160);--> statement-breakpoint
ALTER TABLE `leads` ADD `updated_by` varchar(160);--> statement-breakpoint
CREATE INDEX `leads_assigned_idx` ON `leads` (`assigned_to`);