import { useState, useMemo, FormEvent } from "react";
import { useTranslation } from "react-i18next";

interface FormState {
  name: string;
  email: string;
  confirmEmail: string;
}

interface FormErrors {
  name: string;
  email: string;
  confirmEmail: string;
}

interface FormTouched {
  name: boolean;
  email: boolean;
  confirmEmail: boolean;
}

export function useNewOrganizationForm() {
  const { t } = useTranslation("ORGANIZATIONS");
  
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    confirmEmail: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    email: "",
    confirmEmail: "",
  });

  const [formTouched, setFormTouched] = useState<FormTouched>({
    name: false,
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
      case "name":
        if (!value.trim()) {
          error = t("NEW_ORGANIZATION.ERRORS.FIELD_REQUIRED");
        }
        break;
      case "email":
        if (!value.trim()) {
          error = t("NEW_ORGANIZATION.ERRORS.FIELD_REQUIRED");
        } else if (!validateEmail(value)) {
          error = t("NEW_ORGANIZATION.ERRORS.INVALID_EMAIL");
        }
        break;
      case "confirmEmail":
        if (!value.trim()) {
          error = t("NEW_ORGANIZATION.ERRORS.FIELD_REQUIRED");
        } else if (
          value.trim().toLowerCase() !== formState.email.trim().toLowerCase()
        ) {
          error = t("NEW_ORGANIZATION.ERRORS.EMAILS_DONT_MATCH");
        }
        break;
    }

    setFormErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const hasUnsavedChanges = useMemo(() => {
    return (
      formState.name.trim() !== "" ||
      formState.email.trim() !== "" ||
      formState.confirmEmail.trim() !== ""
    );
  }, [formState]);

  const isFormValid = useMemo(() => {
    const hasAllFields =
      formState.name.trim() !== "" &&
      formState.email.trim() !== "" &&
      formState.confirmEmail.trim() !== "";

    const hasNoErrors =
      !formErrors.name &&
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
      name: "",
      email: "",
      confirmEmail: "",
    });
    setFormErrors({
      name: "",
      email: "",
      confirmEmail: "",
    });
    setFormTouched({
      name: false,
      email: false,
      confirmEmail: false,
    });
    setFormFeedback(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    onSuccess: (organizationName: string) => void
  ) => {
    event.preventDefault();

    setFormFeedback(null);
    setFormSubmitting(true);

    try {
      const response = await fetch("/api/organizations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("NEW_ORGANIZATION.ERRORS.CREATE_FAILED"));
      }

      resetForm();
      onSuccess(formState.name.trim());
    } catch (err) {
      console.error("Error creating organization:", err);
      setFormFeedback(
        err instanceof Error ? err.message : t("NEW_ORGANIZATION.ERRORS.UNEXPECTED_ERROR")
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

