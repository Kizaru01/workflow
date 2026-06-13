export const REPUTATION = {
  upvote: {
    performer: 2,
    author: 10,
  },

  downvote: {
    performer: -1,
    author: -2,
  },

  post: {
    question: 5,
    answer: 10,
  },

  delete: {
    question: -5,
    answer: -10,
  },
} as const;
