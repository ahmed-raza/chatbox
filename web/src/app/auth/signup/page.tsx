"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthForm, validationRules } from '@/hooks/useAuthForm';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/auth/FormInput';
import PasswordConfirmInput from '@/components/auth/PasswordConfirmInput';
import AuthButton from '@/components/auth/AuthButton';
import AlertMessage from '@/components/auth/AlertMessage';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading } = useAuth();

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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationRules: {
      name: validationRules.name,
      email: validationRules.email,
      password: validationRules.password,
      confirmPassword: validationRules.required('Confirm password'),
    },
    onSubmit: async (values) => {
      // Additional validation for confirm password
      if (values.password !== values.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      const result = await signup(values.email, values.name, values.password);
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
      title="Create Account"
      subtitle="Join us today! Create your account to get started."
      footer={{
        text: "Already have an account?",
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
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          required
          {...getFieldProps('name')}
        />

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
          placeholder="Create a password"
          required
          {...getFieldProps('password')}
        />

        <PasswordConfirmInput
          label="Confirm Password"
          placeholder="Confirm your password"
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
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
