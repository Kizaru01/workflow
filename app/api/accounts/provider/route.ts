import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import connectToDatabase from "@/lib/mongoose";
import { AccountSchema } from "@/lib/zod";
import { APIErrorResponse } from "@/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validateData = AccountSchema.pick({
      providerAccountId: true,
    }).safeParse(body);

    if (!validateData.success) {
      throw new ValidationError(validateData.error.flatten().fieldErrors);
    }

    await connectToDatabase();

    const { providerAccountId } = validateData.data;

    const account = await Account.findOne({
      providerAccountId,
    })
      .lean()
      .exec();

    if (!account) {
      throw new NotFoundError("Account");
    }

    return NextResponse.json(
      {
        success: true,
        data: account,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
