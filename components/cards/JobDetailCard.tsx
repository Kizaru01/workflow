import { formatPHTimeAgo, formatCurrency } from "@/lib/utils";
import TagCard from "./TagCard";
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS } from "@/constants/job";
import { JobCardProps } from "@/types";
import Image from "next/image";
import { Button } from "../ui/button";

const getJobTypeLabel = (type: string) => {
  return JOB_TYPES.find((t) => t.value === type)?.label || type;
};

const getWorkModeLabel = (mode: string) => {
  return WORK_MODES.find((m) => m.value === mode)?.label || mode;
};

const getExperienceLevelLabel = (level: string) => {
  return EXPERIENCE_LEVELS.find((l) => l.value === level)?.label || level;
};

const JobDetailCard = ({ job }: JobCardProps) => {
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
    <div className="w-full max-w-4xl mx-auto">
      <div className="card-wrapper rounded-xl p-8 sm:p-12 space-y-8">
        {/* Header Section */}
        <div className="border-b border-light-700 dark:border-dark-400 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm font-medium text-dark-400 dark:text-light-700 mb-2">
                Posted {formatPHTimeAgo(createdAt)}
              </p>
              <h1 className="h2-bold text-dark-200 dark:text-light-900 mb-4 leading-tight">
                {title}
              </h1>
              <p className="body-regular text-dark-400 dark:text-light-700 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Company Section */}
        {company && (
          <div className="flex items-center gap-4 border-b border-light-700 dark:border-dark-400 pb-8">
            {company.image && (
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-light-800 dark:bg-dark-400">
                <Image
                  src={company.image}
                  alt={company.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="small-regular text-dark-400 dark:text-light-700">
                Posted by
              </p>
              <h3 className="h3-semibold text-dark-200 dark:text-light-900">
                {company.name}
              </h3>
            </div>
          </div>
        )}

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-light-700 dark:border-dark-400 pb-8">
          <div className="space-y-3">
            <p className="small-semibold text-dark-400 dark:text-light-700 uppercase tracking-wide">
              Position Type
            </p>
            <div className="flex items-center gap-2">
              <span className="badge-medium background-light800_dark400 text-light400_light500 rounded-full px-4 py-2">
                {getJobTypeLabel(jobType)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="small-semibold text-dark-400 dark:text-light-700 uppercase tracking-wide">
              Work Mode
            </p>
            <div className="flex items-center gap-2">
              <span className="badge-medium background-light800_dark400 text-light400_light500 rounded-full px-4 py-2">
                {getWorkModeLabel(workMode)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="small-semibold text-dark-400 dark:text-light-700 uppercase tracking-wide">
              Experience Level
            </p>
            <div className="flex items-center gap-2">
              <span className="badge-medium background-light800_dark400 text-light400_light500 rounded-full px-4 py-2">
                {getExperienceLevelLabel(experienceLevel)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="small-semibold text-dark-400 dark:text-light-700 uppercase tracking-wide">
              Location
            </p>
            <p className="body-regular text-dark-200 dark:text-light-900 flex items-center gap-2">
              📍 {workLocation}
            </p>
          </div>
        </div>

        {/* Salary Section */}
        {(salaryMin > 0 || salaryMax > 0) && (
          <div className="bg-light-800 dark:bg-dark-400 rounded-lg p-6 border-b border-light-700 dark:border-dark-400">
            <p className="small-semibold text-dark-400 dark:text-light-700 uppercase tracking-wide mb-3">
              Salary Range
            </p>
            <p className="h3-semibold text-dark-200 dark:text-light-900">
              {salaryMin > 0 && salaryMax > 0
                ? `${formatCurrency(salaryMin)} - ${formatCurrency(salaryMax)}`
                : salaryMin > 0
                  ? `From ${formatCurrency(salaryMin)}`
                  : `Up to ${formatCurrency(salaryMax)}`}
            </p>
          </div>
        )}

        {/* Required Skills */}
        {tags.length > 0 && (
          <div className="border-b border-light-700 dark:border-dark-400 pb-8">
            <p className="small-semibold text-dark-400 dark:text-light-700 uppercase tracking-wide mb-4">
              Required Skills
            </p>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag: string) => (
                <TagCard key={tag} _id={tag} name={tag} />
              ))}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
          <div className="text-center">
            <p className="small-regular text-dark-400 dark:text-light-700 mb-2">
              Views
            </p>
            <p className="h3-semibold text-dark-200 dark:text-light-900">
              {views}
            </p>
          </div>
          <div className="text-center">
            <p className="small-regular text-dark-400 dark:text-light-700 mb-2">
              Applicants
            </p>
            <p className="h3-semibold text-dark-200 dark:text-light-900">
              {applicants}
            </p>
          </div>
          <div className="text-center sm:text-left sm:col-span-1">
            <Button className="primary-gradient w-full sm:w-auto px-6 py-3 text-light-900">
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailCard;
