export function Footer() {
  return (
    <footer className="relative bg-black px-8 md:px-16 lg:px-20 pt-16 pb-10 border-t border-white/10">
      <div className="font-heading italic text-white text-6xl md:text-7xl lg:text-[8rem] leading-[0.85] tracking-[-3px] mb-12">
        Light. Emotion. Future.
      </div>
      <div className="flex items-end justify-between flex-wrap gap-6 text-xs text-white/55 font-body uppercase tracking-[0.18em]">
        <div>
          <div className="text-white/85">YILUN LAB · est. 2022</div>
          <div>Yilun (Yilia) Zhan, Founder</div>
        </div>
        <div className="text-right">
          <div className="text-white/85">© 2026 — All rights reserved.</div>
          <div>Built with light.</div>
        </div>
      </div>
    </footer>
  );
}
