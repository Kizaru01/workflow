import { auth } from "@/auth";
import LeftSideBar from "@/components/LeftSideBar";
import Navbar from "@/components/navigation/navbar/Navbar";
import RightSideBar from "@/components/RightSideBar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="background-light850_dark100 relative">
      <Navbar user={session?.user} />
      <div className="flex">
        <LeftSideBar user={session?.user} />
        <main className="min-w-0 flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          <div className="min-w-0 mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <RightSideBar />
      </div>
    </div>
  );
}
