import { MagneticButton } from "@/components/common/MagneticButton";
import { SectionHeading } from "@/components/common/SectionHeading";
import { MotionReveal } from "@/features/home/motion/MotionReveal";
import { ShowroomStage } from "@/features/home/components/ShowroomStage";

export function ShowroomPreview() {
  return (
    <section id="showroom" aria-labelledby="showroom-heading" className="overflow-x-hidden">
      <div className="flex flex-col gap-8 px-5 pt-20 md:px-10 md:pt-28 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:pt-32">
        <MotionReveal variant="left">
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
        </MotionReveal>
        <MotionReveal variant="right" delay={80}>
          <MagneticButton href="/cars">Enter the Collection</MagneticButton>
        </MotionReveal>
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
    <div className="px-5 pt-16 pb-8 md:px-10 md:pt-24 md:pb-10 lg:px-14">
      <MotionReveal variant="up">
        <p className="text-[0.65rem] tracking-[0.38em] text-accent uppercase">
          From the floor
        </p>
        <div className="mt-6 flex flex-col gap-6 border-t border-border pt-10 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-display max-w-xl text-3xl tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            Presence first.
            <span className="mt-3 block text-muted">Then the collection.</span>
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted sm:text-right">
            A private list of motor cars, composed for those who expect more than
            a catalogue.
          </p>
        </div>
      </MotionReveal>
    </div>
  );
}
