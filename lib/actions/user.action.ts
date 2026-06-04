"use server";

import {
  ActionResponse,
  ErrorResponse,
  getUserIdParams,
  PaginatedSearchParams,
  UserParams,
} from "@/types";
import { getUserIdSchema, PaginatedSearchSchema } from "../zod";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { Answer, Question, User } from "@/database";
import mongoose from "mongoose";
import { NotFoundError } from "../http-errors";

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ users: UserParams[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { query, filter, page = 1, pageSize = 10 } = validationResult.params!;
  const limit = Number(pageSize);
  const skip = Number(page - 1) * pageSize;
  const filterQuery: mongoose.QueryFilter<typeof User> = {};

  if (query) {
    filterQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  let sortCriteria = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { reputation: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalUsers = await User.countDocuments(filterQuery);

    const users = await User.find(filterQuery)
      .sort(sortCriteria)
      .limit(limit)
      .skip(skip);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: {
        users: JSON.parse(JSON.stringify(users)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
export async function getUserId(params: getUserIdParams): Promise<
  ActionResponse<{
    user: UserParams;
    totalQuestions: number;
    totalAnswers: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: getUserIdSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { userId } = validationResult.params!;

  try {
    const user = await User.findById(userId).lean();
    if (!user) throw new NotFoundError("User");

    const [totalQuestions, totalAnswers] = await Promise.all([
      Question.countDocuments({ author: userId }),
      Answer.countDocuments({ author: userId }),
    ]);

    return {
      success: true,
      data: {
        user,
        totalQuestions,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
