import { z } from "zod";

/**
 * Asset path: either an absolute URL (https://...) or a rooted path
 * (/assets/...). MVP serves audio + images out of /public; post-MVP
 * the same fields can point at Cloudinary/R2 without a schema change.
 */
const AssetUrl = z
  .string()
  .min(1)
  .refine((s) => s.startsWith("/") || /^https?:\/\//i.test(s), {
    message:
      'must be an absolute URL ("https://...") or a rooted path ("/assets/...")',
  });

export const Standard = z.object({
  framework: z.literal("indiana-k"),
  code: z.string(),
  description: z.string(),
});

export const InteractionTier1 = z.object({
  tier: z.literal(1),
  trigger: z.literal("gaze"),
  dwellMs: z.number().int().min(1000).max(5000),
  audioUrl: AssetUrl,
  cardTitle: z.string(),
  cardBody: z.string(),
  cardImageUrl: AssetUrl.optional(),
});

export const InteractionTier2 = z.object({
  tier: z.literal(2),
  trigger: z.literal("click"),
  prompt: z.string(),
  answerType: z.enum(["multiple-choice", "fill-blank"]),
  choices: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  successAudioUrl: AssetUrl,
  failureAudioUrl: AssetUrl,
});

export const InteractionTier3 = z.object({
  tier: z.literal(3),
  trigger: z.literal("ui-panel"),
  panelId: z.string(),
  parameters: z.record(z.string(), z.unknown()),
});

export const Interaction = z.discriminatedUnion("tier", [
  InteractionTier1,
  InteractionTier2,
  InteractionTier3,
]);

export const Egg = z.object({
  eggId: z.string(),
  position: z.tuple([z.number(), z.number(), z.number()]),
  meshType: z.enum(["primitive-sphere", "primitive-cube", "glb"]),
  meshSrc: z.string().optional(),
  subject: z.enum(["math", "ela", "science", "social", "art"]),
  standards: z.array(Standard).min(1),
  interactions: z.array(Interaction).min(1),
});

export const Hub = z.object({
  hubId: z.string(),
  bookId: z.string(),
  chapterRange: z.string(),
  environmentModel: z.string(),
  skybox: z.string().optional(),
  ambientAudio: AssetUrl.optional(),
  narrationAudio: AssetUrl,
  textExcerpt: z.string(),
  eggs: z.array(Egg).min(1),
});

export const PublicDomainSource = z.object({
  title: z.string(),
  edition: z.string(),
  sourceUrl: z.string().url(),
});

export const BookMetadata = z.object({
  bookId: z.string(),
  title: z.string(),
  publicDomainSource: PublicDomainSource,
});

export const Curriculum = BookMetadata.extend({
  hubs: z.array(Hub).min(1),
});

export type Standard = z.infer<typeof Standard>;
export type Interaction = z.infer<typeof Interaction>;
export type Egg = z.infer<typeof Egg>;
export type Hub = z.infer<typeof Hub>;
export type BookMetadata = z.infer<typeof BookMetadata>;
export type Curriculum = z.infer<typeof Curriculum>;
