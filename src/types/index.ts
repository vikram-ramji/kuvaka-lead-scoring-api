import * as z from "zod";

export const Offer = z.object({
  name: z.string().min(1, "Name is required"),
  value_props: z.string().array(),
  ideal_use_cases: z.string().array(),
});

export type Offer = z.infer<typeof Offer>;

export const Lead = z.object({
  name: z.string(),
  role: z.string(),
  company: z.string(),
  industry: z.string(),
  location: z.string(),
  linkedin_bio: z.string(),
});

export type Lead = z.infer<typeof Lead>;

export const AiScoreResponse = z
  .object({
    name: z.string(),
    intent: z.enum(["High", "Medium", "Low"]),
    reasoning: z.string(),
  })
  .array();

export type AiScoreResponse = z.infer<typeof AiScoreResponse>;

export const Results = z
  .object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    intent: z.enum(["High", "Medium", "Low"]),
    score: z.number(),
    reasoning: z.string(),
  })
  .array();

export type Results = z.infer<typeof Results>;
