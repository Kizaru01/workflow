import { descriptions, techMap } from "@/constants/techmap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getIcon = (techname: string) => {
  const iconClass = techname.replace(/\./g, "").toLowerCase();

  return techMap[iconClass]
    ? `${techMap[iconClass]} colored`
    : "devicon-devicon-plain";
};
export const getTagDescription = (techname: string) => {
  const normalized = techname.replace(/\./g, "").toLowerCase();

  return (
    descriptions[normalized] ||
    "A technology commonly used in modern software development."
  );
};

export const formatPHTimeAgo = (createdAt: Date | string | number): string => {
  const date = new Date(createdAt);
  const now = new Date();
  const inputDate = new Date(date);

  const diffInSeconds = Math.floor(
    (now.getTime() - inputDate.getTime()) / 1000
  );

  if (diffInSeconds < 5) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} months ago`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} years ago`;
};
