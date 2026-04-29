import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";

const SocialAuth = () => {
  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button className="background-dark400_light900 body-medium text-dark-200_light800 min-h-12 flex-1 rounded-2 px-4 py-3.5">
        <Image
          src="/icons/github.svg"
          alt="github"
          width={20}
          height={20}
          className="invert-color mr-2.5 object-contain"
        />
        <span>Login with Github</span>
      </Button>
      <Button className="background-dark400_light900 body-medium text-dark-200_light800 min-h-12 flex-1 rounded-2 px-4 py-3.5">
        <Image
          src="/icons/google.svg"
          alt="google"
          width={20}
          height={20}
          className="invert-color mr-2.5 object-contain"
        />
        <span>Login with Google</span>
      </Button>
    </div>
  );
};

export default SocialAuth;
