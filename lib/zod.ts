import * as z from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(5, "Name must be at least 5 characters.")
  .max(32, "Name must be at most 32 characters.")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces.");

const emailSchema = z
  .email("Invalid email format.")
  .trim()
  .toLowerCase()
  .min(1, "Email required")
  .max(254, "Email is too long."); // RFC standard

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character."
  );

// Schemas
export const SignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const SignUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const AskQuestionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(150, "Title must be less than 150 characters."),
  content: z
    .string()
    .min(1, "Content is required.")
    .max(5000, "Content is too long."),
  tags: z
    .array(z.string().trim().min(1, "Tag is required."))
    .min(1, "Tag is required.")
    .max(3, "Maximum 3 tags allowed.")
    .refine(
      (tags) =>
        new Set(tags.map((tag) => tag.toLowerCase())).size === tags.length,
      "Duplicate tags are not allowed."
    ),
});

export const UserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: nameSchema,
  email: emailSchema,
  bio: z.string(),
});
