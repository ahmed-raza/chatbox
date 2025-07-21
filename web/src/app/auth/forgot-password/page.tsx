"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthForm, validationRules } from '@/hooks/useAuthForm';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/auth/FormInput';
import AuthButton from '@/components/auth/AuthButton';
import AlertMessage from '@/components/auth/AlertMessage';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, isAuthenticated, isLoading } = useAuth();

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
  } = useAuthForm({
    initialValues: {
      email: '',
    },
    validationRules: {
      email: validationRules.email,
    },
    onSubmit: async (values) => {
      return await forgotPassword(values.email);
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

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
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
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          required
          {...getFieldProps('email')}
        />

        <AuthButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
        </AuthButton>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            We'll send a password reset link to your email address if an account exists.
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
