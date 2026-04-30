export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black px-8 pb-10 pt-16 md:px-16 lg:px-20">
      <div className="mb-12 font-heading text-6xl italic leading-[0.85] tracking-[-3px] text-white md:text-7xl lg:text-[8rem]">
        Light. Emotion. Future.
      </div>
      <div className="flex flex-wrap items-end justify-between gap-6 font-body text-xs uppercase tracking-[0.18em] text-white/55">
        <div>
          <div className="text-white/85">YILUN LAB · est. 2022</div>
          <div>Yilun Zhan, Founder</div>
        </div>
        <div className="text-right">
          <div className="text-white/85">© 2026 — All rights reserved.</div>
          <div>Built with light.</div>
        </div>
      </div>
    </footer>
  );
}
