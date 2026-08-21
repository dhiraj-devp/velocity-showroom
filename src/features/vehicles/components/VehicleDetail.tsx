import Link from "next/link";
import { localDealershipRepository } from "@/features/dealership/repository/localDealershipRepository";
import { SimilarVehicles } from "@/features/vehicles/components/SimilarVehicles";
import { VehicleConversion } from "@/features/vehicles/components/VehicleConversion";
import { VehicleExperienceCta } from "@/features/vehicles/components/VehicleExperienceCta";
import { VehicleGallery } from "@/features/vehicles/components/VehicleGallery";
import { VehicleStatus } from "@/features/vehicles/components/VehicleStatus";
import {
  formatCondition,
  formatFuel,
  formatMileage,
  formatPrice,
  formatTransmission,
} from "@/features/vehicles/lib/formatCurrency";
import type { VehicleRecord } from "@/features/vehicles/types";

export function VehicleDetail({
  record,
  similar,
}: {
  record: VehicleRecord;
  similar: VehicleRecord[];
}) {
  const { vehicle, brand, model, category } = record;
  const dealership = localDealershipRepository.get();

  return (
    <article className="vehicle-detail px-5 pt-28 pb-24 md:px-10 md:pt-32 md:pb-32 lg:px-14">
      <nav aria-label="Breadcrumb" className="text-[0.58rem] tracking-[0.24em] text-muted uppercase">
        <Link href="/cars" className="transition-colors hover:text-foreground">
          Collection
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{brand.name}</span>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{vehicle.name}</span>
      </nav>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:items-start">
        <VehicleGallery record={record} />

        <div>
          <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">
            {brand.name}
          </p>
          <div className="mt-3">
            <VehicleStatus status={vehicle.availability} alwaysShow />
          </div>
          <h1 className="font-display mt-3 text-4xl tracking-[-0.04em] sm:text-5xl">
            {vehicle.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {model.name} · {category.name}
          </p>
          <p className="mt-6 font-display text-3xl tracking-[-0.03em]">
            {formatPrice(vehicle.price, vehicle.currency)}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-5 border-t border-border pt-6 text-sm">
            <Spec label="Year" value={String(vehicle.year)} />
            <Spec label="Transmission" value={formatTransmission(vehicle.transmission)} />
            <Spec label="Fuel" value={formatFuel(vehicle.fuelType)} />
            <Spec
              label="Mileage"
              value={
                vehicle.mileageKm !== undefined
                  ? formatMileage(vehicle.mileageKm)
                  : "New"
              }
            />
            <Spec label="Condition" value={formatCondition(vehicle.condition)} />
            {vehicle.location ? (
              <Spec label="Location" value={vehicle.location} />
            ) : null}
          </dl>

          <p className="mt-8 max-w-md text-base leading-relaxed text-muted">
            {vehicle.description}
          </p>

          <div className="mt-10">
            <VehicleConversion record={record} dealership={dealership} />
          </div>
        </div>
      </div>

      <VehicleExperienceCta record={record} />
      <SimilarVehicles records={similar} />
    </article>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.58rem] tracking-[0.24em] text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-2">{value}</dd>
    </div>
  );
}
