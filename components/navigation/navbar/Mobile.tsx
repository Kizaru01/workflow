import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import NavLinks from "@/components/NavLinks";
export default function Mobile() {
  const user = false;
  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Image src="/icons/hamburger.svg" alt="menu" width={36} height={36} />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="background-light900_dark200 border-none p-4 flex "
      >
        <SheetTitle>
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/images/site-logo.svg"
              width={23}
              height={23}
              alt="DevFlow"
            />
            <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 lg:hidden">
              Dev<span className="text-primary-500">Flow</span>
            </p>
          </Link>
        </SheetTitle>

        <div className="no-scrollbar flex h-[calc(100vh-80px)] flex-col justify-between overflow-y-auto">
          <SheetClose asChild>
            <section className="flex h-full flex-col gap-6 pt-16">
              <NavLinks isMobileNav={true} />
            </section>
          </SheetClose>
          <div className="flex flex-col gap-3">
            {user ? (
              <SheetClose asChild>
                <Link href={ROUTES.SIGN_IN}>
                  <Button className="small-medium btn-secondary min-h-10.25 w-full rounded-lg px-4 py-3 shadow-none">
                    <span className="primary-text-gradient">Logout</span>
                  </Button>
                </Link>
              </SheetClose>
            ) : (
              <SheetClose asChild>
                <Link href={ROUTES.SIGN_UP}>
                  <Button className="small-medium btn-secondary min-h-10.25 w-full rounded-lg px-4 py-3 shadow-none">
                    <span className="dark:text-white text-black font-normal">
                      Login
                    </span>
                  </Button>
                </Link>
              </SheetClose>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
