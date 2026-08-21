import { LeadWorkList } from "@/features/admin/components/LeadWorkList";
import { getFollowUpState } from "@/features/leads/lib/followUp";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import type { FollowUpState, Lead, LeadPriority } from "@/features/leads/types";

export const metadata = { title: "Follow-ups | Desk" };

const PRIORITY_RANK: Record<LeadPriority, number> = {
  hot: 0,
  warm: 1,
  normal: 2,
};

function sortDesk(leads: Lead[]) {
  return [...leads].sort((a, b) => {
    const priority =
      PRIORITY_RANK[a.priority ?? "normal"] - PRIORITY_RANK[b.priority ?? "normal"];
    if (priority !== 0) return priority;
    const aAt = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Number.POSITIVE_INFINITY;
    const bAt = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Number.POSITIVE_INFINITY;
    return aAt - bAt;
  });
}

function partitionDesk(leads: Lead[]) {
  const buckets: Record<FollowUpState, Lead[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    unscheduled: [],
  };
  for (const lead of leads) {
    buckets[getFollowUpState(lead.nextFollowUpAt)].push(lead);
  }
  return {
    overdue: sortDesk(buckets.overdue),
    today: sortDesk(buckets.today),
    upcoming: sortDesk(buckets.upcoming),
    unscheduled: sortDesk(buckets.unscheduled),
  };
}

export default async function AdminFollowUpsPage() {
  const desk = partitionDesk(await leadRepository.listOpenDesk());

  return (
    <main id="main" className="admin-page">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">Operations</p>
      <h1 className="font-display mt-3 text-4xl tracking-[-0.04em]">Follow-ups</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Work the queue in order: overdue, due today, then upcoming. Hot leads surface first inside each section.
      </p>

      <FollowUpSection title="Overdue" count={desk.overdue.length} empty="Nothing overdue." leads={desk.overdue} />
      <FollowUpSection title="Today" count={desk.today.length} empty="Nothing due today." leads={desk.today} />
      <FollowUpSection title="Upcoming" count={desk.upcoming.length} empty="No upcoming follow-ups." leads={desk.upcoming} />
      <FollowUpSection
        title="No follow-up"
        count={desk.unscheduled.length}
        empty="Every open lead has a follow-up."
        leads={desk.unscheduled}
      />
    </main>
  );
}

function FollowUpSection({
  title,
  count,
  empty,
  leads,
}: {
  title: string;
  count: number;
  empty: string;
  leads: Lead[];
}) {
  return (
    <section className="mt-12">
      <h2 className="admin-heading">
        {title} <span className="text-muted">· {count}</span>
      </h2>
      <LeadWorkList leads={leads} empty={empty} />
    </section>
  );
}
