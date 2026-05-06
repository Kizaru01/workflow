import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { RequestError } from "@/lib/http-errors";
import connectToDatabase from "@/lib/mongoose";
import { AccountSchema } from "@/lib/zod";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const parseJsonBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    throw new RequestError(400, "Invalid JSON request body");
  }
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new RequestError(401, "Unauthorized");
    }

    await connectToDatabase();

    const accounts = await Account.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json(
      {
        success: true,
        data: accounts,
        message: "Accounts fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new RequestError(401, "Unauthorized");
    }

    const body = await parseJsonBody(request);
    const accountData = AccountSchema.parse(body);

    await connectToDatabase();

    // Check for existing account with same provider and providerAccountId
    const existingAccount = await Account.findOne({
      userId: session.user.id,
      provider: accountData.provider,
      providerAccountId: accountData.providerAccountId,
    })
      .select("_id")
      .lean()
      .exec();

    if (existingAccount) {
      throw new RequestError(409, "Account already exists for this provider");
    }

    const account = await Account.create({
      ...accountData,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: account,
        message: "Account created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}