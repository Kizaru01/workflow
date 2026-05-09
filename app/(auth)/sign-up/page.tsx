"use client";

import AuthForm from "@/components/forms/AuthForm";
import { signUpWithCredentials } from "@/lib/actions/auth.action";
import { SignUpSchema } from "@/lib/zod";

const SignUp = () => {
  return (
    <AuthForm
      formType="SignUp"
      schema={SignUpSchema}
      defaultValues={{ name: "", username: "", email: "", password: "" }}
      onSubmit={signUpWithCredentials}
    />
  );
};

export default SignUp;
