import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { ROUTES } from "@/constants/routes";
import { getQuestion } from "@/lib/queries/question.query";
import { RoutesParams } from "@/types";
import { notFound, redirect } from "next/navigation";

const EditQuestion = async ({ params }: RoutesParams) => {
  const { id } = await params;

  if (!id) return notFound();
  const session = await auth();

  if (!session) return redirect("/sign-in");

  const {
    data: question,
    success,
    error,
    status,
  } = await getQuestion({ questionId: id });

  if (!success || !question?.author) {
    if (status === 400 || status === 404) {
      notFound();
    }

    throw new Error(error?.message ?? "Failed to fetch question");
  }

  if (String(question.author._id) !== session.user?.id) {
    redirect(ROUTES.QUESTION(id));
  }
  return (
    <>
      <QuestionForm question={question} isEdit />
    </>
  );
};

export default EditQuestion;
