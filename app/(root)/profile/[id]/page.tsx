import { auth } from "@/auth";
import ProfileLink from "@/components/user/ProfileLink";
import UserAvatar from "@/components/UserAvatar";
import { getUserId } from "@/lib/actions/user.action";
import { RoutesParams } from "@/types";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stats from "@/components/user/Stats";

const ProfilePage = async ({ params }: RoutesParams) => {
  const { id } = await params;

  if (!id) notFound();

  const isLoggedInUser = await auth();
  const { data } = await getUserId({ userId: id });

  const { user, totalQuestions, totalAnswers } = data!;

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
              <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </section>
      <Stats totalQuestions={totalQuestions} totalAnswers={totalAnswers} />
    </>
  );
};

export default ProfilePage;
