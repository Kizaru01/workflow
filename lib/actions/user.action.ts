"use server";

import {
  ActionResponse,
  ErrorResponse,
  GetAllAnswerParams,
  GetUserAnswerParams,
  GetUserDeleteQuestionParams,
  getUserIdParams,
  GetUserQuestionsParams,
  GetUserTopTagsParams,
  PaginatedSearchParams,
  QuestionProps,
  UserParams,
} from "@/types";
import {
  GetUserAnswerSchema,
  GetUserDeleteQuestionSchema,
  getUserIdSchema,
  GetUserQuestionSchema,
  GetUserTopTagsSchema,
  PaginatedSearchSchema,
} from "../zod";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  Answer,
  Question,
  Tag,
  TagQuestion,
  User,
  Vote,
  Collection,
} from "@/database";
import mongoose, { PipelineStage, Types } from "mongoose";
import { NotFoundError } from "../http-errors";
import { revalidatePath } from "next/cache";

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
export async function getUserQuestion(
  params: GetUserQuestionsParams
): Promise<ActionResponse<{ questions: QuestionProps[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetUserQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = validationResult.params!;
  const limit = Number(pageSize);
  const skip = Number(page - 1) * pageSize;

  try {
    const totalQuestions = await Question.countDocuments({
      author: userId,
    });
    const questions = await Question.find({ author: userId })
      .populate("author", "name image")
      .populate("tags", "name ")
      .sort({ createdAt: -1 })
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
export async function getUserAnswer(
  params: GetUserAnswerParams
): Promise<ActionResponse<{ answers: GetAllAnswerParams[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetUserAnswerSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = validationResult.params!;
  const limit = Number(pageSize);
  const skip = Number(page - 1) * pageSize;

  try {
    const totalAnswers = await Answer.countDocuments({
      author: userId,
    });
    const answers = await Answer.find({ author: userId })
      .populate("author", "name image")
      .sort({ createdAt: -1 })
      .limit(limit);

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
export async function getUserTopTags(
  params: GetUserTopTagsParams
): Promise<
  ActionResponse<{ tags: { _id: string; name: string; count: number }[] }>
> {
  const validationResult = await action({
    params,
    schema: GetUserTopTagsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const pipeline: PipelineStage[] = [
      { $match: { author: new Types.ObjectId(userId) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tagInfo",
        },
      },
      { $unwind: "$tagInfo" },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: "$tagInfo._id",
          name: "$tagInfo.name",
          count: 1,
        },
      },
    ];

    const tags = await Question.aggregate(pipeline);

    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
export async function userDeleteQuestion(
  params: GetUserDeleteQuestionParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: GetUserDeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  
  const userId = validationResult.session?.user?.id;
  const { questionId } = validationResult.params!;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const question = await Question.findById(questionId).session(session);
    if (!question) throw new Error("Question not found");

    if (question.author.toString() !== userId)
      throw new Error("You are not authorized to delete this question");

    // Delete references from collection
    await Collection.deleteMany({ question: questionId }).session(session);

    // Delete references from TagQuestion collection
    await TagQuestion.deleteMany({ question: questionId }).session(session);

    // For all tags of Question, find them and reduce their count
    if (question.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: question.tags } },
        { $inc: { questions: -1 } },
        { session }
      );
    }
    await Vote.deleteMany({
      actionId: questionId,
      actionType: "question",
    }).session(session);

    // Remove all answers and their votes of the question
    const answers = await Answer.find({ question: questionId }).session(
      session
    );

    if (answers.length > 0) {
      await Answer.deleteMany({ question: questionId }).session(session);

      await Vote.deleteMany({
        actionId: { $in: answers.map((answer) => answer.id) },
        actionType: "answer",
      }).session(session);
    }

    // Delete question
    await Question.findByIdAndDelete(questionId).session(session);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Revalidate to reflect immediate changes on UI
    revalidatePath(`/profile/${userId}`);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
