import { notFound } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { getJobById } from "@/lib/actions/job.action";
import { RoutesParams } from "@/types";
import JobDetailCard from "@/components/cards/JobDetailCard";

const JobDetailPage = async ({ params }: RoutesParams) => {
  const { id } = await params;

  const result = await getJobById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={ROUTES.JOBS}
          className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors"
        >
          <span>←</span>
          <span className="font-medium">Back to Jobs</span>
        </Link>
      </div>

      <JobDetailCard job={result.data} />
    </div>
  );
};

export default JobDetailPage;
