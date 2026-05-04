interface QuestionCardProps {
  question: Question;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  answers: number;
  views: number;
  createdAt: Date;
  tags: Tags[];
  author: Author;
}

interface Tags {
  _id: string;
  name: string;
}
interface Author {
  _id: string;
  name: string;
  image: string;
}
