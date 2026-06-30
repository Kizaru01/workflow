import { auth } from "@/auth";
import JobForm from "@/components/forms/JobForm";

import { redirect } from "next/navigation";

const CreateJob = async () => {
  const session = await auth();

  if (!session) return redirect("/sign-in");

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Create Job</h1>
      <div className="mt-8">
        <JobForm />
      </div>
    </div>
  );
};

export default CreateJob;
