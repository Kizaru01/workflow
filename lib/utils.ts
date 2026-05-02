import { techMap } from "@/constants/techmap";
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
