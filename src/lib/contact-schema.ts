import { z } from "zod";
import { COLLAB_AREAS } from "./data/collab-areas";

const projectTypeOptions = [
  "Not sure yet",
  ...COLLAB_AREAS.map((a) => a.name),
] as const;

export const PROJECT_TYPE_OPTIONS = projectTypeOptions;

export const ContactFormSchema = z.object({
  name: z.string().trim().min(1, "Required").max(100, "Too long"),
  email: z.email("Enter a valid email").max(254, "Too long"),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (10+ characters)")
    .max(5000, "Too long"),
  projectType: z.enum(projectTypeOptions).optional(),
  venue: z.string().trim().max(200, "Too long").optional(),
  timeline: z.string().trim().max(100, "Too long").optional(),
  budgetNotes: z.string().trim().max(200, "Too long").optional(),
  company: z.string().max(0), // honeypot — must be empty
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;
