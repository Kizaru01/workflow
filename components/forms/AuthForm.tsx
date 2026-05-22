"use client";

import {
  Controller,
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import * as z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ZodType } from "zod";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ActionResponse } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ActionResponse>;
  formType: "SignIn" | "SignUp";
}
const AuthForm = <T extends FieldValues>({
  formType,
  schema,
  onSubmit,
  defaultValues,
}: AuthFormProps<T>) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = (await onSubmit(data)) as ActionResponse;

    if (result?.success) {
      toast.success("Success", {
        description:
          formType === "SignIn"
            ? "Signed in successfully"
            : "Signed up successfully",
      });

      router.push(ROUTES.HOME);
    } else {
      toast.error("Error", {
        description: `Error, ${result?.status}`,
      });
    }
  };

  const buttonText = formType === "SignIn" ? "Sign In" : "Sign Up";

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="mt-10 space-y-6"
    >
      <FieldGroup>
        {Object.keys(defaultValues).map((values) => (
          <Controller
            key={values}
            name={values as Path<T>}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className="flex w-full flex-col gap-3 "
                data-invalid={fieldState.invalid}
              >
                <FieldLabel>
                  {field.name === "email"
                    ? "Email Address"
                    : field.name === "password"
                      ? "Password"
                      : field.name.charAt(0).toUpperCase() +
                        field.name.slice(1)}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type={field.name === "password" ? "password" : "text"}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className="paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-2 border"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
        <Button
          disabled={submitting}
          className="primary-gradient paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter text-light-900!"
        >
          {submitting ? (
            buttonText === "Sign In" ? (
              <p className="flex items-center gap-2">
                <Spinner />
                Signing in....
              </p>
            ) : (
              <p className="flex items-center gap-2">
                <Spinner />
                Signing up....
              </p>
            )
          ) : (
            buttonText
          )}
        </Button>

        {formType === "SignIn" ? (
          <p className="text-center">
            Don&apos;t have an account?{""}
            <Link href={ROUTES.SIGN_UP} className="ml-2">
              <span className="text-orange-500">Sign up</span>
            </Link>
          </p>
        ) : (
          <p className="text-center">
            Already have an account?{""}
            <Link href={ROUTES.SIGN_IN} className="ml-2">
              <span className="text-orange-500">Sign in</span>
            </Link>
          </p>
        )}
      </FieldGroup>
    </form>
  );
};

export default AuthForm;
