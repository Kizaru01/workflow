"use client";

import { AskQuestionSchema } from "@/lib/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { type KeyboardEvent, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import "@mdxeditor/editor/style.css";
import TagCard from "../cards/TagCard";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { QuestionProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";

type QuestionFormValues = z.infer<typeof AskQuestionSchema>;

interface QuestionFormProps {
  question?: QuestionProps;
  isEdit?: boolean;
}

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

const MAX_TAGS = 3;
const QuestionForm = ({ question, isEdit = false }: QuestionFormProps) => {
  const router = useRouter();
  const editor = useRef<MDXEditorMethods>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    question?.tags.map((tag) => tag.name) ?? []
  );
  const [isPending, startTransition] = useTransition();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: question?.title ?? "",
      content: question?.content ?? "",
      tags: question?.tags.map((tag) => tag.name) ?? [],
    },
  });

  const updatedTags = (newTags: string[]) => {
    setTags(newTags);
    form.setValue("tags", newTags, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const tag = tagInput.trim();

    if (!tag) return;

    const duplicateTag = tags.some(
      (currentTag) => currentTag.toLowerCase() === tag.toLowerCase()
    );

    if (duplicateTag) {
      form.setError("tags", {
        type: "manual",
        message: "Tag is already added",
      });
      return;
    }

    if (tags.length >= MAX_TAGS) {
      form.setError("tags", {
        type: "manual",
        message: "Maximum Tags 3",
      });
      return;
    }
    updatedTags([...tags, tag]);
    setTagInput("");
    form.clearErrors("tags");
  };

  const handleRemoveTag = (tag: string) => {
    updatedTags(tags.filter((currentTag) => currentTag !== tag));
  };

  const handleCreateQuestion = async (
    data: z.infer<typeof AskQuestionSchema>
  ) => {
    startTransition(async () => {
      if (isEdit && question) {
        const result = await editQuestion({
          questionId: question?._id,
          ...data,
        });

        if (result.success) {
          toast.success("Success", {
            description: "Question updated succesfully",
          });

          if (result.data) router.push(ROUTES.QUESTION(result.data._id));
        } else {
          toast.error("Error", {
            description: `Error ${result.error?.message} || "Something went wrong`,
          });
        }

        return;
      }
      const result = await createQuestion(data);

      if (result.success) {
        toast.success("Success", {
          description: "Question created succesfully",
        });

        if (result.data) router.push(ROUTES.QUESTION(result.data._id));
      } else {
        toast.error("Error", {
          description: `Error ${result.error?.message} || "Something went wrong`,
        });
      }
    });
  };
  return (
    <form
      onSubmit={form.handleSubmit(handleCreateQuestion)}
      className="space-y-8"
    >
      <FieldGroup className="gap-8">
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="flex w-full flex-col gap-2.5">
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder="Ask a clear, specific question"
                className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
              />

              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  Be specific and imagine you’re asking a question to another
                  person. What details would you provide? What parts did you
                  try? Include all the information someone would need to answer
                  your question.
                </FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="flex w-full flex-col gap-2.5">
              <FieldLabel htmlFor={field.name}>Content</FieldLabel>
              <Editor
                value={field.value}
                editorRef={editor}
                fieldChange={field.onChange}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  Include all the information someone would need to answer your
                  question. Describe what you’ve tried, what you expected to
                  happen, and what actually happened. If it’s a code-related
                  question, include the relevant code and error messages.
                </FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          name="tags"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="flex w-full flex-col gap-2.5">
              <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
              <FieldContent className="gap-3">
                <Input
                  id={field.name}
                  name={field.name}
                  ref={field.ref}
                  type="text"
                  value={tagInput}
                  onBlur={field.onBlur}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  placeholder="react, nextjs, tailwind"
                  className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <TagCard
                        key={tag}
                        _id={tag}
                        name={tag}
                        compact
                        remove
                        isButton
                        handleRemove={() => handleRemoveTag(tag)}
                      />
                    ))}
                  </div>
                )}
              </FieldContent>

              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  3 tags maximum. Tags help categorize your question and make it
                  easier for others to find and answer. Use relevant tags that
                  describe the technologies, topics, or issues related to your
                  question.
                </FieldDescription>
              )}
            </Field>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="primary-gradient paragraph-medium min-h-12 rounded-2 px-5 py-3 font-inter text-light-900"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Submitting
              </span>
            ) : (
              <>{isEdit ? "Edit" : "Ask a Question"}</>
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
};

export default QuestionForm;
