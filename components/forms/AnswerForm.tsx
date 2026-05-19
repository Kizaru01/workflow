"use client";

import { useForm, Controller } from "react-hook-form";
import z from "zod";
import { FieldGroup, Field, FieldError } from "../ui/field";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { AnswerSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import Image from "next/image";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

const AnswerForm = () => {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAISubmitting, setIsAISubmitting] = useState(false);
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (values: z.infer<typeof AnswerSchema>) => {
    console.log(values);
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          type="submit"
          className="btn light-border-2 gap-2 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500 "
          disabled={isAISubmitting}
        >
          {isAISubmitting ? (
            <>
              <ReloadIcon className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image
                src="/icons/star.svg"
                alt="Generate AI Answer"
                width={12}
                height={12}
                className="object-contain"
              />
              Generate AI Answer
            </>
          )}
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-6">
        <FieldGroup>
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className="flex w-full flex-col gap-3 "
                data-invalid={fieldState.invalid}
              >
                <Editor
                  value={field.value}
                  editorRef={editorRef}
                  fieldChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex justify-end">
          <Button type="submit" className="primary-gradient w-fit">
            {isSubmitting ? (
              <>
                <ReloadIcon className="mr-2 size-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Answer"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default AnswerForm;
