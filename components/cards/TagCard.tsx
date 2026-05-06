"use client";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { X } from "lucide-react";
import { cn, getIcon } from "@/lib/utils";

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

  if (isButton) {
    return (
      <button
        type="button"
        className="w-fit cursor-pointer border-0 bg-transparent p-0 text-left"
        onClick={handleRemove}
        aria-label={`Remove ${name} tag`}
      >
        {content}
      </button>
    );
  }

  return <Link href={ROUTES.TAGS(_id)}>{content}</Link>;
};

export default TagCard;
