import React from "react";
import NavLinks from "./NavLinks";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
const LeftSideBar = () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border sticky left-0 top-0 h-screen flex flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-66.5">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks isMobileNav={false} />
      </div>
      <div className="flex flex-col gap-3">
        <Button
          className="small-medium btn-secondary min-h-10.25 w-full rounded-lg px-4 py-3 shadow-none"
          asChild
        >
          <Link href={ROUTES.SIGN_IN}>
            <Image
              src="/icons/account.svg"
              width={20}
              height={20}
              alt="logout"
              className="invert-colors lg:hidden"
            />
            <span className="max-lg:hidden primary-text-gradient">Logout</span>
          </Link>
        </Button>
        <Button
          className="small-medium btn-secondary min-h-10.25 w-full rounded-lg px-4 py-3 shadow-none"
          asChild
        >
          <Link href={ROUTES.SIGN_UP}>
            <Image
              src="/icons/sign-up.svg"
              width={20}
              height={20}
              alt="login"
              className="invert-color lg:hidden"
            />
            <span className="max-lg:hidden dark:text-white text-black">
              Login
            </span>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default LeftSideBar;
