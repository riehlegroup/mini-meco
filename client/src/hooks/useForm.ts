import { useState, useCallback } from "react";

type ValidationResult = string | boolean;

type ValidationRule = {
  validate: (value: string | boolean) => ValidationResult;
};

type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule[];
};

type FormErrors<T> = {
  [K in keyof T]: string;
};

// Predefined validation rules
const rules = {
  required: (fieldName: string): ValidationRule => ({
    validate: (value: string | boolean) =>
      !value ? `${fieldName} is required` : "",
  }),

  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    validate: (value: string | boolean) =>
      typeof value === "string" && !pattern.test(value.toLowerCase())
        ? message
        : "",
  }),

  boolean: (fieldName: string): ValidationRule => ({
    validate: (value) =>
      typeof value !== "boolean" ? `${fieldName} must be a boolean` : "",
  }),
};

export const createCourseValidation = () => ({
  semester: [
    rules.required("Semester"),
    rules.pattern(
      /^(ws|winter|ss|summer)\s*(?:(\d{2}|\d{4})(?:\/(\d{2}))?)$/,
      "Use format: WS24, SS25, WS24/25, Winter 2024 or Summer 2025"
    ),
  ],
  courseName: [
    rules.required("Course name"),
    rules.pattern(
      /^[a-zA-Z0-9\s-]+$/,
      "Course name can only contain letters, numbers, spaces, and hyphens"
    ),
  ],
  studentsCanCreateProject: [rules.boolean("Students can create projects")],
});

export const createProjectValidation = () => ({
  projectName: [
    rules.required("projectName"),
    rules.pattern(
      /^[a-zA-Z0-9\s-]+$/,
      "Only letters, numbers, spaces and hyphens allowed"
    ),
  ],
});

export const useForm = <T>(
  initialValues: T,
  validationSchema: ValidationSchema<T>
) => {
  const [data, setData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({} as FormErrors<T>);

  const validateField = useCallback(
    (field: keyof T, value: string | boolean): string => {
      const fieldRules = validationSchema[field];
      if (!fieldRules) return "";

      for (const rule of fieldRules) {
        const error = rule.validate(value);
        if (error) return error as string;
      }

      return "";
    },
    [validationSchema]
  );

  const handleChanges = useCallback(
    (field: keyof T, value: string | boolean) => {
      setData((prevData) => ({ ...prevData, [field]: value }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: validateField(field, value),
      }));
    },
    [validateField]
  );

  const isValid = Object.values(errors).every((error) => !error);

  return {
    data,
    errors,
    isValid,
    handleChanges,
  };
};
