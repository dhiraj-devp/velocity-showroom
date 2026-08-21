import { notFound } from "next/navigation";
import { ConfirmSubmit } from "@/features/admin/components/ConfirmSubmit";
import { ReservationDesk } from "@/features/admin/components/ReservationDesk";
import { VehicleForm } from "@/features/admin/components/VehicleForm";
import { VehicleImageManager } from "@/features/admin/components/VehicleImageManager";
import { Vehicle360Manager } from "@/features/admin/components/Vehicle360Manager";
import { VehicleInternalSection } from "@/features/admin/components/VehicleInternalSection";
import { VehiclePerformance } from "@/features/admin/components/VehiclePerformance";
import { deleteVehicleAction } from "@/features/admin/actions/vehicles";
import { leadRepository } from "@/features/leads/repository/leadRepository";
import { reservationRepository } from "@/features/reservations/repository/reservationRepository";
import { vehicleInternalRepository } from "@/features/vehicles/repository/vehicleInternalRepository";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export const metadata = { title: "Edit vehicle | Desk" };

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [catalog, record, stats, internal, reservation, vehicleLeads] = await Promise.all([
    vehicleRepository.getCatalog(),
    vehicleRepository.getVehicleById(id),
    leadRepository.statsForVehicle(id),
    vehicleInternalRepository.getByVehicleId(id),
    reservationRepository.getActiveByVehicle(id),
    leadRepository.list({ vehicleId: id }),
  ]);
  if (!record) notFound();

  return (
    <main id="main" className="admin-page">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">Inventory</p>
      <h1 className="font-display mt-3 text-4xl tracking-[-0.04em]">{record.vehicle.name}</h1>
      <div className="mt-10 max-w-4xl">
        <VehiclePerformance vehicleId={record.vehicle.id} stats={stats} />
        <ReservationDesk
          vehicleId={record.vehicle.id}
          leads={vehicleLeads}
          reservation={reservation}
          allowCreate={!reservation && record.vehicle.availability === "available"}
        />
        <VehicleForm catalog={catalog} record={record} />
        <div className="mt-12">
          <VehicleInternalSection
            vehicleId={record.vehicle.id}
            salePrice={record.vehicle.price}
            record={internal}
          />
        </div>
        <div className="mt-12">
          <VehicleImageManager vehicleId={record.vehicle.id} images={record.vehicle.images} />
        </div>
        <div className="mt-12">
          <Vehicle360Manager
            vehicleId={record.vehicle.id}
            vehicleName={record.vehicle.name}
            frames={record.vehicle.frames}
            enabled={record.vehicle.is360Enabled}
          />
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <ConfirmSubmit
            action={deleteVehicleAction}
            label="Delete vehicle"
            confirmLabel="Delete this vehicle permanently?"
            hidden={{ id: record.vehicle.id, slug: record.vehicle.slug }}
          />
        </div>
      </div>
    </main>
  );
}
