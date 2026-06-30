import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";

interface Props<T extends FieldValues> {
  name: Path<T>;
  label: string;
  form: UseFormReturn<T>;
  className?: string;
  placeholder?: string;
}

const ReusableControllerForm = <T extends FieldValues>({
  name,
  label,
  form,
  className,
  placeholder,
}: Props<T>) => {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field className="flex w-full flex-col gap-2.5">
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          {name === "description" ? (
            <textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              placeholder={placeholder}
              className={className}
            />
          ) : (
            <Input
              {...field}
              id={field.name}
              type="text"
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              placeholder={placeholder}
              className={className}
            />
          )}

          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : null}
        </Field>
      )}
    />
  );
};

export default ReusableControllerForm;
