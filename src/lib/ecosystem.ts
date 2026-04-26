export type EcosystemStatus = "live" | "beta" | "coming-soon";

export interface EcosystemProduct {
  slug: string;
  name: string;
  href: string;
  status: EcosystemStatus;
}

export const SITE_URL = "https://stories.wanderlearn.witus.online";
export const PARENT_URL = "https://witus.online";
export const PRODUCT_NAME = "Wanderlearn Stories";
export const PRODUCT_TAGLINE = "Step inside a story";
export const PARENT_TAGLINE = "Live Long. Work Free.";

export const ecosystemProducts: EcosystemProduct[] = [
  {
    slug: "witus",
    name: "WitUS",
    href: "https://witus.online",
    status: "live",
  },
  {
    slug: "centenarianos",
    name: "CentenarianOS",
    href: "https://centenarianos.com",
    status: "live",
  },
  {
    slug: "work-witus",
    name: "Work.WitUS",
    href: "https://work.witus.online",
    status: "live",
  },
  {
    slug: "wanderlearn",
    name: "Wanderlearn",
    href: "https://wanderlearn.witus.online",
    status: "beta",
  },
  {
    slug: "fly-witus",
    name: "Fly.WitUS",
    href: "https://fly.witus.online",
    status: "beta",
  },
  {
    slug: "flashlearnai",
    name: "FlashLearnAI",
    href: "https://flashlearnai.witus.online",
    status: "beta",
  },
  {
    slug: "tour-witus",
    name: "Tour Manager OS",
    href: "https://tour.witus.online",
    status: "beta",
  },
  {
    slug: "awesomewebstore",
    name: "AwesomeWebStore",
    href: "https://awesomewebstore.com",
    status: "live",
  },
];
