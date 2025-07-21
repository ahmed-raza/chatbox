"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthForm, validationRules } from '@/hooks/useAuthForm';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/auth/FormInput';
import PasswordConfirmInput from '@/components/auth/PasswordConfirmInput';
import AuthButton from '@/components/auth/AuthButton';
import AlertMessage from '@/components/auth/AlertMessage';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isAuthenticated, isLoading } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  // Get token from URL params
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    setToken(tokenParam);
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, isLoading, router]);

  const {
    handleSubmit,
    getFieldProps,
    isSubmitting,
    submitMessage,
    setSubmitMessage,
    formState,
  } = useAuthForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationRules: {
      password: validationRules.password,
      confirmPassword: validationRules.required('Confirm password'),
    },
    onSubmit: async (values) => {
      if (!token) {
        return { success: false, message: 'Invalid reset token' };
      }

      // Additional validation for confirm password
      if (values.password !== values.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      const result = await resetPassword(token, values.password);
      if (result.success) {
        // Redirect to login after successful reset
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
      return result;
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Show error if no token
  if (!token) {
    return (
      <AuthCard
        title="Invalid Reset Link"
        subtitle="The password reset link is invalid or has expired."
        footer={{
          text: "Need a new reset link?",
          linkText: "Request new link",
          linkHref: "/auth/forgot-password"
        }}
      >
        <div className="text-center">
          <AlertMessage
            type="error"
            message="This password reset link is invalid or has expired. Please request a new one."
          />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your new password below."
      footer={{
        text: "Remember your password?",
        linkText: "Sign in",
        linkHref: "/auth/login"
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitMessage && (
          <AlertMessage
            type={submitMessage.type}
            message={submitMessage.text}
            onClose={() => setSubmitMessage(null)}
          />
        )}

        <FormInput
          label="New Password"
          type="password"
          placeholder="Enter your new password"
          required
          {...getFieldProps('password')}
        />

        <PasswordConfirmInput
          label="Confirm New Password"
          placeholder="Confirm your new password"
          required
          passwordValue={formState.password?.value || ''}
          {...getFieldProps('confirmPassword')}
        />

        <div className="text-xs text-gray-600">
          <p>Password requirements:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>At least 8 characters long</li>
            <li>Contains at least one letter</li>
            <li>Contains at least one number</li>
          </ul>
        </div>

        <AuthButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
