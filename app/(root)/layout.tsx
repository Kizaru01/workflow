import LeftSideBar from "@/components/LeftSideBar";
import Navbar from "@/components/navigation/navbar/Navbar";
import RightSideBar from "@/components/RightSideBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="background-light850_dark100 relative">
      <Navbar />
      <div className="flex">
        <LeftSideBar />
        <main className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
        <RightSideBar />
      </div>
    </main>
  );
}
