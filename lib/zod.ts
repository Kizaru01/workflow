import * as z from "zod";

// Shared reusable validators (DRY + consistency)
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
