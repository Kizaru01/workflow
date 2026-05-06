import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, RequestError } from "@/lib/http-errors";
import connectToDatabase from "@/lib/mongoose";
import { UserSchema } from "@/lib/zod";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type UserRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const UserUpdateSchema = UserSchema.partial();

const isValidObjectId = (id: string) => {
  return Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);
};

const getUserId = async ({ params }: UserRouteContext) => {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    throw new RequestError(400, "Invalid user id");
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

export async function GET(_request: Request, context: UserRouteContext) {
  try {
    const id = await getUserId(context);

    await connectToDatabase();

    const user = await User.findById(id).lean().exec();

    if (!user) {
      throw new NotFoundError("User");
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "User fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}

export async function PUT(request: Request, context: UserRouteContext) {
  try {
    const id = await getUserId(context);
    const body = await parseJsonBody(request);
    const updateData = UserUpdateSchema.parse(body);

    if (Object.keys(updateData).length === 0) {
      throw new RequestError(400, "At least one user field is required");
    }

    await connectToDatabase();

    if (updateData.email || updateData.username) {
      const duplicateConditions = [];

      if (updateData.email) {
        duplicateConditions.push({ email: updateData.email });
      }

      if (updateData.username) {
        duplicateConditions.push({ username: updateData.username });
      }

      const existingUser = await User.findOne({
        _id: { $ne: id },
        $or: duplicateConditions,
      })
        .select("email username")
        .lean()
        .exec();

      if (existingUser) {
        const duplicateField =
          existingUser.email === updateData.email ? "Email" : "Username";

        throw new RequestError(409, `${duplicateField} already exists`);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    if (!updatedUser) {
      throw new NotFoundError("User");
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}

export async function DELETE(_request: Request, context: UserRouteContext) {
  try {
    const id = await getUserId(context);

    await connectToDatabase();

    const deletedUser = await User.findByIdAndDelete(id)
      .select("_id")
      .lean()
      .exec();

    if (!deletedUser) {
      throw new NotFoundError("User");
    }

    return NextResponse.json(
      {
        success: true,
        data: { id },
        message: "User deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}
