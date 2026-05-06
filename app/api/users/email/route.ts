import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { RequestError, NotFoundError } from "@/lib/http-errors";
import { z } from "zod";

const EmailSchema = z.object({
  email: z.email("Invalid email format"),
});

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const result = EmailSchema.safeParse(body);

    if (!result.success) {
      throw new RequestError(400, "Invalid email");
    }

    const { email } = result.data;

    const user = await User.findOne({ email }).lean().exec();

    if (!user) {
      throw new NotFoundError("User");
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "User found successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api");
  }
}
