"use server";

import {
  ActionResponse,
  CreateJobParams,
  PaginatedSearchParams,
  ErrorResponse,
  JobsParams,
  GetJobIdParams,
} from "@/types";
import { CreateJobSchema, GetJobIdSchema, GetJobsSchema } from "../zod";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { Job } from "@/database";
import mongoose from "mongoose";

export async function createJob(
  params: CreateJobParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateJobSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const userId = validationResult.session?.user?.id;
  const jobData = validationResult.params!;

  try {
    const job = await Job.create({
      ...jobData,
      company: userId,
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(job)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getJobs(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ jobs: JobsParams[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetJobsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    page = 1,
    pageSize = 10,
    query = "",
    filter = "",
  } = validationResult.params!;

  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);
  const filterQuery: mongoose.QueryFilter<typeof Job> = {};

  let sortCriteria: Record<string, 1 | -1> = {
    createdAt: -1,
  };
  try {
    if (query) {
      filterQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ];
    }

    if (filter) {
      switch (filter) {
        case "fulltime":
          filterQuery.jobType = "fulltime";
          break;
        case "parttime":
          filterQuery.jobType = "parttime";
          break;
        case "contract":
          filterQuery.jobType = "contract";
          break;
        case "remote":
          filterQuery.workMode = "remote";
          break;
        case "onsite":
          filterQuery.workMode = "onsite";
          break;
        case "hybrid":
          filterQuery.workMode = "hybrid";
          break;
        case "entry":
          filterQuery.experienceLevel = "entry";
          break;
        case "mid":
          filterQuery.experienceLevel = "mid";
          break;
        case "senior":
          filterQuery.experienceLevel = "senior";
          break;
        case "viewed":
          sortCriteria = { views: -1 };
          break;
        case "popular":
          sortCriteria = { application: -1 };
          break;
        default:
          sortCriteria = { createdAt: -1 };
          break;
      }
    }
    const jobs = await Job.find(filterQuery)
      .populate("company", "name image")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalJobs = await Job.countDocuments(filterQuery);
    const isNext = totalJobs > skip + jobs.length;

    return {
      success: true,
      data: {
        jobs,
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getJobById(
  jobId: string
): Promise<ActionResponse<JobsParams>> {
  if (!jobId) {
    return {
      success: false,
      error: {
        message: "Job ID is required",
      },
    };
  }

  try {
    const job = await Job.findById(jobId)
      .populate("company", "name image")
      .lean();

    if (!job) {
      return {
        success: false,
        error: {
          message: "Job not found",
        },
      };
    }

    // Increment views
    await Job.findByIdAndUpdate(jobId, { $inc: { views: 1 } });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(job)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getJobId(
  params: GetJobIdParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: GetJobIdSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { jobId } = validationResult.params!;
  try {
    const jobs = await Job.findById(jobId).populate("company", "name image");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(jobs)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
