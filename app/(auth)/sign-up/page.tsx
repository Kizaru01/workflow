"use client";

import AuthForm from "@/components/forms/AuthForm";
import { SignUpSchema } from "@/lib/zod";

const SignUp = () => {
  return (
    <AuthForm
      formType="SignUp"
      schema={SignUpSchema}
      defaultValues={{ name: "", email: "", password: "" }}
      onSubmit={(data) => Promise.resolve({ success: true, data })}
    />
  );
};

export default SignUp;
