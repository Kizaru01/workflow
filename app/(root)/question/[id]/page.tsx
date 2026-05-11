import { RoutesParams } from "@/types";
import React from "react";

const QuestionDetailsPage = async ({ params }: RoutesParams) => {
  const { id } = await params;
  return <div>DetailsPage : {id}</div>;
};

export default QuestionDetailsPage;
