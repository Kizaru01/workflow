import { BADGE_CRITERIA } from "@/constants";
import { descriptions, techMap } from "@/constants/techmap";
import { BadgeCounts } from "@/types";
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

export const formatNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number.toString();
  }
};
export function assignBadges(params: {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}) {
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  const { criteria } = params;

  criteria.forEach((item) => {
    const { type, count } = item;
    const badgeLevels = BADGE_CRITERIA[type];

    Object.keys(badgeLevels).forEach((level) => {
      if (count >= badgeLevels[level as keyof typeof badgeLevels]) {
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    });
  });

  return badgeCounts;
}
