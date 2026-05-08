import Account from "@/database/account.model";
import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import connectToDatabase from "@/lib/mongoose";
import { SignInWithOauth } from "@/lib/zod";
import { APIErrorResponse } from "@/types";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import slugify from "slugify";
export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await connectToDatabase();

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const validateData = SignInWithOauth.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validateData.success)
      throw new ValidationError(validateData.error.flatten().fieldErrors);

    const {
      provider: validProvider,
      providerAccountId: validProviderAccountId,
      user: validUser,
    } = validateData.data;
    const { name, username, email, image } = validUser;

    const slugifiedName = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let existingUser = await User.findOne({ email }).session(session);
    if (!existingUser) {
      [existingUser] = await User.create(
        [
          {
            name,
            username: slugifiedName,
            email,
            image,
          },
        ],
        { session }
      );
    } else {
      const updatedData: { name?: string; image?: string } = {};
      if (existingUser.name !== name) updatedData.name = name;
      if (existingUser.image !== image) updatedData.image = image;

      if (Object.keys(updatedData).length > 0) {
        await User.updateOne(
          { _id: existingUser._id },
          { $set: updatedData }
        ).session(session);
      }
    }
    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider: validProvider,
      providerAccountId: validProviderAccountId,
    }).session(session);
    if (!existingAccount)
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider: validProvider,
            providerAccountId: validProviderAccountId,
          },
        ],
        { session }
      );

    await session.commitTransaction();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return handleError(error, "api") as APIErrorResponse;
  } finally {
    await session.endSession();
  }
}
