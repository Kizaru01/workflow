import { NextResponse } from "next/server";
import { SignInSchema, SignUpSchema } from "./lib/zod";

interface QuestionCardProps {
  question: Question;
}

interface QuestionProps {
  _id: string;
  title: string;
  content: string;
  content: string;
  upvotes: number;
  downvotes: number;
  answers: number;
  views: number;
  createdAt: Date;
  tags: Tags[];
  author: Author;
}

interface Tags {
  _id: string;
  name: string;
}
interface Author {
  _id: string;
  name: string;
  image: string;
}

type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };

type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    email: string;
    name: string;
    image: string;
  };
}
type SignInValues = z.infer<typeof SignInSchema>;
type SignUpValues = z.infer<typeof SignUpSchema>;

interface AuthCredentials {
  name: string;
  username: string;
  password: string;
  email: string;
}
interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
}

interface RoutesParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface EditQuestionParams extends CreateQuestionParams {
  questionId: string;
}

interface GetQuestionParams {
  questionId: string;
}
interface PaginatedSearchParams {
  page?: number;
  pageSize: number;
  query?: string;
  filter?: string;
  sort?: string;
}

interface GegTagQuestionParams extends Omit<PaginatedSearchParams, "filter"> {
  tagId: string;
}
interface AnswerParams {
  content: string;
}
interface CreateAnswerParams {
  questionId: string;
  content: string;
}
interface GetAnswerParams extends PaginatedSearchParams {
  questionId: string;
}
interface GetAllAnswerParams {
  _id: string;
  author: Author;
  content: string;
  createdAt: Date;
}

interface CreateVoteParams {
  targetId: string;
  targetType: "question" | "answer";
  voteType: "upvote" | "downvote";
}
interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1;
}
type HasVotedParams = Pick<CreateVoteParams, "targetType" | "targetId">;
interface HasVotedResponse {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}
