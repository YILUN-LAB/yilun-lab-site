// React 18 doesn't have `inert` in its DOM property registry yet, so it warns
// when `inert={true}` is used. Pass `inert=""` (the HTML boolean-attribute
// convention) to suppress the runtime warning. The experimental types declare
// inert as `boolean | undefined`; we use a narrow helper to accept `""` too.
const inertAttr = (active: boolean): Record<string, string> | undefined =>
  active ? { inert: "" } : undefined;

export function ConnectCard() {
  // Hardcoded until the flip state machine is wired up.
  const flipped = false;

  return (
    <div className="perspective-1200">
      <div
        className="preserve-3d relative h-[540px] w-[min(calc(100vw-48px),400px)] md:h-[580px] md:w-[440px] lg:h-[640px] lg:w-[480px]"
      >
        {/* FRONT FACE */}
        <div className="backface-hidden absolute inset-0" {...inertAttr(flipped)}>
          <button
            type="button"
            aria-label="Flip the card to view social links"
            className="liquid-glass-strong liquid-glass-tint flex h-full w-full flex-col items-center justify-center rounded-[1.5rem] p-10 text-center"
          >
            <img
              src="/assets/brand/logos/svg/yilun-lab-mark-white.svg"
              alt=""
              className="mb-6 h-16 w-16"
            />
            <div className="font-heading text-4xl italic leading-none tracking-[-1px] text-white">
              YILUN LAB
            </div>
            <p className="mt-4 font-body text-lg italic font-light text-white/85">
              Light. Emotion. Future.
            </p>
            <div className="my-8 h-px w-16 bg-white/20" />
            <p className="font-body text-sm italic font-light text-white/65">
              To you, from the studio.
            </p>
          </button>
        </div>

        {/* BACK FACE — placeholder; populated in a later task. */}
        <div
          className="backface-hidden absolute inset-0"
          style={{ transform: "rotateY(180deg)" }}
          {...inertAttr(!flipped)}
        />
      </div>
    </div>
  );
}
