import Link from "next/link";
import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";
interface Props {
  imgUrl: string;
  alt: string;
  value: string | number;
  title: string;
  href?: string;
  textStyles?: string;
  isAuthor?: boolean;
  imgStyles?: string;
  titleStyles?: string;
}
const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  href,
  textStyles,
  isAuthor,
  imgStyles,
  titleStyles,
}: Props) => {
  const MetricContent = (
    <>
      <Image
        src={imgUrl}
        width={16}
        height={16}
        alt={alt}
        className={`rounded-full object-contain ${imgStyles}`}
      />

      <p className={`${textStyles} flex items-center gap-1`}>
        {value}

        {title ? (
          <span className={cn(`small-regular line-clamp-1`, titleStyles)}>
            {title}
          </span>
        ) : null}
      </p>
    </>
  );

  return href ? (
    <Link href={href} className="flex items-center  justify-center gap-1">
      {MetricContent}
    </Link>
  ) : (
    <div className="flex justify-center items-center gap-1">
      {MetricContent}
    </div>
  );
};

export default Metric;
