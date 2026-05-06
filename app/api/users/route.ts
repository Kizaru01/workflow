import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { RequestError } from "@/lib/http-errors";
import connectToDatabase from "@/lib/mongoose";
import { UserSchema } from "@/lib/zod";
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
    await connectToDatabase();

    const users = await User.find().sort({ createdAt: -1 }).lean().exec();

    return NextResponse.json(
      {
        success: true,
        data: users,
        message: "Users fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const userData = UserSchema.parse(body);

    await connectToDatabase();

    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    })
      .select("email username")
      .lean()
      .exec();

    if (existingUser) {
      const duplicateField =
        existingUser.email === userData.email ? "Email" : "Username";

      throw new RequestError(409, `${duplicateField} already exists`);
    }

    const user = await User.create(userData);

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "User created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}
