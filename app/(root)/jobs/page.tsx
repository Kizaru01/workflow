import CommonFilter from "@/components/filters/CommonFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { TagFilters } from "@/constants/filter";
import { ROUTES } from "@/constants/routes";
import React from "react";

const Jobs = () => {
  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Find Jobs</h1>
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={ROUTES.TAGS}
          imgSrc="/icons/search.svg"
          placeholder="Search Jobs..."
          otherClasses="flex-1"
        />
        <CommonFilter
          filters={TagFilters}
          otherClasses="min-h-[56px] max-sm:min-h-[12px] sm:min-w-[170px]"
        />
      </section>
    </>
  );
};

export default Jobs;
