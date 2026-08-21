import { VehicleForm } from "@/features/admin/components/VehicleForm";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export const metadata = { title: "New vehicle | Desk" };

export default async function NewVehiclePage() {
  const catalog = await vehicleRepository.getCatalog();
  return (
    <main id="main" className="admin-page">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">Inventory</p>
      <h1 className="font-display mt-3 text-4xl tracking-[-0.04em]">New vehicle</h1>
      <div className="mt-10 max-w-3xl">
        <VehicleForm catalog={catalog} />
      </div>
    </main>
  );
}
