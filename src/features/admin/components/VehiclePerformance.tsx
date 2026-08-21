import Link from "next/link";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";
import type { VehicleLeadStats } from "@/features/leads/types";

export function VehiclePerformance({
  vehicleId,
  stats,
}: {
  vehicleId: string;
  stats: VehicleLeadStats;
}) {
  return (
    <section className="admin-section">
      <h2>Performance</h2>
      <p className="text-sm text-muted">Actual enquiries and viewings for this vehicle.</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Total enquiries"
          value={stats.totalEnquiries}
          href={`/admin/leads?vehicle=${vehicleId}`}
        />
        <Metric
          label="WhatsApp interactions"
          value={stats.whatsappInteractions}
          href={`/admin/leads?vehicle=${vehicleId}&source=whatsapp`}
        />
        <Metric
          label="Call intents"
          value={stats.callIntents}
          href={`/admin/leads?vehicle=${vehicleId}&source=phone`}
        />
        <Metric
          label="Viewings"
          value={stats.viewings}
          href={`/admin/viewings?vehicle=${vehicleId}`}
        />
        <Metric
          label="Active leads"
          value={stats.activeLeads}
          href={`/admin/leads?vehicle=${vehicleId}`}
        />
        <Metric
          label="Qualified"
          value={stats.qualifiedLeads}
          href={`/admin/leads?vehicle=${vehicleId}&status=qualified`}
        />
        <Metric
          label="Won"
          value={stats.wonLeads}
          href={`/admin/leads?vehicle=${vehicleId}&status=won`}
        />
        <Metric
          label="Pipeline value"
          value={stats.pipelineValue}
          href={`/admin/leads?vehicle=${vehicleId}`}
          money
        />
        <Metric
          label="Won revenue"
          value={stats.wonRevenue}
          href={`/admin/leads?vehicle=${vehicleId}&status=won`}
          money
        />
      </dl>
    </section>
  );
}

function Metric({
  label,
  value,
  href,
  money,
}: {
  label: string;
  value: number;
  href: string;
  money?: boolean;
}) {
  return (
    <div className="border border-border px-4 py-4">
      <dt className="text-[0.55rem] tracking-[0.2em] text-muted uppercase">{label}</dt>
      <dd className="font-display mt-2 text-3xl tracking-[-0.04em]">
        {money ? (value > 0 ? formatPrice(value) : "₹0") : value}
      </dd>
      <Link href={href} className="mt-3 inline-block text-[0.58rem] tracking-[0.2em] uppercase">
        Open
      </Link>
    </div>
  );
}
