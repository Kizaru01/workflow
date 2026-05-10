import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { redirect } from "next/navigation";

const AskQuestion = async () => {
  const session = await auth();

  if (!session) return redirect("/sign-in");
  return (
    <div>
      <QuestionForm />
    </div>
  );
};

export default AskQuestion;
