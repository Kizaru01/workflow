import { model, models, Schema, Types } from "mongoose";
export interface JobParams {
  title: string;
  description: string;
  company: Types.ObjectId;
  workLocation: string;
  salaryMin: number;
  salaryMax: number;
  jobType: "fulltime" | "parttime" | "contract";
  workMode: "remote" | "onsite" | "hybrid";
  experienceLevel: "entry" | "mid" | "senior";
  tags: string[];
  views: number;
  applicants: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobParams extends JobParams, Document {}
const JobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    workLocation: {
      type: String,
      required: true,
    },

    salaryMin: Number,
    salaryMax: Number,

    jobType: {
      type: String,
      enum: ["fulltime", "parttime", "contract"],
      required: true,
    },

    workMode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior"],
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    views: {
      type: Number,
      default: 0,
    },

    applicants: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Job = models?.Job || model<JobParams>("Job", JobSchema);

export default Job;
