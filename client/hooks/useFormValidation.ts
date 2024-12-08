import { useCallback, useState } from "react";

type ValidationRules = {
  [key: string]: (value: string) => string | null;
};

export const useFormValidation = (
  initialState: { [key: string]: string },
  validationRules: ValidationRules
) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      if (isSubmitted && validationRules[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validationRules[name](value),
        }));
      }
    },
    [validationRules, isSubmitted]
  );

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string | null } = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const error = validationRules[key](values[key]);
      newErrors[key] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    setIsSubmitted(true);
    return isValid;
  }, [validationRules, values]);

  return { values, errors, handleChange, validateForm, isSubmitted };
};
