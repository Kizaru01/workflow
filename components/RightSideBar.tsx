import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import Image from "next/image";
import { HotQuestions } from "@/lib/actions/question.action";
import DataRenderer from "./DataRenderer";
import { EMPTY_QUESTION, EMPTY_TAGS } from "@/constants/states";
import { getHotTags } from "@/lib/actions/tag.action";
import TagCard from "./cards/TagCard";

const RightSideBar = async () => {
  const [
    { success, data: TopQuestions, error },
    { success: tagSuccess, data: dataTags, error: errorTags },
  ] = await Promise.all([HotQuestions(), getHotTags()]);
  return (
    <section className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-87.5 flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark-200_light900">Top Questions</h3>

        <DataRenderer
          success={success}
          data={TopQuestions}
          error={error}
          empty={EMPTY_QUESTION}
          render={(question) => (
            <div className="mt-7 flex w-full flex-col gap-[30px]">
              {question.map(({ _id, title }) => (
                <Link
                  key={_id}
                  href={ROUTES.QUESTION(title)}
                  className="flex cursor-pointer items-center justify-between gap-7"
                >
                  <p className="body-medium text-dark500_light700 line-clamp-2">
                    {title}
                    <span className="ml-0.5">?</span>
                  </p>
                  <Image
                    src="/icons/chevron-right.svg"
                    alt="chevron"
                    width={20}
                    height={20}
                    className="invert-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        />
      </div>
      <div className="mt-11">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <DataRenderer
          success={tagSuccess}
          error={errorTags}
          data={dataTags}
          empty={EMPTY_TAGS}
          render={(tags) => (
            <div className="mt-7 flex flex-col gap-4">
              {tags.map(({ _id, name, questions }) => (
                <TagCard
                  key={_id}
                  _id={_id}
                  name={name}
                  questions={questions}
                  showCount
                  compact
                />
              ))}
            </div>
          )}
        />
      </div>
    </section>
  );
};

export default RightSideBar;
