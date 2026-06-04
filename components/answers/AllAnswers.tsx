import { ActionResponse, GetAllAnswerParams } from "@/types";
import DataRenderer from "../DataRenderer";
import { EMPTY_ANSWERS } from "@/constants/states";
import AnswerCard from "../cards/AnswerCard";
import CommonFilter from "../filters/CommonFilter";
import { AnswerFilters } from "@/constants/filter";
import Pagination from "../Pagination";

interface Props extends ActionResponse<GetAllAnswerParams[]> {
  totalAnswers: number;
  isNext?: boolean;
  page?: number | string | undefined;
}
const AllAnswers = ({
  data,
  success,
  error,
  totalAnswers,
  page,
  isNext,
}: Props) => {
  return (
    <div className="mt-11 ">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers} {totalAnswers > 1 ? "Answers" : "Answer"}
        </h3>

        {totalAnswers >= 1 && <CommonFilter filters={AnswerFilters} />}
      </div>
      <DataRenderer
        data={data}
        error={error}
        success={success}
        empty={EMPTY_ANSWERS}
        render={(answers) =>
          answers.map((answer) => <AnswerCard key={answer._id} {...answer} />)
        }
      />

      <Pagination page={page} isNext={isNext || false} />
    </div>
  );
};

export default AllAnswers;
