import { NextResponse } from "next/server";
import { SignInSchema, SignUpSchema } from "./lib/zod";

interface QuestionId {
  questionId: string;
}
interface QuestionCardProps {
  question: Question;
  showActionBtns?: boolean;
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
  questions?: number;
  count?: number;
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
  pageSize?: number;
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
  upvotes: number;
  downvotes: number;
  isProfile: boolean;
  showActionBtns?: boolean;
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
interface UserParams {
  _id: string;
  name: string;
  username: string;
  email: string;
  location?: string;
  image?: string;
  bio?: string;
  portfolio?: string;
  reputation?: number;
  createdAt: Date;
}

interface CollectionBaseParams {
  questionId: string;
}
interface CollectionParams {
  _id: string;
  author: Author | string;
  question: QuestionProps;
}
interface getUserIdParams {
  userId: string;
}
interface BadgeCounts {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
}

interface GetUserQuestionsParams extends Omit<
  PaginatedSearchParams,
  "query" | "filter" | "sort"
> {
  userId: string;
}
interface GetUserAnswerParams extends PaginatedSearchParams {
  userId: string;
}
interface GetUserTopTagsParams {
  userId: string;
}
interface GetUserDeleteQuestionParams {
  questionId: string;
}
interface GetDeleteAnswerParams {
  answerId: string;
}
interface CreateInteractionParams {
  action:
    | "view"
    | "upvote"
    | "downvote"
    | "bookmark"
    | "post"
    | "edit"
    | "delete"
    | "search";
  actionId: string;
  authorId: string;
  actionTarget: "question" | "answer";
}
interface UpdateReputationParams {
  interaction: IInteractionDoc;
  session: mongoose.ClientSession;
  performerId: string;
  authorId: string;
}
