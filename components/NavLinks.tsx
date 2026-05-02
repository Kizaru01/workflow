"use client";
import { sidebarLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SheetClose } from "./ui/sheet";
import React from "react";
const NavLinks = ({ isMobileNav = false }: { isMobileNav: boolean }) => {
  const pathname = usePathname();
  const userId = 1;
  return (
    <>
      {sidebarLinks.map((item) => {
        const active =
          item.route === "/"
            ? pathname === "/"
            : pathname.startsWith(item.route);
        if (item.route === "/profile") {
          if (userId) item.route = `${item.route}/${userId}`;
          else return null;
        }
        const LinkComponent = (
          <Link
            href={item.route}
            key={item.label}
            className={cn(
              active
                ? "primary-gradient  rounded-lg text-light-900 font-bold"
                : "text-dark300_light900",
              "flex py-4 px-6 w-full gap-2"
            )}
          >
            <Image
              src={item.imgURL}
              alt={item.label}
              width={20}
              height={20}
              className={cn({ "inverted-colors": !active })}
            />
            <p
              className={cn(
                active ? "base-bold" : "base-medium",
                !isMobileNav && "max-lg:hidden"
              )}
            >
              {item.label}
            </p>
          </Link>
        );
        return isMobileNav ? (
          <SheetClose asChild key={item.route}>
            {LinkComponent}
          </SheetClose>
        ) : (
          <React.Fragment key={item.route}>{LinkComponent}</React.Fragment>
        );
      })}
    </>
  );
};

export default NavLinks;
