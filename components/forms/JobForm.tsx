"use client";

import { CreateJobSchema } from "@/lib/zod";
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
import { type KeyboardEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import TagCard from "../cards/TagCard";
import { createJob } from "@/lib/actions/job.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS } from "@/constants/job";
import ReusableControllerForm from "./ReusableControllerForm";

type JobFormValues = z.infer<typeof CreateJobSchema>;

const MAX_TAGS = 5;

const JobForm = () => {
  const router = useRouter();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: {
      title: "",
      description: "",
      workLocation: "",
      salaryMin: 0,
      salaryMax: 0,
      jobType: "fulltime",
      workMode: "remote",
      experienceLevel: "entry",
      tags: [],
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
        message: `Maximum ${MAX_TAGS} tags`,
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

  const handleCreateJob = async (data: JobFormValues) => {
    startTransition(async () => {
      const result = await createJob(data);

      if (result.success) {
        toast.success("Success", {
          description: "Job created successfully",
        });

        if (result.data) router.push(ROUTES.JOBS);
      } else {
        toast.error("Error", {
          description: result.error?.message ?? "Something went wrong",
        });
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleCreateJob)} className="space-y-8">
      <FieldGroup className="gap-8">
        <ReusableControllerForm
          name="title"
          label="Job Title"
          form={form}
          placeholder="e.g., Senior React Developer"
          className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
        />
        <ReusableControllerForm
          name="description"
          label="Description"
          form={form}
          placeholder="Job description, responsibilities, and requirements"
          className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-32 rounded-1.5 border p-3 resize-none"
        />

        <ReusableControllerForm
          name="workLocation"
          label="Work Location"
          form={form}
          className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
          placeholder="e.g., San Francisco, CA"
        />

        <div className="flex w-full gap-8">
          <Controller
            name="salaryMin"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="flex flex-1 flex-col gap-2.5">
                <FieldLabel htmlFor={field.name}>Minimum Salary</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  onChange={(e) => {
                    const value = e.target.value;

                    field.onChange(value === "" ? "" : Number(value));
                  }}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="salaryMax"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="flex flex-1 flex-col gap-2.5">
                <FieldLabel htmlFor={field.name}>Maximum Salary</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  onChange={(e) => {
                    const value = e.target.value;

                    field.onChange(value === "" ? "" : Number(value));
                  }}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
        </div>

        <div className="flex w-full gap-8">
          <Controller
            name="jobType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="flex flex-1 flex-col gap-2.5">
                <FieldLabel htmlFor={field.name}>Job Type</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="background-light900_dark300"
                    position="popper"
                  >
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="workMode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="flex flex-1 flex-col gap-2.5">
                <FieldLabel htmlFor={field.name}>Work Mode</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="background-light900_dark300"
                    position="popper"
                  >
                    {WORK_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
        </div>

        <Controller
          name="experienceLevel"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="flex w-full flex-col gap-2.5">
              <FieldLabel htmlFor={field.name}>Experience Level</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="background-light900_dark300"
                  position="popper"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
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
                  placeholder="react, nextjs, typescript"
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (tagInput.trim()) {
                      handleAddTag({
                        key: "Enter",
                        preventDefault: () => {},
                      } as KeyboardEvent<HTMLInputElement>);
                    }
                  }}
                  className="w-fit"
                >
                  + Add Tag
                </Button>
              </FieldContent>

              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  {` Maximum ${MAX_TAGS} tags. Press Enter or click "Add Tag" to
                  add.`}
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
                Creating
              </span>
            ) : (
              "Create Job"
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
};

export default JobForm;
