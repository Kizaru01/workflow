import { NapiLocation } from "next/dist/build/swc/generated-native";
import { NextResponse } from "next/server";

interface QuestionCardProps {
  question: Question;
}

interface Question {
  _id: string;
  title: string;
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
type ErrorResponse = ActionResponse<undefined> & { success: true };

type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;
