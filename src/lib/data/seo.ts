// Centralized SEO/structured-data constants. SITE_URL must match the `site`
// value in astro.config.mjs.
export const SITE_URL = "https://www.yilunlab.com";

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "YILUN LAB",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description:
    "A creative lighting lab shaping emotion, space, and future experiences through light.",
  founder: { "@id": `${SITE_URL}/about#person` },
  foundingDate: "2022",
  sameAs: ["https://www.instagram.com/yilunlab/"],
} as const;

export const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/about#person`,
  name: "Yilun Zhan",
  url: `${SITE_URL}/about`,
  jobTitle: "Lighting Artist · Lighting Designer",
  image: `${SITE_URL}/assets/images/founder/headshot.jpg`,
  description:
    "Lighting artist, lighting designer, and founder of YILUN LAB — a creative lighting lab shaping emotion, space, and future experiences through light.",
  sameAs: ["https://www.linkedin.com/in/yilun-zhan"],
  worksFor: { "@id": `${SITE_URL}/#organization` },
} as const;
