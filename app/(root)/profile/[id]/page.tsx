import { auth } from "@/auth";
import ProfileLink from "@/components/user/ProfileLink";
import UserAvatar from "@/components/UserAvatar";
import {
  getUser,
  getUserAnswer,
  getUserQuestion,
  getUserStats,
  getUserTopTags,
} from "@/lib/actions/user.action";
import { RoutesParams, Tags } from "@/types";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stats from "@/components/user/Stats";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_QUESTION, EMPTY_TAGS } from "@/constants/states";

import Pagination from "@/components/Pagination";
import AnswerCard from "@/components/cards/AnswerCard";
import TagCard from "@/components/cards/TagCard";

const ProfilePage = async ({ params, searchParams }: RoutesParams) => {
  const { page, pageSize } = await searchParams;
  const { id } = await params;

  if (!id) notFound();

  const isLoggedInUser = await auth();
  const { data, success, error } = await getUser({ userId: id });
  if (!success)
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="h1-bold text-dark100_light900">User not found</h1>
        <p className="paragraph-regular text-dark200_light800 max-w-md">
          {error?.message}
        </p>
      </div>
    );

  const { user } = data!;
  const { data: userStats } = await getUserStats({ userId: id });
  const {
    success: getUserSuccess,
    data: getUserData,
    error: getUserError,
  } = await getUserQuestion({
    userId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
  });
  const {
    success: userAnswerSuccess,
    data: userAnswerData,
    error: userAnswerError,
  } = await getUserAnswer({
    userId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
  });

  const {
    success: userTagSuccess,
    data: userTagData,
    error: userTagError,
  } = await getUserTopTags({
    userId: id,
  });

  const { tags } = userTagData!;
  const { answers, isNext: haveMoreAnswers } = userAnswerData!;
  const { questions, isNext: haveMoreQuestions } = getUserData!;
  const {
    _id,
    name,
    image,
    username,
    bio,
    portfolio,
    reputation,
    createdAt,
    location,
  } = user;
  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <UserAvatar
            id={_id}
            name={name}
            imageUrl={image}
            className="size-[140px] rounded-full object-cover"
            fallbackClassname="text-6xl font-bolder"
          />
          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{name}</h2>
            <p className="paragraph-regular text-dark200_light800">
              @{username}
            </p>
            <div className="mt-4 flex flex-wrap justify-start items-center gap-5">
              {portfolio && (
                <ProfileLink
                  imgUrl="/icons/link.svg"
                  href={portfolio}
                  title="Portfolio"
                />
              )}
              {location && (
                <ProfileLink imgUrl="/icons/location.svg" title="Portfolio" />
              )}

              <ProfileLink
                imgUrl="/icons/link.svg"
                title={dayjs(createdAt).format("MMMM YYYY")}
              />
            </div>

            {bio && (
              <p className="paragraph-regular text-dark400_light800 mt-8">
                {bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          {isLoggedInUser?.user?.id === id && (
            <Link href="/profile/edit">
              <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3 ">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </section>
      <Stats
        totalQuestions={userStats?.totalQuestions || 0}
        totalAnswers={userStats?.totalAnswers || 0}
        badges={userStats?.badges || { GOLD: 0, SILVER: 0, BRONZE: 0 }}
        reputationPoints={reputation || 0}
      />
      <section className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-2">
          <TabsList className="background-light700_dark400 min-h-[42px] p-1">
            <TabsTrigger value="top-posts" className="tab cursor-pointer">
              Top Posts
            </TabsTrigger>
            <TabsTrigger value="answers" className="tab cursor-pointer  ">
              Answers
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="top-posts"
            className="mt-5 flex w-full flex-col gap-6 "
          >
            <DataRenderer
              success={getUserSuccess}
              error={getUserError}
              data={questions}
              empty={EMPTY_QUESTION}
              render={(questions) => (
                <div className="flex w-full flex-col gap-6">
                  {questions.map((question) => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      showActionBtns={
                        isLoggedInUser?.user?.id === question.author._id
                      }
                    />
                  ))}
                </div>
              )}
            />

            <Pagination page={page} isNext={haveMoreQuestions} />
          </TabsContent>

          <TabsContent
            value="answers"
            className="mt-5 flex w-full flex-col gap-6 "
          >
            <DataRenderer
              success={userAnswerSuccess}
              error={userAnswerError}
              data={answers}
              empty={EMPTY_QUESTION}
              render={(answers) => (
                <div className="flex w-full flex-col gap-6">
                  {answers.map((answer) => (
                    <AnswerCard
                      key={answer._id}
                      {...answer}
                      isProfile={true}
                      showActionBtns={
                        isLoggedInUser?.user?.id === answer.author._id
                      }
                    />
                  ))}
                </div>
              )}
            />

            <Pagination page={page} isNext={haveMoreAnswers} />
          </TabsContent>
        </Tabs>
        <div className="flex w-full min-w-[250px] flex-1 flex-col max-lg:hidden">
          <h3 className="h3-bold text-dark200_light_900">Top Tags</h3>
          <div className="mt-7 flex flex-col gap-4">
            <DataRenderer
              success={userTagSuccess}
              error={userTagError}
              data={tags}
              empty={EMPTY_TAGS}
              render={(tags) => (
                <div className="flex w-full flex-col gap-4 mt-3">
                  {tags.map((tag: Tags) => (
                    <TagCard
                      key={tag._id}
                      _id={tag._id}
                      name={tag.name}
                      showCount
                      compact
                      questions={tag.count}
                    />
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfilePage;
