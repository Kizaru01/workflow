"use client";

import { useForm, Controller } from "react-hook-form";
import z from "zod";
import { FieldGroup, Field, FieldError } from "../ui/field";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { AnswerSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { createAnswer } from "@/lib/actions/answer.action";

import { toast } from "sonner";
const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

const AnswerForm = ({ questionId }: { questionId: string }) => {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [isAnswer, startAnsweringTransition] = useTransition();
  const [isAISubmitting, setIsAISubmitting] = useState(false);
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startAnsweringTransition(async () => {
      const result = await createAnswer({
        questionId,
        content: values.content,
      });

      if (result.success) {
        toast.success("Success", {
          description: "Your answer has been posted succesfully",
        });
      } else {
        toast.error("Failed", {
          description: "An error occured while posting your answer",
        });
      }
    });
  };

  return (
    <div className="background-light900_dark300 p-4 rounded-xl">
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
              <ReloadIcon className=" size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
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
                className="flex w-full flex-col gap-10 "
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
            {isAnswer ? (
              <>
                <ReloadIcon className="size-4 animate-spin" />
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
