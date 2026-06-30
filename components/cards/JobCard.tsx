import { ROUTES } from "@/constants/routes";
import { formatPHTimeAgo, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Metric from "../Metric";
import TagCard from "./TagCard";
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS } from "@/constants/job";
import { JobCardProps } from "@/types";

const getJobTypeLabel = (type: string) => {
  return JOB_TYPES.find((t) => t.value === type)?.label || type;
};

const getWorkModeLabel = (mode: string) => {
  return WORK_MODES.find((m) => m.value === mode)?.label || mode;
};

const getExperienceLevelLabel = (level: string) => {
  return EXPERIENCE_LEVELS.find((l) => l.value === level)?.label || level;
};

const JobCard = ({ job }: JobCardProps) => {
  const {
    _id,
    title,
    description,
    workLocation,
    salaryMin,
    salaryMax,
    jobType,
    workMode,
    experienceLevel,
    tags,
    views,
    applicants,
    company,
    createdAt,
  } = job;

  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {formatPHTimeAgo(createdAt)}
          </span>
          <Link href={ROUTES.JOBS_ID(_id)}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-2">
              {title}
            </h3>
          </Link>
          <p className="body-regular text-dark400_light700 mt-2 line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="small-medium background-light800_dark400 text-light400_light500 rounded-full px-3 py-1">
          {getJobTypeLabel(jobType)}
        </span>
        <span className="small-medium background-light800_dark400 text-light400_light500 rounded-full px-3 py-1">
          {getWorkModeLabel(workMode)}
        </span>
        <span className="small-medium background-light800_dark400 text-light400_light500 rounded-full px-3 py-1">
          {getExperienceLevelLabel(experienceLevel)}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <p className="small-regular text-dark400_light700">📍 {workLocation}</p>
        {salaryMin > 0 || salaryMax > 0 ? (
          <p className="small-regular text-dark400_light700">
            💰{" "}
            {salaryMin > 0 && salaryMax > 0
              ? `${formatCurrency(salaryMin)} - ${formatCurrency(salaryMax)}`
              : salaryMin > 0
                ? `From ${formatCurrency(salaryMin)}`
                : `Up to ${formatCurrency(salaryMax)}`}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap w-full gap-2">
        {tags.slice(0, 3).map((tag: string) => (
          <TagCard key={tag} _id={tag} name={tag} compact />
        ))}
        {tags.length > 3 && (
          <span className="small-medium text-dark400_light700">
            +{tags.length - 3} more
          </span>
        )}
      </div>

      <div className="items-center flex justify-between mt-6 w-full flex-wrap gap-4">
        <Metric
          imgUrl={company?.image}
          alt={company?.name}
          value={company?.name}
          title={`• posted ${formatPHTimeAgo(createdAt)}`}
          textStyles="flex items-center gap-3 justify-start text-dark400_light700"
          titleStyles="max-sm:hidden"
        />
        <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
          <Metric
            imgUrl="/icons/eye.svg"
            alt="views"
            value={views}
            title="Views"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/icons/message.svg"
            alt="applicants"
            value={applicants}
            title="Applicants"
            textStyles="small-medium text-dark400_light800"
          />
        </div>
      </div>
    </div>
  );
};

export default JobCard;
