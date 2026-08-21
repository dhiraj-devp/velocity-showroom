import type { LeadPriority } from "@/features/leads/types";
import { LEAD_PRIORITY_LABELS } from "@/features/leads/lib/priority";

export function LeadPriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <span className="lead-priority" data-priority={priority}>
      {LEAD_PRIORITY_LABELS[priority]}
    </span>
  );
}
