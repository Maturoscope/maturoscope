"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ResetPasswordForm({
  className,
  onEmailSent,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {
  onEmailSent: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("LOGIN");

  const handleEmailChange = useCallback((email: string) => {
    setEmail(email);
    setError("");
    setEmailError(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError(true);
      return;
    }

    setEmailError(false);
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error sending reset email");
        return;
      }

      onEmailSent(email);
      
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push("/login");
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -30, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "tween",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t("RESET_PASSWORD.TITLE")}</h1>
          <p className="text-balance text-sm text-muted-foreground">
            {t("RESET_PASSWORD.SUBTITLE")}
          </p>
        </div>



        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("RESET_PASSWORD.EMAIL_LABEL")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("RESET_PASSWORD.EMAIL_LABEL")}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              disabled={isLoading}
              className={emailError || error ? "border-red-500" : ""}
            />
            {emailError && (
              <p className="text-sm text-red-600">{t("ERRORS.INVALID_EMAIL")}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !email.trim() || !isValidEmail(email)}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t("RESET_PASSWORD.RESET_BUTTON")
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            {t("RESET_PASSWORD.GO_BACK_TO")}{" "}
            <button
              type="button"
              onClick={handleGoBack}
              className="text-black underline hover:no-underline cursor-pointer"
            >
              {t("BLOCKED_ACCOUNT.SIGN_IN")}
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
