"use server";

import {
  ActionResponse,
  CreateQuestionParams,
  EditQuestionParams,
  ErrorResponse,
  QuestionProps,
} from "@/types";
import { AskQuestionSchema, EditQuestionSchema } from "../zod";
import action from "../handlers/action";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import Question, { IQuestionDoc } from "@/database/question.model";
import Tag, { ITagDoc } from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";
import { ForbiddenError, NotFoundError } from "../http-errors";

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<QuestionProps>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;

  const userId = validationResult?.session?.user?.id;
  const session = await mongoose.startSession();
  session.startTransaction();
  const escapeRegex = (value: string) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };
  try {
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session }
    );

    if (!question) {
      throw new Error("Failed to create question");
    }

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocuments = [];

    for (const tag of tags) {
      const safeTag = escapeRegex(tag);
      const existingTag = await Tag.findOneAndUpdate(
        {
          name: { $regex: new RegExp(`^${safeTag}$`, "i") },
        },
        { $setOnInsert: { name: tag.toLowerCase() }, $inc: { questions: 1 } },
        { upsert: true, new: true, session }
      );

      tagIds.push(existingTag._id);
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    await TagQuestion.insertMany(tagQuestionDocuments, { session });

    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: { $each: tagIds } } },
      { session }
    );

    await session.commitTransaction();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<IQuestionDoc>> {
  const validateResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validateResult instanceof Error) {
    return handleError(validateResult) as ErrorResponse;
  }

  const { title, tags, content, questionId } = validateResult.params!;
  const userId = validateResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate("tags");
    if (!question) throw new NotFoundError("Question");

    if (question.author.toString() !== userId) {
      throw new ForbiddenError("You are not allowed to edit this question");
    }

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    const existingTagNames = question.tags.map((tag: ITagDoc) =>
      tag.name.toLowerCase()
    );

    const tagsToAdd = tags.filter(
      (tag) => !existingTagNames.includes(tag.toLowerCase())
    );

    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) => !tags.includes(tag.name.toLowerCase())
    );

    const newTagDocuments = [];

    if (tagsToAdd.length) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );

        if (existingTag) {
          newTagDocuments.push({
            tag: existingTag._id,
            question: questionId,
          });

          question.tags.push(existingTag._id);
        }
      }
    }

    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

      for (const tag of tagsToRemove) {
        if (tag.questions <= 1) {
          await Tag.findByIdAndDelete(tag._id, { session });
        } else {
          await Tag.findByIdAndUpdate(
            tag._id,
            { $inc: { questions: -1 } },
            { session }
          );
        }
      }

      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: questionId },
        { session }
      );

      question.tags = question.tags.filter(
        (tag: ITagDoc) =>
          !tagIdsToRemove.some(
            (tags: string) => tags.toString() === tag._id.toString()
          )
      );
    }

    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session });
    }

    await question.save({ session });

    await session.commitTransaction();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
