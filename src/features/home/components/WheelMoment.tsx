import { MotionReveal } from "@/features/home/motion/MotionReveal";

export function WheelMoment() {
  return (
    <section
      id="craft"
      aria-labelledby="craft-heading"
      className="border-t border-border px-5 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <MotionReveal variant="left">
          <div className="wheel-stage mx-auto max-w-[22rem] lg:max-w-none">
            <div className="wheel-disc">
              <span className="wheel-ring" />
              <span className="wheel-hub" />
              {Array.from({ length: 8 }, (_, index) => (
                <span
                  key={index}
                  className="wheel-spoke"
                  style={{ transform: `rotate(${index * 45}deg)` }}
                />
              ))}
            </div>
          </div>
        </MotionReveal>

        <MotionReveal variant="right" delay={80}>
          <p className="text-[0.7rem] tracking-[0.42em] text-accent uppercase">
            Surface
          </p>
          <h2
            id="craft-heading"
            className="font-display mt-5 text-[clamp(2.2rem,6vw,4.6rem)] leading-[0.92] tracking-[-0.04em]"
          >
            Every line
            <br />
            has intention.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            Proportion, stance, and light — composed so the machine feels
            inevitable before you ever sit in it.
          </p>
        </MotionReveal>
      </div>
    </section>
  );
}
