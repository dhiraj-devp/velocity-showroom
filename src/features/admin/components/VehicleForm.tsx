"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createVehicleAction,
  updateVehicleAction,
  type AdminResult,
} from "@/features/admin/actions/vehicles";
import type { VehicleCatalog, VehicleRecord } from "@/features/vehicles/types";

export function VehicleForm({
  catalog,
  record,
}: {
  catalog: VehicleCatalog;
  record?: VehicleRecord;
}) {
  const vehicle = record?.vehicle;
  const router = useRouter();
  const [brandId, setBrandId] = useState(vehicle?.brandId ?? "");
  const [modelId, setModelId] = useState(vehicle?.modelId ?? "");
  const [result, setResult] = useState<AdminResult | null>(null);
  const models = useMemo(
    () => catalog.models.filter((model) => model.brandId === brandId),
    [brandId, catalog.models],
  );

  const action = vehicle ? updateVehicleAction : createVehicleAction;

  return (
    <form
      className="admin-form"
      action={async (formData) => {
        setResult(null);
        const next = await action(formData);
        if (next) setResult(next);
        if (next?.ok) router.refresh();
      }}
    >
      {vehicle ? (
        <>
          <input type="hidden" name="id" value={vehicle.id} />
          <input type="hidden" name="previousSlug" value={vehicle.slug} />
        </>
      ) : null}

      <section className="admin-section">
        <h2>Basic information</h2>
        <label className="collection-field">
          <span className="collection-label">Brand</span>
          <select
            className="collection-select"
            name="brandId"
            value={brandId}
            required
            onChange={(event) => {
              const nextBrand = event.target.value;
              setBrandId(nextBrand);
              const stillValid = catalog.models.some(
                (model) => model.id === modelId && model.brandId === nextBrand,
              );
              if (!stillValid) setModelId("");
            }}
          >
            <option value="">Select brand</option>
            {catalog.brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <label className="collection-field">
          <span className="collection-label">Model</span>
          <select
            className="collection-select"
            name="modelId"
            value={modelId}
            required
            disabled={!brandId}
            onChange={(event) => setModelId(event.target.value)}
          >
            <option value="">{brandId ? "Select model" : "Select a brand first"}</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </label>
        <label className="collection-field">
          <span className="collection-label">Category</span>
          <select
            className="collection-select"
            name="categoryId"
            defaultValue={vehicle?.categoryId ?? ""}
            required
          >
            <option value="">Select category</option>
            {catalog.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="collection-field">
          <span className="collection-label">Title</span>
          <input className="collection-input" name="name" defaultValue={vehicle?.name ?? ""} required />
        </label>
        <label className="collection-field">
          <span className="collection-label">Slug</span>
          <input className="collection-input" name="slug" defaultValue={vehicle?.slug ?? ""} />
        </label>
      </section>

      <section className="admin-section">
        <h2>Vehicle details</h2>
        <div className="admin-grid-2">
          <label className="collection-field">
            <span className="collection-label">Year</span>
            <input className="collection-input" name="year" type="number" defaultValue={vehicle?.year ?? ""} required />
          </label>
          <label className="collection-field">
            <span className="collection-label">Mileage (km)</span>
            <input className="collection-input" name="mileageKm" type="number" defaultValue={vehicle?.mileageKm ?? ""} />
          </label>
          <label className="collection-field">
            <span className="collection-label">Fuel</span>
            <select className="collection-select" name="fuelType" defaultValue={vehicle?.fuelType ?? "petrol"}>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
          <label className="collection-field">
            <span className="collection-label">Transmission</span>
            <select className="collection-select" name="transmission" defaultValue={vehicle?.transmission ?? "automatic"}>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </label>
          <label className="collection-field">
            <span className="collection-label">Condition</span>
            <select className="collection-select" name="condition" defaultValue={vehicle?.condition ?? "used"}>
              <option value="used">Used</option>
              <option value="new">New</option>
            </select>
          </label>
          <label className="collection-field">
            <span className="collection-label">Location</span>
            <input className="collection-input" name="location" defaultValue={vehicle?.location ?? ""} />
          </label>
        </div>
        <label className="collection-field">
          <span className="collection-label">Description</span>
          <textarea className="collection-input min-h-32 py-3" name="description" defaultValue={vehicle?.description ?? ""} />
        </label>
      </section>

      <section className="admin-section">
        <h2>Pricing & availability</h2>
        <div className="admin-grid-2">
          <label className="collection-field">
            <span className="collection-label">Price (INR, whole rupees)</span>
            <input className="collection-input" name="price" type="number" defaultValue={vehicle?.price ?? ""} required />
          </label>
          <label className="collection-field">
            <span className="collection-label">Availability</span>
            <select className="collection-select" name="availability" defaultValue={vehicle?.availability ?? "available"}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="coming_soon">Coming soon</option>
            </select>
          </label>
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={vehicle?.isFeatured} />
          Featured
        </label>
      </section>

      <section className="admin-section">
        <h2>Experience options</h2>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="hasGallery" defaultChecked={vehicle?.hasGallery} />
          Has gallery
        </label>
        <label className="mt-3 flex items-center gap-3 text-sm">
          <input type="checkbox" name="has3DExperience" defaultChecked={vehicle?.has3DExperience} />
          Has 3D experience
        </label>
        <p className="mt-4 text-sm text-muted">
          Enable 360° view in the 360° experience section after at least eight frames are uploaded.
        </p>
        <label className="collection-field mt-4">
          <span className="collection-label">Optional 3D model URL</span>
          <input className="collection-input" name="optional3DModelUrl" defaultValue={vehicle?.optional3DModelUrl ?? ""} />
        </label>
      </section>

      {result && !result.ok ? (
        <p className="text-sm text-accent" role="alert">
          {result.error}
        </p>
      ) : null}
      {result?.ok ? (
        <p className="text-sm text-muted" aria-live="polite">
          Saved.
        </p>
      ) : null}

      <button type="submit" className="collection-apply">
        {vehicle ? "Save vehicle" : "Create vehicle"}
      </button>
    </form>
  );
}
