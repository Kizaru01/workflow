"use server";

import mongoose from "mongoose";

import { Interaction, User } from "@/database";
import { IInteractionDoc } from "@/database/interaction.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { CreateInteractionSchema } from "../zod";
import {
  CreateInteractionParams,
  ActionResponse,
  ErrorResponse,
  UpdateReputationParams,
} from "@/types";
import { calculateReputation } from "../reputation";

export async function createInteraction(
  params: CreateInteractionParams
): Promise<ActionResponse<IInteractionDoc>> {
  const validationResult = await action({
    params,
    schema: CreateInteractionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    action: actionType,
    actionId,
    actionTarget,
    authorId, // target user who owns the content (question/answer)
  } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingInteraction = await Interaction.exists({
      user: userId,
      action: actionType,
      actionId,
    }).session(session);

    if (existingInteraction) throw new Error("Interaction already exists");

    const [interaction] = await Interaction.create(
      [
        {
          user: userId,
          action: actionType,
          actionId,
          actionType: actionTarget,
        },
      ],
      { session }
    );

    // Todo: Update reputation for both the performer and the content author
    await updateReputation({
      interaction,
      session,
      performerId: userId!,
      authorId,
    });

    await session.commitTransaction();

    return {
      success: true,
      data: interaction.toObject(),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
async function updateReputation(params: UpdateReputationParams) {
  const { interaction, session, performerId, authorId } = params;
  const { action: interactionAction, actionType } = interaction;

  const { performer: performerPoints, author: authorPoints } =
    calculateReputation(interactionAction, actionType);

  if (performerId === authorId) {
    await User.findByIdAndUpdate(
      performerId,
      { $inc: { reputation: authorPoints } },
      { session }
    );

    return;
  }

  await User.bulkWrite(
    [
      {
        updateOne: {
          filter: { _id: performerId },
          update: { $inc: { reputation: performerPoints } },
        },
      },
      {
        updateOne: {
          filter: { _id: authorId },
          update: { $inc: { reputation: authorPoints } },
        },
      },
    ],
    { session }
  );
}
