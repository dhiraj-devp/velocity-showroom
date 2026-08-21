import { ActionForm } from "@/features/admin/components/ActionForm";
import { ConfirmSubmit } from "@/features/admin/components/ConfirmSubmit";
import {
  createBrandAction,
  createCategoryAction,
  createModelAction,
  deleteBrandAction,
  deleteCategoryAction,
  deleteModelAction,
  updateBrandAction,
  updateCategoryAction,
  updateModelAction,
} from "@/features/admin/actions/catalog";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export const metadata = { title: "Catalog | Desk" };

export default async function AdminCatalogPage() {
  const catalog = await vehicleRepository.getCatalog();

  return (
    <main id="main" className="admin-page">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">Structure</p>
      <h1 className="font-display mt-3 text-4xl tracking-[-0.04em]">Brands & models</h1>

      <section className="mt-12">
        <h2 className="admin-heading">Brands</h2>
        <ActionForm action={createBrandAction} className="mt-4 grid gap-3 md:grid-cols-3" success="Brand added.">
          <input className="collection-input" name="name" placeholder="Name" required />
          <input className="collection-input" name="slug" placeholder="Slug (optional)" />
          <button type="submit" className="collection-apply">Add brand</button>
        </ActionForm>
        <ul className="mt-6 divide-y divide-border">
          {catalog.brands.map((brand) => (
            <li key={brand.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
              <ActionForm action={updateBrandAction} className="flex flex-1 flex-col gap-3 md:flex-row">
                <input type="hidden" name="id" value={brand.id} />
                <input className="collection-input" name="name" defaultValue={brand.name} />
                <input className="collection-input" name="slug" defaultValue={brand.slug} />
                <button type="submit" className="admin-ghost">Save</button>
              </ActionForm>
              <ConfirmSubmit
                action={deleteBrandAction}
                label="Delete"
                confirmLabel={`Delete ${brand.name}? Only if unused.`}
                hidden={{ id: brand.id }}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="admin-heading">Models</h2>
        <ActionForm action={createModelAction} className="mt-4 grid gap-3 md:grid-cols-4" success="Model added.">
          <select className="collection-select" name="brandId" required>
            <option value="">Brand</option>
            {catalog.brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <input className="collection-input" name="name" placeholder="Name" required />
          <input className="collection-input" name="slug" placeholder="Slug" />
          <button type="submit" className="collection-apply">Add model</button>
        </ActionForm>
        <ul className="mt-6 divide-y divide-border">
          {catalog.models.map((model) => {
            const brand = catalog.brands.find((item) => item.id === model.brandId);
            return (
              <li key={model.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
                <ActionForm action={updateModelAction} className="flex flex-1 flex-col gap-3 md:flex-row">
                  <input type="hidden" name="id" value={model.id} />
                  <select className="collection-select" name="brandId" defaultValue={model.brandId}>
                    {catalog.brands.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <input className="collection-input" name="name" defaultValue={model.name} />
                  <input className="collection-input" name="slug" defaultValue={model.slug} />
                  <button type="submit" className="admin-ghost">Save</button>
                </ActionForm>
                <p className="text-[0.58rem] tracking-[0.16em] text-muted uppercase">{brand?.name}</p>
                <ConfirmSubmit
                  action={deleteModelAction}
                  label="Delete"
                  confirmLabel={`Delete ${model.name}? Only if unused.`}
                  hidden={{ id: model.id }}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="admin-heading">Categories</h2>
        <ActionForm action={createCategoryAction} className="mt-4 grid gap-3 md:grid-cols-3" success="Category added.">
          <input className="collection-input" name="name" placeholder="Name" required />
          <input className="collection-input" name="slug" placeholder="Slug" />
          <button type="submit" className="collection-apply">Add category</button>
        </ActionForm>
        <ul className="mt-6 divide-y divide-border">
          {catalog.categories.map((category) => (
            <li key={category.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
              <ActionForm action={updateCategoryAction} className="flex flex-1 flex-col gap-3 md:flex-row">
                <input type="hidden" name="id" value={category.id} />
                <input className="collection-input" name="name" defaultValue={category.name} />
                <input className="collection-input" name="slug" defaultValue={category.slug} />
                <button type="submit" className="admin-ghost">Save</button>
              </ActionForm>
              <ConfirmSubmit
                action={deleteCategoryAction}
                label="Delete"
                confirmLabel={`Delete ${category.name}? Only if unused.`}
                hidden={{ id: category.id }}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
