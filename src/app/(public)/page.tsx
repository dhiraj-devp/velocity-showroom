import { CtaSection } from "@/features/home/components/CtaSection";
import { BuyingJourney } from "@/features/home/components/BuyingJourney";
import { CategoryBrowse } from "@/features/home/components/CategoryBrowse";
import { FeaturedVehicles } from "@/features/home/components/FeaturedVehicles";
import { HeroSection } from "@/features/home/components/HeroSection";
import { HomepageSearch } from "@/features/home/components/HomepageSearch";
import { LatestArrivals } from "@/features/home/components/LatestArrivals";
import { ShowroomPreview } from "@/features/home/components/ShowroomPreview";
import { SpinPromo } from "@/features/home/components/SpinPromo";
import { WheelMoment } from "@/features/home/components/WheelMoment";
import { WhyChooseUs } from "@/features/home/components/WhyChooseUs";
import { dealership as localDealership } from "@/features/dealership/data/dealership";
import { dealershipRepository } from "@/features/dealership/repository/dealershipRepository";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";
import type { HomepageCategory, VehicleRecord, VehicleSearchOptions } from "@/features/vehicles/types";

const EMPTY_SEARCH: VehicleSearchOptions = {
  brands: [],
  models: [],
  categories: [],
};

async function settle<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function Home() {
  const [search, categories, latest, spin, dealership] = await Promise.all([
    settle(vehicleRepository.getVehicleSearchOptions(), EMPTY_SEARCH),
    settle(vehicleRepository.getHomepageCategories(), [] as HomepageCategory[]),
    settle(vehicleRepository.getLatestVehicles(6), [] as VehicleRecord[]),
    settle(vehicleRepository.get360ShowcaseVehicle(), null),
    settle(dealershipRepository.get(), localDealership),
  ]);

  return (
    <main id="main" tabIndex={-1} className="overflow-x-clip outline-none">
      <HeroSection showcase={latest[0] ?? null} />
      <ShowroomPreview />
      <HomepageSearch options={search} />
      <CategoryBrowse categories={categories} />
      <LatestArrivals records={latest} />
      <FeaturedVehicles />
      <WheelMoment />
      <WhyChooseUs />
      <SpinPromo record={spin} />
      <BuyingJourney dealership={dealership} />
      <CtaSection />
    </main>
  );
}
