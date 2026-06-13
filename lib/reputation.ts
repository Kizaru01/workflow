import { REPUTATION } from "@/constants/reputation";

export function calculateReputation(action: string, actionType: string) {
  switch (action) {
    case "upvote":
      return REPUTATION.upvote;

    case "downvote":
      return REPUTATION.downvote;

    case "post":
      return {
        performer: 0,
        author:
          actionType === "question"
            ? REPUTATION.post.question
            : REPUTATION.post.answer,
      };

    case "delete":
      return {
        performer: 0,
        author:
          actionType === "question"
            ? REPUTATION.delete.question
            : REPUTATION.delete.answer,
      };

    default:
      return {
        performer: 0,
        author: 0,
      };
  }
}
