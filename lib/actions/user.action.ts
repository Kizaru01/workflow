"use server";

import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  UserParams,
} from "@/types";
import { PaginatedSearchSchema } from "../zod";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { User } from "@/database";
import mongoose from "mongoose";

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
