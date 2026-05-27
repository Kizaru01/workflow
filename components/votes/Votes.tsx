"use client";

import { formatNumber } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
interface Props {
  upvotes: number;
  hasupVoted: boolean;
  downVotes: number;
  hasdownVoted: boolean;
}

const Votes = ({ upvotes, hasupVoted, downVotes, hasdownVoted }: Props) => {
  const session = useSession();
  const userId = session.data?.user?.id;
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = (voteType: "upVote" | "downVote") => {
    if (!userId) {
      return toast.info("Please login to vote", {
        description: "Only logged-in users can vote",
      });
    }

    setIsLoading(true);

    try {
      const successMessage =
        voteType === "upVote"
          ? `Upvote ${!hasupVoted ? "added" : "removed"} successfully`
          : `Downvote ${!hasdownVoted ? "added" : "removed"} successfully`;

      toast.success(successMessage, {
        description: "Your vote has been recorded",
      });
    } catch (error) {
      return toast.info("Failed to Vote", {
        description:
          "An error occurred while voting. Please try again later." + error,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={hasupVoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Upvote"
          onClick={() => !isLoading && handleVote("upVote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1 ">
          <p className="subtle-medium text-dark400_light900 ">
            {formatNumber(upvotes)}
          </p>
        </div>
      </div>
      <div className="flex-center gap-1.5">
        <Image
          src={hasdownVoted ? "/icons/downvoted.svg" : "/icons/downvote.svg"}
          width={18}
          height={18}
          alt="downvote"
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Downvote"
          onClick={() => !isLoading && handleVote("downVote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1 ">
          <p className="subtle-medium text-dark400_light900 ">
            {formatNumber(downVotes)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Votes;
