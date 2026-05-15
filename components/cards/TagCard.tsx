"use client";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { X } from "lucide-react";
import { cn, getIcon, getTagDescription } from "@/lib/utils";

interface BaseProps {
  _id: string;
  name: string;
  questions?: number;
  showCount?: boolean;
  compact?: boolean;
}

type LinkProps = BaseProps & {
  isButton?: false;
  remove?: never;
  handleRemove?: never;
};

type ButtonProps = BaseProps & {
  isButton: true;
  remove?: boolean;
  handleRemove: () => void;
};

type Props = LinkProps | ButtonProps;

const TagCard = ({
  _id,
  name,
  questions,
  showCount,
  compact,
  isButton,
  remove,
  handleRemove,
}: Props) => {
  const iconClass = getIcon(name);
  const iconDescription = getTagDescription(name);
  const content = (
    <>
      <Badge
        className={cn(
          "background-light800_dark300 text-light400_light500 rounded-md border-none uppercase",
          compact ? "px-3 py-1.5" : "px-4 py-2"
        )}
      >
        <div className="flex-center space-x-2">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
          {remove && <X aria-hidden className="size-3" />}
        </div>
      </Badge>
      {showCount && (
        <p className="small-medium text-dark500_light700">{questions}</p>
      )}
    </>
  );

  if (compact) {
    return isButton ? (
      <button
        type="button"
        className="w-fit cursor-pointer border-0 bg-transparent p-0 text-left"
        onClick={handleRemove}
        aria-label={`Remove ${name} tag`}
      >
        {content}
      </button>
    ) : (
      <Link href={ROUTES.TAG(_id)} className="flex justify-between gap-2">
        {content}
      </Link>
    );
  }

  return (
    <Link href={ROUTES.TAG(_id)} className="shadow-light100_darknone">
      <article className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-[260px]">
        <div className="flex items-center justify-between gap-3">
          <div className="background-light800_dark400 w-fit rounded-sm px-5 py-1.5">
            <p className="paragraph-semibold text-dark300_light900">{name}</p>
          </div>
          <i className={cn(iconClass, "text-2xl")} />
        </div>
        <p className="small-regular text-dark500_light700 mt-5 line-clamp-3 w-full">
          {iconDescription}
        </p>
        <p className="small-medium text-dark400_light500 mt-3.5">
          <span className="body-semibold primary-text-gradient mr-2.5">
            {questions}+
          </span>
          Questions
        </p>
      </article>
    </Link>
  );
};

export default TagCard;
