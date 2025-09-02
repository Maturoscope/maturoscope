"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { encryptPassword } from "@/app/utils/crypto";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function LoginForm({
  className,
  setBlockedAccount,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & { setBlockedAccount: (blocked: boolean) => void }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [errorEmail, setErrorEmail] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("LOGIN");

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);



  const handleRememberMeChange = useCallback(
    (checked: boolean) => {
      if (checked && formData.email && isValidEmail(formData.email)) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else if (!checked) {
        localStorage.removeItem("rememberedEmail");
      }
      setFormData((prev) => ({ ...prev, rememberMe: checked }));
    },
    [formData.email]
  );

  const handleEmailChange = useCallback(
    (email: string) => {
      setFormData((prev) => ({ ...prev, email }));
      setError("");
      setErrorEmail(false);

      if (formData.rememberMe && email && isValidEmail(email)) {
        localStorage.setItem("rememberedEmail", email);
      }
    },
    [formData.rememberMe]
  );

  const handleEmailBlur = useCallback(() => {
    if (formData.email.trim() && !isValidEmail(formData.email)) {
      setErrorEmail(true);
    }
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      setErrorEmail(true);
      return;
    }

    setErrorEmail(false);
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (formData.rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    try {
      const encryptedPassword = await encryptPassword(formData.password, formData.email);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: encryptedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 423) {
          setBlockedAccount(true);
        }
        setError(t("PAGE.INVALID_CREDENTIALS"));
        return;
      }

      setSuccess(t("PAGE.LOGIN_SUCCESS"));
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Connection error: ${err.message}`);
      } else {
        setError("Connection error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold">{t("PAGE.TITLE")}</h1>
          <p className="text-balance text-sm text-muted-foreground">
            {t("PAGE.SUBTITLE")}
          </p>
        </div>

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("PAGE.EMAIL_LABEL")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("PAGE.EMAIL_LABEL")}
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              required
              disabled={isLoading}
              className={errorEmail || error ? "border-red-500" : ""}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">{t("PAGE.PASSWORD_LABEL")}</Label>
              <a
                href="/reset-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                {t("PAGE.FORGOT_PASSWORD")}
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t("PAGE.PASSWORD_LABEL")}
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                setError("");
              }}
              required
              disabled={isLoading}
              className={error ? "border-red-500" : ""}
            />
          </div>

          {errorEmail && <p className="text-sm text-red-600 mt-[-15px]">{t("ERRORS.INVALID_EMAIL")}</p>}
          {error && <p className="text-sm text-red-600 mt-[-15px]">{error}</p>}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => handleRememberMeChange(!!checked)}
            />
            <Label htmlFor="rememberMe" className="text-sm">
              {t("PAGE.REMEMBER_ME")}
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              !formData.email.trim() ||
              !formData.password.trim() ||
              !isValidEmail(formData.email)
            }
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : t("PAGE.LOGIN_BUTTON")}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
