import Link from "next/link";
import { availabilityLabel } from "@/features/vehicles/lib/availability";
import { formatPrice } from "@/features/vehicles/lib/formatCurrency";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";
import { getHeroImage } from "@/features/vehicles/lib/resolveVehicle";

export const metadata = { title: "Vehicles | Desk" };

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function read(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminVehiclesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = read(params.q).trim().toLowerCase();
  const brandId = read(params.brand);
  const modelId = read(params.model);
  const categoryId = read(params.category);
  const availability = read(params.availability);
  const catalog = await vehicleRepository.getCatalog();
  const models = brandId
    ? catalog.models.filter((model) => model.brandId === brandId)
    : catalog.models;

  const records = catalog.vehicles
    .map((vehicle) => {
      const brand = catalog.brands.find((item) => item.id === vehicle.brandId);
      const model = catalog.models.find((item) => item.id === vehicle.modelId);
      const category = catalog.categories.find((item) => item.id === vehicle.categoryId);
      if (!brand || !model || !category) return null;
      return { vehicle, brand, model, category };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter((record) => {
      if (brandId && record.vehicle.brandId !== brandId) return false;
      if (modelId && record.vehicle.modelId !== modelId) return false;
      if (categoryId && record.vehicle.categoryId !== categoryId) return false;
      if (availability && record.vehicle.availability !== availability) return false;
      if (q) {
        const hay = `${record.brand.name} ${record.model.name} ${record.vehicle.name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

  return (
    <main id="main" className="admin-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">Inventory</p>
          <h1 className="font-display mt-3 text-4xl tracking-[-0.04em]">Vehicles</h1>
        </div>
        <Link href="/admin/vehicles/new" className="collection-apply">
          New vehicle
        </Link>
      </div>

      <form className="mt-8 grid gap-3 md:grid-cols-5">
        <input className="collection-input" name="q" defaultValue={q} placeholder="Search" />
        <select className="collection-select" name="brand" defaultValue={brandId}>
          <option value="">All brands</option>
          {catalog.brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select className="collection-select" name="model" defaultValue={modelId}>
          <option value="">All models</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <select className="collection-select" name="category" defaultValue={categoryId}>
          <option value="">All categories</option>
          {catalog.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select className="collection-select" name="availability" defaultValue={availability}>
          <option value="">Any status</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
          <option value="coming_soon">Coming soon</option>
        </select>
        <button type="submit" className="collection-apply md:col-span-5 lg:col-span-1">
          Filter
        </button>
      </form>

      <p className="mt-6 text-[0.62rem] tracking-[0.2em] text-muted uppercase">
        {records.length} vehicles
      </p>

      <div className="admin-table-wrap mt-4 hidden md:block">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Vehicle</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Year</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const hero = getHeroImage(record);
              return (
                <tr key={record.vehicle.id}>
                  <td>
                    {hero ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hero.src} alt="" className="h-12 w-20 object-cover bg-surface" />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    {record.vehicle.name}
                    {record.vehicle.isFeatured ? (
                      <span className="ml-2 text-[0.58rem] tracking-[0.16em] text-accent uppercase">
                        Featured
                      </span>
                    ) : null}
                  </td>
                  <td>{record.brand.name}</td>
                  <td>{record.model.name}</td>
                  <td>{record.vehicle.year}</td>
                  <td>{formatPrice(record.vehicle.price, record.vehicle.currency)}</td>
                  <td>{availabilityLabel(record.vehicle.availability)}</td>
                  <td className="whitespace-nowrap">
                    <Link href={`/admin/vehicles/${record.vehicle.id}/edit`}>Edit</Link>
                    {" · "}
                    <Link href={`/cars/${record.vehicle.slug}`} target="_blank">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 grid gap-4 md:hidden">
        {records.map((record) => (
          <li key={record.vehicle.id} className="border border-border p-4">
            <p className="text-[0.58rem] tracking-[0.2em] text-accent uppercase">
              {record.brand.name}
            </p>
            <p className="font-display mt-2 text-2xl">{record.vehicle.name}</p>
            <p className="mt-2 text-sm text-muted">
              {record.vehicle.year} · {availabilityLabel(record.vehicle.availability)} ·{" "}
              {formatPrice(record.vehicle.price, record.vehicle.currency)}
            </p>
            <div className="mt-4 flex gap-4 text-[0.62rem] tracking-[0.2em] uppercase">
              <Link href={`/admin/vehicles/${record.vehicle.id}/edit`}>Edit</Link>
              <Link href={`/cars/${record.vehicle.slug}`}>View</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
