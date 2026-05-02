import { ROUTES } from "@/constants/routes";
import { Badge } from "lucide-react";
import Link from "next/link";

interface Props {
  _id: string;
  name: string;
  questions: number;
  showCount?: boolean;
  compact?: boolean;
}
const TagCard = ({ _id, name, questions, showCount, compact }: Props) => {
  return (
    <Link href={ROUTES.TAGS(_id)}>
      <Badge className="background-light800_dark300 text-light400_light500 rounded-md border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
          <i>Icon</i>
          <span>{name}</span>
        </div>
      </Badge>
      {showCount && (
        <p className="small-medium text-dark500_light700">{questions}</p>
      )}
    </Link>
  );
};

export default TagCard;
