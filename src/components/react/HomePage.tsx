import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { AuroraBackground } from "./AuroraBackground";
import { LabSection } from "./LabSection";
import { WorksSection } from "./WorksSection";
import { AboutSection } from "./AboutSection";
import { CollaborateSection } from "./CollaborateSection";
import { Footer } from "./Footer";
import { HeroPerformanceReadout } from "./HeroPerformanceReadout";
import { useEffect, useState } from "react";
import type { WorkCardData } from "./EditorialGrid";
import type { HighlightInput } from "@lib/data/highlights";

type ProjectInput = WorkCardData & Pick<HighlightInput, "cover" | "featured">;

interface HomePageProps {
  projects: ProjectInput[];
}

export function HomePage({ projects }: HomePageProps) {
  const [heroPreview, setHeroPreview] = useState(false);
  useEffect(() => {
    if (import.meta.env.DEV)
      setHeroPreview(new URLSearchParams(location.search).has("heroPreview"));
  }, []);
  const nonFeatured = projects.filter((p) => typeof p.featured !== "number");
  return (
    <div>
      <AuroraBackground occludedByHero />
      <Navbar mode="scroll" activePage="home" />
      <main>
        <Hero />
        <LabSection projects={projects} />
        <WorksSection projects={nonFeatured} />
        <AboutSection />
        <CollaborateSection />
      </main>
      <Footer />
      {import.meta.env.DEV && heroPreview && <HeroPerformanceReadout />}
    </div>
  );
}
