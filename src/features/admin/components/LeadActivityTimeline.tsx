import { formatDeskDateTime } from "@/features/leads/lib/followUp";
import type { LeadActivity } from "@/features/leads/types";

export function LeadActivityTimeline({ activities }: { activities: LeadActivity[] }) {
  if (activities.length === 0) {
    return <p className="mt-4 text-sm text-muted">No activity recorded yet.</p>;
  }

  return (
    <ol className="lead-timeline">
      {activities.map((activity, index) => (
        <li key={activity.id} className={index === 0 ? "is-latest" : undefined}>
          <p className="text-[0.58rem] tracking-[0.18em] text-muted uppercase">
            {index === 0 ? "Latest · " : ""}
            {formatDeskDateTime(activity.createdAt)}
          </p>
          <p className="mt-1 text-sm">{activity.title}</p>
        </li>
      ))}
    </ol>
  );
}
