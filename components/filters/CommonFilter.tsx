"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formUrlQuery } from "@/lib/url";
interface Props {
  otherClasses?: string;
  containerClasses?: string;
  filters: {
    name: string;
    value: string;
  }[];
}
const CommonFilter = ({
  filters,
  otherClasses = "",
  containerClasses = "",
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsFilter = searchParams.get("filter");

  const handleFilterChange = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "filter",
      value,
    });
    router.push(newUrl);
  };

  return (
    <div className={cn("relative", containerClasses)}>
      <Select
        onValueChange={handleFilterChange}
        defaultValue={paramsFilter || ""}
      >
        <SelectTrigger
          className={cn(
            "body-regular no-focus light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5 w-full",
            otherClasses
          )}
          aria-label="Filter Questions"
        >
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a filter" />
          </div>
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            {filters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommonFilter;
