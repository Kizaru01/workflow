import CommonFilter from "@/components/filters/CommonFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { JobFilters } from "@/constants/filter";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { getJobs } from "@/lib/actions/job.action";
import DataRenderer from "@/components/DataRenderer";
import JobCard from "@/components/cards/JobCard";
import Pagination from "@/components/Pagination";
import { RoutesParams } from "@/types";

const Jobs = async ({ searchParams }: RoutesParams) => {
  const { page = 1, pageSize = 10, query, filter } = await searchParams;
  const { data, success, error } = await getJobs({
    page: Number(page),
    pageSize: Number(pageSize),
    query,
    filter,
    sort: "recent",
  });
  const { jobs: jobsData, isNext } = data!;

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center mb-4">
        <h1 className="h1-bold text-dark100_light900">Find Jobs</h1>
        <Button
          className="primary-gradient min-h-16 px-4 py-3 text-light-900!"
          asChild
        >
          <Link href={ROUTES.CREATEJOB}>Post a job</Link>
        </Button>
      </section>

      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={ROUTES.JOBS}
          imgSrc="/icons/search.svg"
          placeholder="Search Jobs..."
          otherClasses="flex-1"
        />
        <CommonFilter
          filters={JobFilters}
          otherClasses="min-h-[56px] max-sm:min-h-[12px] sm:min-w-[170px]"
        />
      </section>

      <section className="mt-12">
        <DataRenderer
          success={success}
          error={error}
          data={jobsData}
          empty={{
            title: "No jobs posted yet",
            message:
              "Be the first to post an opportunity or check back soon as new jobs are added.",
          }}
          render={(jobs) => (
            <div className="flex flex-col gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
              <Pagination page={page} isNext={isNext} />
            </div>
          )}
        />
      </section>
    </>
  );
};

export default Jobs;
