import AllAnswers from "@/components/answers/AllAnswers";
import TagCard from "@/components/cards/TagCard";
import Preview from "@/components/editor/Preview";
import AnswerForm from "@/components/forms/AnswerForm";
import Metric from "@/components/Metric";
import UserAvatar from "@/components/UserAvatar";

import { ROUTES } from "@/constants/routes";
import { getAnswer } from "@/lib/actions/answer.action";
import { getIncrementViews, getQuestion } from "@/lib/actions/question.action";
import { formatNumber, formatPHTimeAgo } from "@/lib/utils";
import { RoutesParams, Tags } from "@/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
const QuestionDetailsPage = async ({ params }: RoutesParams) => {
  const { id } = await params;

  const { success, data: question } = await getQuestion({ questionId: id });

  after(async () => {
    await getIncrementViews({ questionId: id });
  });

  const {
    success: answerSuccess,
    data: dataSuccess,
    error: answerError,
  } = await getAnswer({
    questionId: id,
    page: 1,
    pageSize: 10,
    filter: "latest",
  });

  if (!success || !question) return redirect("/404");
  const { author, createdAt, answers, views, tags, title, content } = question;
  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-2">
            <UserAvatar
              id={author._id}
              name={author.name}
              className="size-[22px]"
              fallbackClassname="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>
          <div className="flex justify-end">
            <p>Votes</p>
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-4 w-full">
          {title}
        </h2>
      </div>
      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${formatPHTimeAgo(createdAt)}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="clock icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: Tags) => (
          <TagCard
            key={tag._id}
            _id={tag._id as string}
            name={tag.name}
            compact
          />
        ))}
      </div>
      <section className="my-6">
        <AllAnswers
          data={dataSuccess?.answers}
          success={answerSuccess}
          error={answerError}
          totalAnswers={dataSuccess?.totalAnswers || 0}
        />
      </section>
      <section className="my-6">
        <AnswerForm questionId={question._id} />
      </section>
    </>
  );
};

export default QuestionDetailsPage;
