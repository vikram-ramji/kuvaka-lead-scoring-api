import * as z from "zod";

export const Offer = z.object({
  name: z.string().min(1, "Name is required"),
  value_props: z.string().array(),
  ideal_use_cases: z.string().array(),
});

export type TOffer = z.infer<typeof Offer>;
