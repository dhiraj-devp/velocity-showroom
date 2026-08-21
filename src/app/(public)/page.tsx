import { CtaSection } from "@/features/home/components/CtaSection";
import { ExperienceSection } from "@/features/home/components/ExperienceSection";
import { FeaturedVehicles } from "@/features/home/components/FeaturedVehicles";
import { HeroSection } from "@/features/home/components/HeroSection";
import { ShowroomPreview } from "@/features/home/components/ShowroomPreview";

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <HeroSection />
      <ShowroomPreview />
      <FeaturedVehicles />
      <ExperienceSection />
      <CtaSection />
    </main>
  );
}
