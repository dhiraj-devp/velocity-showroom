import type { Category } from "@/features/vehicles/types";

type VehicleCategoryNavProps = {
  categories: Category[];
  activeId: string | null;
  onChange: (categoryId: string | null) => void;
};

export function VehicleCategoryNav({
  categories,
  activeId,
  onChange,
}: VehicleCategoryNavProps) {
  return (
    <nav aria-label="Vehicle categories" className="collection-categories">
      <button
        type="button"
        className="collection-chip"
        aria-pressed={activeId === null}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className="collection-chip"
          aria-pressed={activeId === category.id}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </nav>
  );
}
