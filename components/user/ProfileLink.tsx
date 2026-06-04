import Link from "next/link";
import Image from "next/image";

interface Props {
  title: string;
  imgUrl?: string;
  href?: string;
}
const ProfileLink = ({ imgUrl, title, href }: Props) => {
  return (
    <div className="flex-center gap-1 ">
      <Image
        src={imgUrl || "/icons/link.svg"}
        alt={title}
        width={20}
        height={20}
      />

      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="paragraph-medium text-link-100"
        >
          {title}
        </Link>
      ) : (
        <p className="paragraph-medium text-dark400_light700">{title}</p>
      )}
    </div>
  );
};

export default ProfileLink;
