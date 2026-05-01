import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { AuroraBackground } from "./AuroraBackground";
import { LabSection } from "./LabSection";
import { WorksSection } from "./WorksSection";
import { AboutSection } from "./AboutSection";
import { CollaborateSection } from "./CollaborateSection";
import { Footer } from "./Footer";
import type { WorkCardData } from "./WorkCard";
import type { HighlightInput } from "@lib/data/highlights";

type ProjectInput = WorkCardData & Pick<HighlightInput, "cover" | "featured">;

interface HomePageProps {
  projects: ProjectInput[];
}

export function HomePage({ projects }: HomePageProps) {
  return (
    <div>
      <AuroraBackground />
      <Navbar mode="scroll" activePage="home" />
      <main>
        <Hero />
        <LabSection projects={projects} />
        <WorksSection projects={projects} />
        <AboutSection />
        <CollaborateSection />
      </main>
      <Footer />
    </div>
  );
}
