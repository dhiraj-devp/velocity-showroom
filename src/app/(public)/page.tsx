import { CtaSection } from "@/features/home/components/CtaSection";
import { BuyingJourney } from "@/features/home/components/BuyingJourney";
import { CategoryBrowse } from "@/features/home/components/CategoryBrowse";
import { FeaturedVehicles } from "@/features/home/components/FeaturedVehicles";
import { HeroSection } from "@/features/home/components/HeroSection";
import { HomepageSearch } from "@/features/home/components/HomepageSearch";
import { LatestArrivals } from "@/features/home/components/LatestArrivals";
import { ShowroomPreview } from "@/features/home/components/ShowroomPreview";
import { SpinPromo } from "@/features/home/components/SpinPromo";
import { WhyChooseUs } from "@/features/home/components/WhyChooseUs";
import { dealershipRepository } from "@/features/dealership/repository/dealershipRepository";
import { vehicleRepository } from "@/features/vehicles/repository/vehicleRepository";

export default async function Home() {
  const [search, categories, latest, spin, dealership] = await Promise.all([
    vehicleRepository.getVehicleSearchOptions(),
    vehicleRepository.getHomepageCategories(),
    vehicleRepository.getLatestVehicles(6),
    vehicleRepository.get360ShowcaseVehicle(),
    dealershipRepository.get(),
  ]);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <HeroSection />
      <ShowroomPreview />
      <HomepageSearch options={search} />
      <CategoryBrowse categories={categories} />
      <LatestArrivals records={latest} />
      <FeaturedVehicles />
      <WhyChooseUs />
      <SpinPromo record={spin} />
      <BuyingJourney dealership={dealership} />
      <CtaSection />
    </main>
  );
}
