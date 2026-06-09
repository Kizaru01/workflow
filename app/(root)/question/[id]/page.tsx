import AllAnswers from "@/components/answers/AllAnswers";
import TagCard from "@/components/cards/TagCard";
import Preview from "@/components/editor/Preview";
import AnswerForm from "@/components/forms/AnswerForm";
import Metric from "@/components/Metric";
import Pagination from "@/components/Pagination";
import SaveQuestion from "@/components/questions/SaveQuestion";
import UserAvatar from "@/components/UserAvatar";
import Votes from "@/components/votes/Votes";

import { ROUTES } from "@/constants/routes";
import { hasSavedQuestion } from "@/lib/actions/collection.action";
import { hasVoted } from "@/lib/actions/vote.action";
import { getAnswer } from "@/lib/queries/answer.query";
import {
  getQuestion,
  incrementQuestionViews,
} from "@/lib/queries/question.query";
import { formatNumber, formatPHTimeAgo } from "@/lib/utils";
import { RoutesParams, Tags } from "@/types";

import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { Suspense } from "react";
const QuestionDetailsPage = async ({ params, searchParams }: RoutesParams) => {
  const { page, pageSize, filter } = await searchParams;
  const { id } = await params;

  const {
    success,
    data: question,
    error: questionError,
    status: questionStatus,
  } = await getQuestion({ questionId: id });

  if (!success || !question) {
    if (questionStatus === 400 || questionStatus === 404) {
      notFound();
    }

    throw new Error(questionError?.message ?? "Failed to fetch question");
  }

  after(async () => {
    await incrementQuestionViews({ questionId: id });
  });

  const {
    success: answerSuccess,
    data: dataSuccess,
    error: answerError,
  } = await getAnswer({
    questionId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter,
  });

  const hasVotedPromise = hasVoted({
    targetId: question._id,
    targetType: "question",
  });
  const hasSavedQuestionPromise = hasSavedQuestion({
    questionId: question._id,
  });
  const { author, createdAt, answers, views, tags, title, content } = question;
  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-2">
            <UserAvatar
              id={author._id}
              name={author.name}
              imageUrl={author.image}
              className="size-[22px]"
              fallbackClassname="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>
          <div className="flex justify-end items-center gap-4">
            <Suspense fallback={<div> loading...</div>}>
              <Votes
                upvotes={question.upvotes}
                downvotes={question.downvotes}
                hasVotedPromise={hasVotedPromise}
                targetType="question"
                targetId={question._id}
              />
            </Suspense>
            <Suspense fallback={<div>loading...</div>}>
              <SaveQuestion
                questionId={question._id}
                hasSavedQuestionPromise={hasSavedQuestionPromise}
              />
            </Suspense>
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
          page={page}
          isNext={dataSuccess?.isNext || false}
          data={dataSuccess?.answers}
          success={answerSuccess}
          error={answerError}
          totalAnswers={dataSuccess?.totalAnswers || 0}
        />
      </section>
      <section className="my-6">
        <AnswerForm
          questionId={question._id}
          questionTitle={question.title}
          questionContent={question.content}
        />
      </section>
    </>
  );
};

export default QuestionDetailsPage;
