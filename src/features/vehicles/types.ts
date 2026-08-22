export type FuelType = "petrol" | "diesel" | "electric" | "hybrid";
export type Transmission = "automatic" | "manual";
export type VehicleCondition = "new" | "used";
export type VehicleAvailability = "available" | "reserved" | "sold" | "coming_soon";
export type CurrencyCode = "INR";
export type ImageRole = "hero" | "gallery";
export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "year-asc";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
};

export type Model = {
  id: string;
  brandId: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type VehicleImage = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  role: ImageRole;
};

export type Vehicle360Frame = {
  id: string;
  src: string;
  sortOrder: number;
};

export type Vehicle = {
  id: string;
  slug: string;
  brandId: string;
  modelId: string;
  categoryId: string;
  name: string;
  year: number;
  price: number;
  currency: CurrencyCode;
  mileageKm?: number;
  fuelType: FuelType;
  transmission: Transmission;
  condition: VehicleCondition;
  location?: string;
  description: string;
  images: VehicleImage[];
  frames: Vehicle360Frame[];
  isFeatured: boolean;
  availability: VehicleAvailability;
  hasGallery: boolean;
  is360Enabled: boolean;
  has360View: boolean;
  has3DExperience: boolean;
  optional3DModelUrl?: string;
  createdAt: string;
};

export type VehicleRecord = {
  vehicle: Vehicle;
  brand: Brand;
  model: Model;
  category: Category;
};

export type VehicleWriteInput = {
  slug: string;
  brandId: string;
  modelId: string;
  categoryId: string;
  name: string;
  year: number;
  price: number;
  currency: CurrencyCode;
  mileageKm?: number;
  fuelType: FuelType;
  transmission: Transmission;
  condition: VehicleCondition;
  availability: VehicleAvailability;
  description: string;
  location?: string;
  isFeatured: boolean;
  hasGallery: boolean;
  has360View: boolean;
  has3DExperience: boolean;
  optional3DModelUrl?: string;
};

export type VehicleCatalog = {
  brands: Brand[];
  models: Model[];
  categories: Category[];
  vehicles: Vehicle[];
};

export type VehicleFilters = {
  query: string;
  brandId: string | null;
  modelId: string | null;
  categoryId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  yearMin: number | null;
  yearMax: number | null;
  fuelType: FuelType | null;
  transmission: Transmission | null;
  condition: VehicleCondition | null;
  availability: VehicleAvailability | null;
};

export type HomepageCategory = {
  id: string;
  name: string;
  slug: string;
  vehicleCount: number;
};

export type VehicleSearchOptions = {
  brands: Brand[];
  models: Model[];
  categories: Category[];
};

export type PricePresetId =
  | "any"
  | "under-10l"
  | "10-25l"
  | "25-50l"
  | "50l-1cr"
  | "1cr-plus"
  | "custom";

export type PricePreset = {
  id: Exclude<PricePresetId, "custom">;
  label: string;
  min: number | null;
  max: number | null;
};
