import connectToDatabase from "@/lib/mongoose";
import mongoose from "mongoose";

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await connectToDatabase();

  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    const validateD;
  } catch (error) {}
}
