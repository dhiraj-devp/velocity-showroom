import { ActionForm } from "@/features/admin/components/ActionForm";
import { updateDealershipAction } from "@/features/admin/actions/settings";
import { dealershipRepository } from "@/features/dealership/repository/dealershipRepository";

export const metadata = { title: "Settings | Desk" };

export default async function AdminSettingsPage() {
  const dealership = await dealershipRepository.get();

  return (
    <main id="main" className="admin-page max-w-2xl">
      <p className="text-[0.62rem] tracking-[0.36em] text-accent uppercase">House</p>
      <h1 className="font-display mt-3 text-4xl tracking-[-0.04em]">Settings</h1>
      <ActionForm action={updateDealershipAction} className="admin-form mt-10" success="Saved.">
        <label className="collection-field">
          <span className="collection-label">Dealership name</span>
          <input className="collection-input" name="name" defaultValue={dealership.name} required />
        </label>
        <label className="collection-field">
          <span className="collection-label">Legal name</span>
          <input className="collection-input" name="legalName" defaultValue={dealership.legalName ?? ""} />
        </label>
        <label className="collection-field">
          <span className="collection-label">Phone</span>
          <input className="collection-input" name="phone" defaultValue={dealership.phone} required />
        </label>
        <label className="collection-field">
          <span className="collection-label">WhatsApp</span>
          <input className="collection-input" name="whatsapp" defaultValue={dealership.whatsapp} required />
        </label>
        <label className="collection-field">
          <span className="collection-label">Email</span>
          <input className="collection-input" name="email" defaultValue={dealership.email} required />
        </label>
        <label className="collection-field">
          <span className="collection-label">Address</span>
          <input className="collection-input" name="address" defaultValue={dealership.address} />
        </label>
        <div className="admin-grid-2">
          <label className="collection-field">
            <span className="collection-label">City</span>
            <input className="collection-input" name="city" defaultValue={dealership.city} />
          </label>
          <label className="collection-field">
            <span className="collection-label">Country</span>
            <input className="collection-input" name="country" defaultValue={dealership.country} />
          </label>
        </div>
        <label className="collection-field">
          <span className="collection-label">Primary contact</span>
          <input className="collection-input" name="primaryContactName" defaultValue={dealership.primaryContactName ?? ""} />
        </label>
        <label className="collection-field">
          <span className="collection-label">Opening hours</span>
          <input className="collection-input" name="openingHours" defaultValue={dealership.openingHours ?? ""} />
        </label>
        <label className="collection-field">
          <span className="collection-label">Maps URL</span>
          <input className="collection-input" name="mapsUrl" defaultValue={dealership.mapsUrl ?? ""} />
        </label>
        <button type="submit" className="collection-apply">Save settings</button>
      </ActionForm>
    </main>
  );
}
