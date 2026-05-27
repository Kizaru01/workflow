import { ROUTES } from "@/constants/routes";
import { formatPHTimeAgo } from "@/lib/utils";
import Link from "next/link";
import Metric from "../Metric";
import TagCard from "./TagCard";
import { QuestionCardProps, Tags } from "@/types";

const QuestionCard = ({
  question: {
    _id,
    title,
    tags,
    author,
    createdAt,
    upvotes,
    answers,
    views,
    downvotes,
  },
}: QuestionCardProps) => {
  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row ">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {formatPHTimeAgo(createdAt)}
          </span>
          <Link href={ROUTES.QUESTION(_id)}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {title}
            </h3>
          </Link>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap w-full gap-3">
        {tags.map((tag: Tags) => (
          <TagCard key={tag._id} _id={tag._id} name={tag.name} compact />
        ))}
      </div>
      <div className="items-center flex justify-between mt-6 w-full flex-wrap gap-4">
        <Metric
          imgUrl={author?.image}
          alt={author?.name}
          value={author?.name}
          title={`• asked ${formatPHTimeAgo(createdAt)}`}
          href={ROUTES.PROFILE(author?._id)}
          textStyles="flex items-center gap-4 justify-start "
          isAuthor
          titleStyles="max-sm:hidden"
        />
        <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
          <Metric
            imgUrl="/icons/like.svg"
            alt="like"
            value={upvotes}
            title="Votes"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/icons/message.svg"
            alt="answers"
            value={answers}
            title="Answers"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/icons/eye.svg"
            alt="views"
            value={views}
            title="Views"
            textStyles="small-medium text-dark400_light800"
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
