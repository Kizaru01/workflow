import UserAvatar from "../UserAvatar";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { formatPHTimeAgo } from "@/lib/utils";
import { GetAllAnswerParams } from "@/types";
import Preview from "../editor/Preview";

const AnswerCard = ({
  _id,
  author,
  content,
  createdAt,
}: GetAllAnswerParams) => {
  return (
    <article className="light-border border-b  bg-gray-900 p-4 rounded-xl">
      <span id={JSON.stringify(_id)} className="hash-span"></span>
      <div className="mb-5 flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={author._id}
            name={author.name}
            imageUrl={author.image}
            className="size-5 rounded-full object-cover max-sm:mt-2 max-sm:mr-1"
          />
          <Link
            href={ROUTES.PROFILE(author._id)}
            className="flex flex-col sm:flex-row sm:items-center "
          >
            <p className="body-semibold text-dark300_light700">
              {author.name ?? "Anonymous"}
            </p>
            <p className="small-regular text-light400_light500 ml-1 mt-1 line-clamp-1">
              {formatPHTimeAgo(createdAt)}
            </p>
          </Link>
        </div>
        <div className="flex justify-end">Votes</div>
      </div>
      <Preview content={content} />
    </article>
  );
};

export default AnswerCard;
