"use client";

import React, { FormEvent, useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordInput } from '@/components/ui/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { encryptPassword } from '@/app/utils/crypto';

interface InvitationData {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId: string;
}

const passwordRequirement = 'Password must be at least 8 characters long';

function CompleteRegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token) {
        setError('Invitation token is missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-invitation?token=${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Invitation is invalid or expired.');
          setLoading(false);
          return;
        }

        setInvitation(data as InvitationData);
      } catch (err) {
        console.error('Error verifying invitation:', err);
        setError('Unable to verify invitation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    verifyInvitation();
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!invitation || !token) {
      setError('Invitation is no longer valid.');
      return;
    }

    if (password.length < 8) {
      setError(passwordRequirement);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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
        setError(data.message || 'Failed to complete registration.');
        return;
      }

      setSuccessMessage('Registration completed. Redirecting to dashboard...');

      setTimeout(() => {
        router.replace('/dashboard/overview');
      }, 2000);
    } catch (err) {
      console.error('Error completing registration:', err);
      setError('Unexpected error completing registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Completing registration...</h1>
        <p className="text-muted-foreground">We are verifying your invitation token.</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Invitation not valid</h1>
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push('/login')}>
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">Create your password</h1>
        {invitation && (
          <p className="text-sm text-muted-foreground">
            {invitation.firstName ? `Welcome, ${invitation.firstName}!` : 'Welcome!'} Complete your registration to access Maturoscope.
          </p>
        )}
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input value={invitation?.email || ''} disabled readOnly />
        </div>

        <div className="flex flex-col gap-2">
          <Label>New password</Label>
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter a secure password"
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground">{passwordRequirement}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Confirm password</Label>
          <PasswordInput
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
            disabled={submitting}
          />
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

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Complete registration'}
        </Button>
      </form>
    </div>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we verify your invitation.</p>
        </div>
      }
    >
      <CompleteRegistrationForm />
    </Suspense>
  );
}

