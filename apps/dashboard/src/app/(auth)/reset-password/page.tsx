"use client";

import React from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import CheckInbox from "./CheckInbox";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const router = useRouter();

  const handleEmailSent = (email: string) => {
    setSentEmail(email);
    setEmailSent(true);
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  const handleEditEmail = () => {
    setEmailSent(false);
    setSentEmail("");
  };

  if (emailSent) {
    return (
      <CheckInbox 
        email={sentEmail}
        onBackToLogin={handleBackToLogin}
        onEditEmail={handleEditEmail}
      />
    );
  }

  return <ResetPasswordForm onEmailSent={handleEmailSent} />
}
