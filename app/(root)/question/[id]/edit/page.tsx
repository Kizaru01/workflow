import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { ROUTES } from "@/constants/routes";
import { getQuestion } from "@/lib/actions/question.action";
import { RoutesParams } from "@/types";
import { notFound, redirect } from "next/navigation";

const EditQuestion = async ({ params }: RoutesParams) => {
  const { id } = await params;
  if (!id) return notFound();
  const session = await auth();

  if (!session) return redirect("/sign-in");

  const { data: question, success } = await getQuestion({ questionId: id });

  if (!success || !question?.author) return notFound();

  if (String(question.author) !== session.user?.id)
    redirect(ROUTES.QUESTION(id));
  return (
    <>
      <QuestionForm question={question} isEdit />
    </>
  );
};

export default EditQuestion;
