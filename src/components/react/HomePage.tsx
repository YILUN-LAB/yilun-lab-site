import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Capabilities } from "./Capabilities";
import { ManifestoSection } from "./ManifestoSection";
import { WorksSection } from "./WorksSection";
import { AboutSection } from "./AboutSection";
import { CollaborateSection } from "./CollaborateSection";
import { Footer } from "./Footer";
import type { WorkCardData } from "./WorkCard";

interface HomePageProps {
  projects: WorkCardData[];
}

export function HomePage({ projects }: HomePageProps) {
  return (
    <div>
      <Navbar mode="scroll" activePage="home" />
      <main>
        <Hero />
        <Capabilities />
        <ManifestoSection />
        <WorksSection projects={projects} />
        <AboutSection />
        <CollaborateSection />
      </main>
      <Footer />
    </div>
  );
}
