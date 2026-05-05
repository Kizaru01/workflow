import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import connectToDatabase from "@/lib/mongoose";
import { UserSchema } from "@/lib/zod";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const validateData = UserSchema.safeParse(body);

    if (!validateData.success) {
      throw new ValidationError(validateData.error.flatten().fieldErrors);
    }
    const { email, username } = validateData.data;

    const existingEmail = await User.findOne({ email });
  } catch (error) {
    handleError(error, "api");
  }
}
