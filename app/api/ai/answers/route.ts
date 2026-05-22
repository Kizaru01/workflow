import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { AIAnswerSchema } from "@/lib/zod";
import { APIErrorResponse } from "@/types";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question, content } = await req.json();

  try {
    const validatedData = AIAnswerSchema.safeParse({ question, content });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const { text } = await generateText({
      model: openai("gpt-5.2"),
      prompt: `Generate a markdown-formatted response to the following question: ${question}. Base it on the provided content: ${content}`,
      system:
        "You are a heplful assistant that provides informative responses in markdown format. Use appropriate markdown syntax for headings, list, code blocks, and emphasis were neccesary. for code blocks, use short-form smaller case language identifiers (e.g., 'js' for JavasScript, 'py' for Python, 'ts' for Typescript, 'html' for HTML, 'css' or CSS, etc.).",
    });

    return NextResponse.json(
      {
        success: true,
        data: text,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
