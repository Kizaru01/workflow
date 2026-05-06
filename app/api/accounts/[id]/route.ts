import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, RequestError } from "@/lib/http-errors";
import connectToDatabase from "@/lib/mongoose";
import { AccountSchema } from "@/lib/zod";
import { auth } from "@/auth";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AccountRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const AccountUpdateSchema = AccountSchema.partial();

const isValidObjectId = (id: string) => {
  return Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);
};

const getAccountId = async ({ params }: AccountRouteContext) => {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    throw new RequestError(400, "Invalid account id");
  }

  return id;
};

const parseJsonBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    throw new RequestError(400, "Invalid JSON request body");
  }
};

export async function GET(_request: Request, context: AccountRouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new RequestError(401, "Unauthorized");
    }

    const id = await getAccountId(context);

    await connectToDatabase();

    const account = await Account.findOne({
      _id: id,
      userId: session.user.id,
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
        message: "Account fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}

export async function PUT(request: Request, context: AccountRouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new RequestError(401, "Unauthorized");
    }

    const id = await getAccountId(context);
    const body = await parseJsonBody(request);
    const updateData = AccountUpdateSchema.parse(body);

    if (Object.keys(updateData).length === 0) {
      throw new RequestError(400, "At least one account field is required");
    }

    await connectToDatabase();

    // Check if account exists and belongs to user
    const existingAccount = await Account.findOne({
      _id: id,
      userId: session.user.id,
    })
      .select("_id provider providerAccountId")
      .lean()
      .exec();

    if (!existingAccount) {
      throw new NotFoundError("Account");
    }

    // If updating provider or providerAccountId, check for duplicates
    if (updateData.provider || updateData.providerAccountId) {
      const duplicateConditions = [];

      if (updateData.provider) {
        duplicateConditions.push({ provider: updateData.provider });
      }

      if (updateData.providerAccountId) {
        duplicateConditions.push({
          providerAccountId: updateData.providerAccountId,
        });
      }

      const duplicateAccount = await Account.findOne({
        _id: { $ne: id },
        userId: session.user.id,
        $or: duplicateConditions,
      })
        .select("_id")
        .lean()
        .exec();

      if (duplicateAccount) {
        throw new RequestError(409, "Account with this provider already exists");
      }
    }

    const updatedAccount = await Account.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    return NextResponse.json(
      {
        success: true,
        data: updatedAccount,
        message: "Account updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}

export async function DELETE(_request: Request, context: AccountRouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new RequestError(401, "Unauthorized");
    }

    const id = await getAccountId(context);

    await connectToDatabase();

    const deletedAccount = await Account.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })
      .select("_id")
      .lean()
      .exec();

    if (!deletedAccount) {
      throw new NotFoundError("Account");
    }

    return NextResponse.json(
      {
        success: true,
        data: { id },
        message: "Account deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}