"use client";

import Link from "next/link";
import { EnquiryDialog } from "@/features/leads/components/EnquiryDialog";
import { useState } from "react";
import { useCompareList } from "@/features/compare/components/CompareProvider";
import type { Dealership } from "@/features/dealership/types";
import { VehicleImageFrame } from "@/features/vehicles/components/VehicleImageFrame";
import { availabilityLabel } from "@/features/vehicles/lib/availability";
import {
  formatFuel,
  formatMileage,
  formatPrice,
  formatTransmission,
} from "@/features/vehicles/lib/formatCurrency";
import { getHeroImage } from "@/features/vehicles/lib/resolveVehicle";
import type { VehicleRecord } from "@/features/vehicles/types";

export function CompareTable({
  records,
  dealership,
}: {
  records: VehicleRecord[];
  dealership: Dealership;
}) {
  const { remove } = useCompareList();
  const [enquirySlug, setEnquirySlug] = useState<string | null>(null);
  const enquiryRecord = records.find((item) => item.vehicle.slug === enquirySlug) ?? null;

  if (records.length === 0) {
    return (
      <p className="mt-10 max-w-xl text-base text-muted">
        Choose up to three cars from the collection to compare side by side.
      </p>
    );
  }

  const rows: { label: string; value: (record: VehicleRecord) => string }[] = [
    { label: "Brand", value: (record) => record.brand.name },
    { label: "Model", value: (record) => record.model.name },
    { label: "Price", value: (record) => formatPrice(record.vehicle.price, record.vehicle.currency) },
    { label: "Year", value: (record) => String(record.vehicle.year) },
    {
      label: "Mileage",
      value: (record) =>
        record.vehicle.mileageKm !== undefined ? formatMileage(record.vehicle.mileageKm) : "—",
    },
    { label: "Fuel", value: (record) => formatFuel(record.vehicle.fuelType) },
    { label: "Transmission", value: (record) => formatTransmission(record.vehicle.transmission) },
    { label: "Engine", value: () => "—" },
    { label: "Power", value: () => "—" },
    { label: "Seating", value: () => "—" },
    { label: "Availability", value: (record) => availabilityLabel(record.vehicle.availability) },
  ];

  return (
    <div className="compare-table-wrap mt-10">
      <table className="compare-table">
        <thead>
          <tr>
            <th></th>
            {records.map((record) => {
              const hero = getHeroImage(record);
              return (
                <th key={record.vehicle.id}>
                  <VehicleImageFrame
                    image={hero}
                    brandId={record.brand.id}
                    brandName={record.brand.name}
                    vehicleName={record.vehicle.name}
                    className="aspect-[16/10]"
                  />
                  <p className="mt-4 font-display text-xl tracking-[-0.03em]">{record.vehicle.name}</p>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th>{row.label}</th>
              {records.map((record) => (
                <td key={record.vehicle.id}>{row.value(record)}</td>
              ))}
            </tr>
          ))}
          <tr>
            <th></th>
            {records.map((record) => (
              <td key={record.vehicle.id}>
                <div className="flex flex-col items-start gap-3">
                  <button type="button" className="admin-ghost" onClick={() => remove(record.vehicle.slug)}>
                    Remove
                  </button>
                  <Link href={`/cars/${record.vehicle.slug}`} className="text-[0.58rem] tracking-[0.2em] uppercase">
                    View vehicle
                  </Link>
                  <button
                    type="button"
                    className="collection-apply"
                    onClick={() => setEnquirySlug(record.vehicle.slug)}
                  >
                    Enquire
                  </button>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {enquiryRecord ? (
        <EnquiryDialog
          open
          mode="vehicle_enquiry"
          record={enquiryRecord}
          dealership={dealership}
          onClose={() => setEnquirySlug(null)}
        />
      ) : null}
    </div>
  );
}
