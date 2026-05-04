import Link from "next/link";
import Image from "next/image";
import React from "react";
interface Props {
  imgUrl: string;
  alt: string;
  value: string | number;
  title: string;
  href?: string;
  textStyles?: string;
  isAuthor?: boolean;
  imgStyles?: string;
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
}: Props) => {
  const MetricContent = (
    <>
      <Image
        src={imgUrl}
        width={40}
        height={40}
        alt={alt}
        className={`rounded-full w-6 h-6 object-cover ${imgStyles}`}
      />

      <p className={`${textStyles} flex items-center justify-center gap-1`}>
        {value}
        {title ? (
          <span
            className={`small-regular line-clamp-1 ${isAuthor ? "max-sm:hidden" : ""}`}
          >
            {title}
          </span>
        ) : (
          "null"
        )}
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
