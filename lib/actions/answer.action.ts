"use server";

import Answer, { IAnswer } from "@/database/answer.model";
import {
  ActionResponse,
  CreateAnswerParams,
  ErrorResponse,
  GetDeleteAnswerParams,
} from "@/types";
import { AnswerServerSchema, GetDeleteAnswerSchema } from "../zod";
import action from "../handlers/action";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { Question, Vote } from "@/database";
import { NotFoundError } from "../http-errors";
import { ROUTES } from "@/constants/routes";
import { revalidatePath } from "next/cache";
export async function createAnswer(
  params: CreateAnswerParams
): Promise<ActionResponse<IAnswer>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId, content } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);

    if (!question) throw new NotFoundError("Question");

    const [newAnswer] = await Answer.create(
      [{ question: questionId, author: userId, content }],
      { session }
    );

    if (!newAnswer) throw new Error("Failed to create answer");

    question.answers += 1;
    await question.save({ session });

    await session.commitTransaction();
    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newAnswer)),
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
export async function userDeleteAnswer(
  params: GetDeleteAnswerParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: GetDeleteAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { answerId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const answer = await Answer.findById(answerId);

    if (!answer) throw new Error("Answer not found");

    if (answer.author.toString() !== userId)
      throw new Error("You're not allowed to delete this answer");

    // reduce the question answers count
    await Question.findByIdAndUpdate(
      answer.question,
      { $inc: { answers: -1 } },
      { new: true }
    );

    // delete votes associated with answer
    await Vote.deleteMany({ actionId: answerId, actionType: "answer" });

    // delete the answer
    await Answer.findByIdAndDelete(answerId);

    revalidatePath(`/profile/${userId}`);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
