"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { userDeleteQuestion } from "@/lib/actions/user.action";
import { getDeleteAnswer } from "@/lib/actions/answer.action";
interface Props {
  type: "Question" | "Answer";
  itemId: string;
}
const EditDeleteAction = ({ itemId, type }: Props) => {
  const router = useRouter();
  const handleEdit = async () => {
    router.push(`/question/${itemId}/edit`);
  };
  const handleDelete = async () => {
    if (type === "Question") {
      await userDeleteQuestion({ questionId: itemId });

      toast.success("Question Deleted", {
        description: "Your question has been successfully deleted.",
      });

      return;
    } else if (type === "Answer") {
      await getDeleteAnswer({ answerId: itemId });
      toast.success("Delete", {
        description: "Answer deleted",
      });
    }
  };
  return (
    <div className="flex items-center justify-end gap-1 max-sm:w-full ">
      {type === "Question" ? (
        <Image
          src="/icons/edit.svg"
          alt="Edit"
          width={14}
          height={14}
          className="cursor-pointer object-contain"
          onClick={handleEdit}
        />
      ) : (
        <Image
          src="/icons/edit.svg"
          alt="Edit"
          width={14}
          height={14}
          className="cursor-pointer object-contain"
          onClick={handleEdit}
        />
      )}
      <AlertDialog>
        <AlertDialogTrigger className="cursor-pointer">
          <Image src="/icons/trash.svg" alt="Delete" height={14} width={14} />
        </AlertDialogTrigger>
        <AlertDialogContent className="background-light800_dark300 ">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your{" "}
              {type === "Question" ? "question" : "answer"} and remove it from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="border-primary-100 bg-primary-500! text-light-800! cursor-pointer"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditDeleteAction;
