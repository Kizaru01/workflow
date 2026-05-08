"use server";

import { ZodError, ZodSchema } from "zod";
import { UnauthorizedError, ValidationError } from "../http-errors";
import { auth } from "@/auth";
import connectToDatabase from "../mongoose";
import { Session } from "next-auth";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

export default async function action<T>({
  params,
  schema,
  authorize,
}: ActionOptions<T>) {
  let validatedParams = params;

  if (schema && params) {
    try {
      validatedParams = schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>
        );
      } else {
        return new Error("Schema Validation Failed");
      }
    }
  }

  let session: Session | null = null;
  if (authorize) {
    session = await auth();

    if (!session) {
      return new UnauthorizedError();
    }
  }

  await connectToDatabase();

  return { params: validatedParams, session };
}
