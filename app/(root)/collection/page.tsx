import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import HomeFilter from "@/components/filters/HomeFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import { CollectionFilters } from "@/constants/filter";
import { EMPTY_QUESTION } from "@/constants/states";
import { getSavedCollection } from "@/lib/actions/collection.action";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
const Collection = async ({ searchParams }: SearchParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getSavedCollection({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const { collection, isNext } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Question</h1>

      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center ">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search Questions..."
          otherClasses="flex-1"
        />
        <CommonFilter
          filters={CollectionFilters}
          otherClasses="min-h-[56px] max-sm:min-h-[12px] sm:min-w-[170px]"
        />
      </section>
      <HomeFilter />

      <DataRenderer
        success={success}
        error={error}
        data={collection}
        empty={EMPTY_QUESTION}
        render={(collections) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {collections.map((item) => (
              <QuestionCard key={item._id} question={item.question} />
            ))}
          </div>
        )}
      />
      <Pagination page={page} isNext={isNext || false} />
    </>
  );
};

export default Collection;
