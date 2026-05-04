import { ROUTES } from "@/constants/routes";
import { Link } from "lucide-react";
import { title } from "process";
import React from "react";
import TagCard from "./cards/TagCard";

const RightSideBar = () => {
  return (
    <section className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-87.5 flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3>Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {/* {question.map((item) => {
            <Link
              key={item.id}
              href={ROUTES.PROFILE(item.id)}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">{title}</p>
              <Image src="/icons/chevron-right.svg" alt="chevron" width={20} height={20} className="invert-colors"/>
            </Link>;
          })} */}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {/* {tags.map(({{ _id, name, questions}}) => (
                <TagCard key={_id} _id={_id} name={name} questions={questions} showCount compact/>))} */}
        </div>
      </div>
    </section>
  );
};

export default RightSideBar;
