import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import React from "react";
const questions = [
  {
    _id: "1",
    title: "How to learn javascript?",
    content: "I want to learn next.js so bad!",
    tags: [
      { _id: "1", name: "Next.js" },
      { _id: "2", name: "Redux" },
    ],
    author: {
      _id: "1",
      name: "Charles",
      image:
        "https://i.pinimg.com/736x/92/f6/35/92f635b7fa4cd1d6632c4990856df66c.jpg",
    },
    upvotes: 10,
    downvotes: 0,
    answers: 5,
    views: 100,
    createdAt: new Date(),
  },
  {
    _id: "2",
    title: "How to learn Python!?",
    content: "I want to learn Python after JS!",
    tags: [
      { _id: "1", name: "Next.js" },
      { _id: "2", name: "Redux" },
    ],
    author: {
      _id: "1",
      name: "Charles",
      image:
        "https://i.pinimg.com/736x/92/f6/35/92f635b7fa4cd1d6632c4990856df66c.jpg",
    },
    upvotes: 25,
    downvotes: 3,
    answers: 1,
    views: 123412,
    createdAt: new Date("2020-08-01"),
  },
];
interface SearchParams {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
const Home = async ({ searchParams }: SearchParams) => {
  const { query = "", filter } = await searchParams;

  const filteredQuestion = questions.filter((question) => {
    const matchesQuery = question.title
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter = filter
      ? question.tags.some(
          (tag) => tag.name.toLowerCase() === filter.toLowerCase()
        )
      : true;
    return matchesQuery && matchesFilter;
  });

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center mb-4">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Button
          className="primary-gradient min-h-[64px] px-4 py-3 text-light-900!"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section>
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search Questions..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />
      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredQuestion.map((question) => (
          <h1 key={question.title}>{question.title}</h1>
        ))}
      </div>
    </>
  );
};

export default Home;
