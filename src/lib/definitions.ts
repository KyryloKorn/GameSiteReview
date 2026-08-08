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

export type SessionPayload = {
  userId: string;
  username: string;
  expiresAt: Date;
};
