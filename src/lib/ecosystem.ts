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
    name: "Wanderlust",
    href: "https://wanderlust.witus.online",
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
  {
    slug: "learn-witus",
    name: "Learn.WitUS",
    href: "https://learn.witus.online",
    status: "live",
  },
  {
    slug: "stream-witus",
    name: "Stream.WitUS",
    href: "https://stream.witus.online",
    status: "beta",
  },
  {
    slug: "centenarian-coach",
    name: "Centenarian Coach",
    href: "https://centenarian.coach.multiagent.witus.online",
    status: "beta",
  },
  {
    slug: "shop-witus",
    name: "Shop.WitUS",
    href: "https://shop.witus.online",
    status: "beta",
  },
  {
    slug: "witus-inbox",
    name: "WitUS Inbox",
    href: "https://inbox.witus.online",
    status: "live",
  },
  {
    slug: "witus-outbox",
    name: "WitUS Outbox",
    href: "https://outbox.witus.online",
    status: "live",
  },
  {
    slug: "witus-triage-agent",
    name: "Triage.Agent.WitUS",
    href: "https://triage.agent.witus.online",
    status: "beta",
  },
  {
    slug: "wanderlearn-field-reporter",
    name: "Wanderlearn Field Reporter",
    href: "https://wanderlearn.field.reporter.witus.online",
    status: "beta",
  },
];
