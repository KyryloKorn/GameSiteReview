import * as z from "zod";

// ============================================================
// Auth Form Schemas (Zod validation)
// ============================================================

export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(3, { error: "Username must be at least 3 characters." })
    .max(30, { error: "Username must be at most 30 characters." })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      error: "Username can only contain letters, numbers, hyphens, and underscores.",
    })
    .trim(),
  email: z.email({ error: "Please enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
    .regex(/[0-9]/, { error: "Password must contain at least one number." })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }).trim(),
  password: z.string().min(1, { error: "Password is required." }).trim(),
});

export const UpdateProfileSchema = z.object({
  displayName: z
    .string()
    .max(50, { error: "Display name must be at most 50 characters." })
    .optional(),
  bio: z
    .string()
    .max(500, { error: "Bio must be at most 500 characters." })
    .optional(),
  currentlyPlaying: z
    .string()
    .max(100, { error: "Must be at most 100 characters." })
    .optional(),
});

// ============================================================
// Review Schemas
// ============================================================

export const ReviewFormSchema = z.object({
  gameIgdbId: z.coerce.number().int().positive(),
  scoreOverall: z.coerce.number().int().min(1).max(10),
  scoreGameplay: z.coerce.number().int().min(1).max(10).optional().nullable(),
  scoreStory: z.coerce.number().int().min(1).max(10).optional().nullable(),
  scoreGraphics: z.coerce.number().int().min(1).max(10).optional().nullable(),
  scoreSound: z.coerce.number().int().min(1).max(10).optional().nullable(),
  scoreReplayability: z.coerce.number().int().min(1).max(10).optional().nullable(),
  content: z.string().max(5000, { error: "Review text must be at most 5000 characters." }).optional(),
  visibility: z.enum(["PRIVATE", "FRIENDS", "PUBLIC"]).default("PRIVATE"),
  containsSpoilers: z.coerce.boolean().default(false),
});

// ============================================================
// Tier List Schemas
// ============================================================

export const TierRowConfigSchema = z.object({
  label: z.string().min(1).max(20),
  color: z.string(),
});

export const TierListItemSchema = z.object({
  gameIgdbId: z.number().int().positive(),
  tierLabel: z.string(),
  position: z.number().int().nonnegative(),
});

export const TierListFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { error: "Title is required." }).max(100, { error: "Title must be at most 100 characters." }).trim(),
  description: z.string().max(1000, { error: "Description must be at most 1000 characters." }).optional(),
  visibility: z.enum(["PRIVATE", "FRIENDS", "PUBLIC"]).default("PUBLIC"),
  tiersConfig: z.array(TierRowConfigSchema),
  items: z.array(TierListItemSchema),
});

// ============================================================
// Types
// ============================================================

export type SignupFormState =
  | {
      errors?: {
        username?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type ReviewFormState =
  | {
      errors?: {
        gameIgdbId?: string[];
        scoreOverall?: string[];
        content?: string[];
        visibility?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type TierListFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        visibility?: string[];
      };
      message?: string;
      tierListId?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  username: string;
  expiresAt: Date;
};
