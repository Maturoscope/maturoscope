"use client";

import React, { FormEvent, useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { encryptPassword } from '@/app/utils/crypto';

interface InvitationData {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumberOrSpecial: boolean;
}

function CompleteRegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation('COMPLETE_REGISTRATION');

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordsMatchError, setPasswordsMatchError] = useState(false);

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  // Password validation
  const passwordValidation = useMemo<PasswordValidation>(() => {
    return {
      minLength: password.length >= 10,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumberOrSpecial: /[0-9#?!&]/.test(password),
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return passwordValidation.minLength && 
           passwordValidation.hasUppercase &&
           passwordValidation.hasLowercase &&
           passwordValidation.hasNumberOrSpecial;
  }, [passwordValidation]);

  const passwordsMatch = useMemo(() => {
    return password === confirmPassword && confirmPassword.length > 0;
  }, [password, confirmPassword]);

  const isFormValid = useMemo(() => {
    return isPasswordValid && passwordsMatch;
  }, [isPasswordValid, passwordsMatch]);

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token) {
        setError(t('ERRORS.INVALID_TOKEN'));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-invitation?token=${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || t('ERRORS.EXPIRED_INVITATION'));
          setLoading(false);
          return;
        }

        setInvitation(data as InvitationData);
      } catch (err) {
        console.error('Error verifying invitation:', err);
        setError(t('ERRORS.VERIFY_ERROR'));
      } finally {
        setLoading(false);
      }
    };

    verifyInvitation();
  }, [token, t]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!invitation || !token) {
      setError(t('ERRORS.INVALID_INVITATION'));
      return;
    }

    if (!isFormValid) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const encryptedPassword = await encryptPassword(password, invitation.email);

      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password: encryptedPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t('ERRORS.REGISTRATION_FAILED'));
        return;
      }

      setSuccessMessage(t('SUCCESS.MESSAGE'));

      setTimeout(() => {
        router.replace('/dashboard/overview');
      }, 2000);
    } catch (err) {
      console.error('Error completing registration:', err);
      setError(t('ERRORS.UNEXPECTED_ERROR'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      setPasswordsMatchError(true);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (passwordsMatchError) {
      setPasswordsMatchError(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{t('LOADING.TITLE')}</h1>
        <p className="text-muted-foreground">{t('LOADING.MESSAGE')}</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center">
        <h1 className="text-3xl font-semibold text-foreground">{t('INVALID.TITLE')}</h1>
        <p className="text-red-600 text-base">{t('INVALID.MESSAGE')}</p>
        <Button 
          onClick={() => router.push('/login')}
          className="w-full bg-foreground text-background hover:bg-foreground/90"
        >
          {t('INVALID.BUTTON')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">{t('PAGE.TITLE')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('PAGE.SUBTITLE')}
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t('PAGE.PASSWORD_LABEL')}</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('PAGE.PASSWORD_PLACEHOLDER')}
            disabled={submitting}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground">{t('PASSWORD_REQUIREMENTS.TITLE')}</p>
          
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={passwordValidation.minLength} 
              className="data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <span className="text-sm text-foreground">{t('PASSWORD_REQUIREMENTS.MIN_LENGTH')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              checked={passwordValidation.hasUppercase} 
              className="data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <span className="text-sm text-foreground">{t('PASSWORD_REQUIREMENTS.ONE_UPPERCASE')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              checked={passwordValidation.hasLowercase} 
              className="data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <span className="text-sm text-foreground">{t('PASSWORD_REQUIREMENTS.ONE_LOWERCASE')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              checked={passwordValidation.hasNumberOrSpecial} 
              className="data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <span className="text-sm text-foreground">{t('PASSWORD_REQUIREMENTS.ONE_NUMBER_OR_SPECIAL')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor="confirmPassword">{t('PAGE.CONFIRM_PASSWORD_LABEL')}</Label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(event) => handleConfirmPasswordChange(event.target.value)}
            onBlur={handleConfirmPasswordBlur}
            placeholder={t('PAGE.CONFIRM_PASSWORD_PLACEHOLDER')}
            disabled={submitting}
            className={passwordsMatchError && !passwordsMatch ? "border-red-500" : ""}
          />
          {passwordsMatchError && !passwordsMatch && (
            <p className="text-sm text-red-600">{t('ERRORS.PASSWORDS_DONT_MATCH')}</p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={!isFormValid || submitting}
          className="w-full mt-6"
        >
          {submitting ? t('PAGE.SUBMITTING') : t('PAGE.SUBMIT_BUTTON')}
        </Button>
      </form>
    </div>
  );
}

function LoadingFallback() {
  const { t } = useTranslation('COMPLETE_REGISTRATION');
  
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('LOADING.TITLE')}</h1>
      <p className="text-muted-foreground">{t('LOADING.MESSAGE')}</p>
    </div>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompleteRegistrationForm />
    </Suspense>
  );
}

