"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthForm, validationRules } from '@/hooks/useAuthForm';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/auth/FormInput';
import AuthButton from '@/components/auth/AuthButton';
import AlertMessage from '@/components/auth/AlertMessage';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

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
      password: '',
    },
    validationRules: {
      email: validationRules.email,
      password: (value: string) => {
        if (!value) return 'Password is required';
        return '';
      },
    },
    onSubmit: async (values) => {
      const result = await login(values.email, values.password);
      if (result.success) {
        router.push('/chat');
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

  return (
    <AuthCard
      title="Sign In"
      subtitle="Welcome back! Please sign in to your account."
      footer={{
        text: "Don't have an account?",
        linkText: "Sign up",
        linkHref: "/auth/signup"
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

        <FormInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
          {...getFieldProps('password')}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <AuthButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
