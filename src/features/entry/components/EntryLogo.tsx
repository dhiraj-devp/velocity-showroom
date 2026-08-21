import { entryCopy } from "@/features/entry/constants";

export function EntryLogo() {
  return (
    <div className="entry-brand">
      <p id="entry-heading" className="entry-logo">
        {entryCopy.brand}
      </p>
      <div className="entry-rule" />
      <p id="entry-collection" className="entry-collection">
        <span>{entryCopy.collection}</span>
        <span>{entryCopy.edition}</span>
      </p>
    </div>
  );
}
