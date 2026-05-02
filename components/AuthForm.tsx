"use client";

import {
  Controller,
  DefaultValues,
  FieldValues,
  Path,
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
import { Button } from "./ui/button";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean }>;
  formType: "SignIn" | "SignUp";
}
const AuthForm = <T extends FieldValues>({
  formType,
  schema,
  onSubmit,
  defaultValues,
}: AuthFormProps<T>) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: standardSchemaResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async () => {};

  const buttonText = formType === "SignIn" ? "Sign In" : "Sign Up";

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="mt-10 space-y-6"
    >
      <FieldGroup>
        {Object.keys(defaultValues).map((field) => (
          <Controller
            key={field}
            name={field as Path<T>}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className="flex w-full flex-col gap-2.5"
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor={field.name}>
                  {field.name === "email"
                    ? "Email Address"
                    : field.name === "confirmPassword"
                      ? "Confirm Password"
                      : field.name.charAt(0).toUpperCase() +
                        field.name.slice(1)}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type={field.name === "password" ? "password" : "text"}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
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
