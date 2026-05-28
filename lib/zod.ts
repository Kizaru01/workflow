import * as z from "zod";

const objectIdSchema = (fieldName: string) =>
  z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, `Invalid ${fieldName}`);

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
  username: z.string().min(1, "Username is required"),
});

export const AskQuestionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(150, "Title must be less than 150 characters."),
  content: z
    .string()
    .min(1, "Content is required.")
    .max(10000, "Content is too long."),
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

export const AccountSchema = z.object({
  userId: objectIdSchema("user id"),
  name: nameSchema,
  image: z.string().url("Invalid image URL").optional(),
  password: passwordSchema.optional(),
  provider: z.string().trim().min(1, "Provider is required."),
  providerAccountId: z
    .string()
    .trim()
    .min(1, "Provider account ID is required."),
});

export const SignInWithOauth = z.object({
  provider: z.enum(["google", "github"]),
  providerAccountId: z.string().min(1, "Provider Account is Required."),
  user: z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: emailSchema,
    image: z.url("Invalid image URL").optional(),
  }),
});

export const EditQuestionSchema = AskQuestionSchema.extend({
  questionId: objectIdSchema("question id"),
});

export const GetQuestionSchema = z.object({
  questionId: objectIdSchema("question id"),
});
export const PaginatedSearchSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  query: z.string().optional(),
  filter: z.string().optional(),
  sort: z.string().optional(),
});
export const GetTagQuestionSchema = PaginatedSearchSchema.extend({
  tagId: objectIdSchema("tag id"),
});
export const AnswerSchema = z.object({
  content: z.string().min(50, "Please provide a meaningful answer "),
});

export const AnswerServerSchema = AnswerSchema.extend({
  questionId: objectIdSchema("question id"),
});
export const GetAnswerSchema = PaginatedSearchSchema.extend({
  questionId: objectIdSchema("question id"),
});
export const AIAnswerSchema = z.object({
  question: z
    .string()
    .min(5, "Question is Required.")
    .max(130, "Question cannot exceed 130 characters"),
  content: z
    .string()
    .min(1, "Answer has to have more than 100 characters")
    .optional(),
  userAnswer: z.string().optional(),
});
export const CreateVoteSchema = z.object({
  targetId: z.string().min(1, "Target Id is required"),
  targetType: z.enum(["question", "answer"], "Invalid target Type"),
  voteType: z.enum(["upvote", "downvote"], "Invalid Vote Type"),
});
export const UpdateVoteSchema = CreateVoteSchema.extend({
  change: z.number().min(-1).max(1),
});
export const HasVotedSchema = CreateVoteSchema.pick({
  targetId: true,
  targetType: true,
});
