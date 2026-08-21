import { MagneticButton } from "@/components/common/MagneticButton";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ShowroomStage } from "@/features/home/components/ShowroomStage";

export function ShowroomPreview() {
  return (
    <section id="showroom" aria-labelledby="showroom-heading">
      <div className="flex flex-col gap-8 px-5 pt-20 md:px-10 md:pt-28 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:pt-32">
        <SectionHeading
          eyebrow="The Space"
          title={
            <span id="showroom-heading">
              NOT JUST
              <br />
              A SHOWROOM.
            </span>
          }
          description="An immersive way to discover your next machine."
        />
        <MagneticButton href="/cars">Enter the Collection</MagneticButton>
      </div>

      <div className="mt-10 border-y border-border md:mt-14">
        <ShowroomStage />
      </div>

      <CollectionBridge />
    </section>
  );
}

function CollectionBridge() {
  return (
    <div className="px-5 pt-14 pb-6 md:px-10 md:pt-20 md:pb-8 lg:px-14">
      <p className="text-[0.65rem] tracking-[0.38em] text-accent uppercase">
        From the floor
      </p>
      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-end sm:justify-between">
        <p className="font-display text-2xl tracking-[-0.03em] text-muted sm:text-3xl lg:text-4xl">
          Explore the environment.
        </p>
        <p className="font-display text-2xl tracking-[-0.03em] sm:text-right sm:text-3xl lg:text-4xl">
          Explore the collection.
        </p>
      </div>
    </div>
  );
}
