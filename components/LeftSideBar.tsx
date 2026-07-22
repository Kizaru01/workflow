import NavLinks from "./NavLinks";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

interface Props {
  user?: {
    id?: string;
    name?: string | null;
    image?: string | null;
  };
}
const LeftSideBar = ({ user }: Props) => {
  const userId = user?.id;

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border sticky left-0 top-0 h-screen flex flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-65.5">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks userId={userId} />
      </div>
      <div className="flex flex-col gap-3">
        {userId ? (
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
            className="flex items-center justify-start"
          >
            <Button
              type="submit"
              className="base-medium w-fit bg-transparent! px-4 py-3"
            >
              <LogOut className=" text-black dark:text-white" />
              <span className="max-lg:hidden text-dark300_light900">
                Logout
              </span>
            </Button>
          </form>
        ) : (
          <>
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
                <span className="max-lg:hidden primary-text-gradient">
                  Login
                </span>
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
                  Sign Up
                </span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default LeftSideBar;
