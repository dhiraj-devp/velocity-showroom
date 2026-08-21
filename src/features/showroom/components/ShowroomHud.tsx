import { showroomCopy } from "@/features/showroom/config";

export function ShowroomHud() {
  return (
    <div className="showroom-hud pointer-events-none absolute inset-0 z-20">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8">
        <p className="text-[0.58rem] tracking-[0.36em] text-accent uppercase sm:text-[0.62rem]">
          {showroomCopy.brand}
        </p>
        <p className="mt-1 text-[0.58rem] tracking-[0.22em] text-muted uppercase sm:text-[0.62rem]">
          {showroomCopy.experience}
        </p>
      </div>

      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8">
        <p className="font-display text-lg tracking-[0.16em] sm:text-xl md:text-2xl">
          {showroomCopy.vehicleName}
        </p>
        <p className="mt-2 text-[0.58rem] tracking-[0.28em] text-accent uppercase">
          {showroomCopy.collection}
        </p>
      </div>

      <div className="absolute right-4 bottom-4 flex items-center gap-2 sm:right-6 sm:bottom-6 md:right-8 md:bottom-8">
        <p className="text-[0.58rem] tracking-[0.26em] text-muted uppercase">
          <span className="sm:hidden">{showroomCopy.hintMobile}</span>
          <span className="hidden sm:inline">{showroomCopy.hintDesktop}</span>
        </p>
        <span aria-hidden="true" className="text-accent">
          ↗
        </span>
      </div>
    </div>
  );
}
