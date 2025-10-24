import { useEffect } from "react";
import type { Course, Project } from "@/components/Administration/Course/types";
import {
  useForm,
  createCourseValidation,
  createProjectValidation,
} from "@/hooks/useForm";
import Button from "@/components/common/Button";
import { Message } from "./CourseMessage";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  error,
}: FormFieldProps) => (
  <div className="flex-col items-center justify-between">
    <h4>{label}: </h4>
    <input
      // className={`h-10 w-full border bg-gray-50 text-black ${
      //   error ? "border-red-500 ring-1 ring-red-500" : ""
      // }`}
      className={cn(
        "h-10 w-full bg-gray-50 text-black",
        error && "border-red-500 ring-1 ring-red-500"
      )}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {error && <div className="text-sm text-red-500">{error}</div>}
  </div>
);

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  checked,
  onChange,
}: CheckboxFieldProps) => (
  <div className="flex items-center space-x-3 text-black">
    <input
      className="mr-4 size-6 cursor-pointer appearance-none rounded-md border-2 border-gray-400 bg-white 
            transition-all checked:bg-blue-600 checked:ring-2 checked:ring-white"
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <label className="text-md">{label}</label>
  </div>
);

interface DateInputProps {
  label?: string;
  value: string;
  onChange: (date: Date) => void;
  className?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  className = "",
}: DateInputProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      {label && <label className="mr-2 text-gray-500">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(new Date(e.target.value))}
        className="rounded border border-gray-300 bg-white px-3 py-2 text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
};

interface CourseFormProps {
  type: "course" | "project" | "schedule";
  label: string[];
  data: Course | Project | undefined;
  message: Message | undefined;
  submitText?: string;
  onChange: (data: Course | Project) => void;
  onSubmit: () => Promise<void>;
  children?: React.ReactNode;
}

/**
 * CourseForm is a presentational component used for rendering and handling course or project forms.
 * It displays form fields and validates the data based on type.
 * It receives props from a parent component and sends the updated data back to the parent on change.
 */
export const CourseForm: React.FC<CourseFormProps> = ({
  type,
  label,
  data,
  message,
  onChange,
  onSubmit,
  submitText = "submit",
  children,
}: CourseFormProps) => {
  const isCourse = type === "course";

  // Use the correct type & validation schema based on form type<T>
  const {
    data: formData,
    errors,
    isValid,
    handleChanges,
  } = isCourse
    ? useForm<Course>(data as Course, createCourseValidation())
    : useForm<Project>(data as Project, createProjectValidation());

  // Notify parent of changes
  useEffect(() => {
    onChange(formData);
  }, [formData]);

  // Narrow the handleChanges using type assertions
  const courseHandleChanges = handleChanges as (
    key: keyof Course,
    value: string | boolean
  ) => void;
  const projectHandleChanges = handleChanges as (
    key: keyof Project,
    value: string
  ) => void;

  const handleSubmit = async () => {
    await onSubmit();
  };

  const getButtonStyles = (isValid: boolean, message?: Message) => {
    return cn(
      "w-fit rounded px-3 py-1 transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600",
      {
        // Disabled
        "bg-gray-400 text-gray-200 cursor-not-allowed": !isValid,
        // Success
        "bg-green-500": isValid && message?.type === "success",
        // Error
        "bg-red-500": isValid && message?.type === "error",
      }
    );
  };

  return (
    <div className="space-y-4">
      {isCourse ? (
        <>
          <FormField
            label={label[0]}
            value={(formData as Course).semester || ""}
            error={(errors as Record<keyof Course, string>).semester}
            onChange={(value) => courseHandleChanges("semester", value)}
          />
          <FormField
            label={label[1]}
            value={(formData as Course).courseName || ""}
            error={(errors as Record<keyof Course, string>).courseName}
            onChange={(value) => courseHandleChanges("courseName", value)}
          />
          <CheckboxField
            label={label[2]}
            checked={(formData as Course).studentsCanCreateProject || false}
            onChange={(value) =>
              courseHandleChanges("studentsCanCreateProject", value)
            }
          />
        </>
      ) : (
        <FormField
          label="Project Name"
          value={(formData as Project).projectName || ""}
          error={(errors as Record<keyof Project, string>).projectName}
          onChange={(value) => projectHandleChanges("projectName", value)}
        />
      )}
      {children}
      <div className="mt-2 flex flex-col items-end">
        <Button
          disabled={!isValid}
          className={getButtonStyles(isValid, message)}
          onClick={handleSubmit}
        >
          {submitText.toUpperCase()}
        </Button>
      </div>
    </div>
  );
};
