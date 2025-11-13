import { useState, useMemo, FormEvent } from "react";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
}

interface FormTouched {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  confirmEmail: boolean;
}

export function useNewMemberForm() {
  const [formState, setFormState] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
  });

  const [formTouched, setFormTouched] = useState<FormTouched>({
    firstName: false,
    lastName: false,
    email: false,
    confirmEmail: false,
  });

  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (field: keyof FormState, value: string) => {
    let error = "";

    switch (field) {
      case "firstName":
        if (!value.trim()) {
          error = "This field cannot be left blank.";
        }
        break;
      case "lastName":
        if (!value.trim()) {
          error = "This field cannot be left blank.";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "This field cannot be left blank.";
        } else if (!validateEmail(value)) {
          error = "Enter a valid email address.";
        }
        break;
      case "confirmEmail":
        if (!value.trim()) {
          error = "This field cannot be left blank.";
        } else if (
          value.trim().toLowerCase() !== formState.email.trim().toLowerCase()
        ) {
          error = "The emails do not match.";
        }
        break;
    }

    setFormErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const hasUnsavedChanges = useMemo(() => {
    return (
      formState.firstName.trim() !== "" ||
      formState.lastName.trim() !== "" ||
      formState.email.trim() !== "" ||
      formState.confirmEmail.trim() !== ""
    );
  }, [formState]);

  const isFormValid = useMemo(() => {
    const hasAllFields =
      formState.firstName.trim() !== "" &&
      formState.lastName.trim() !== "" &&
      formState.email.trim() !== "" &&
      formState.confirmEmail.trim() !== "";

    const hasNoErrors =
      !formErrors.firstName &&
      !formErrors.lastName &&
      !formErrors.email &&
      !formErrors.confirmEmail;

    const emailsMatch =
      formState.email.trim().toLowerCase() ===
      formState.confirmEmail.trim().toLowerCase();

    const emailIsValid = validateEmail(formState.email);

    return hasAllFields && hasNoErrors && emailsMatch && emailIsValid;
  }, [formState, formErrors]);

  const resetForm = () => {
    setFormState({
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
    });
    setFormErrors({
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
    });
    setFormTouched({
      firstName: false,
      lastName: false,
      email: false,
      confirmEmail: false,
    });
    setFormFeedback(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    organizationId: string,
    onSuccess: () => void
  ) => {
    event.preventDefault();

    if (!organizationId) {
      setFormFeedback("Organization context is missing.");
      return;
    }

    setFormFeedback(null);
    setFormSubmitting(true);

    try {
      const response = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formState.firstName.trim(),
          lastName: formState.lastName.trim(),
          email: formState.email.trim().toLowerCase(),
          organizationId,
          roles: ["user"],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create member.");
      }

      resetForm();
      onSuccess();
    } catch (err) {
      console.error("Error creating member:", err);
      setFormFeedback(
        err instanceof Error ? err.message : "Unexpected error creating member."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  return {
    formState,
    setFormState,
    formErrors,
    setFormErrors,
    formTouched,
    setFormTouched,
    formFeedback,
    formSubmitting,
    hasUnsavedChanges,
    isFormValid,
    validateField,
    resetForm,
    handleSubmit,
  };
}

