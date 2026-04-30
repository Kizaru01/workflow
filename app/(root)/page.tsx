import { auth } from "@/auth";
import React from "react";

const HomePage = async () => {
  const session = await auth();
  console.log(session);
  return <div>HomePage</div>;
};

export default HomePage;
