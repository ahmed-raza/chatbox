"use client";

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthForm, validationRules } from '@/hooks/useAuthForm';
import FormInput from '@/components/auth/FormInput';
import PasswordConfirmInput from '@/components/auth/PasswordConfirmInput';
import AuthButton from '@/components/auth/AuthButton';
import AlertMessage from '@/components/auth/AlertMessage';

function ProfilePageContent() {
  const { user, changePassword } = useAuth();

  const {
    handleSubmit,
    getFieldProps,
    isSubmitting,
    submitMessage,
    setSubmitMessage,
    formState,
  } = useAuthForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationRules: {
      currentPassword: validationRules.required('Current password'),
      newPassword: validationRules.password,
      confirmPassword: validationRules.required('Confirm password'),
    },
    onSubmit: async (values) => {
      // Additional validation for confirm password
      if (values.newPassword !== values.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      return await changePassword(values.currentPassword, values.newPassword);
    },
  });

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>

        {/* User Information */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{user?.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="border-t pt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {submitMessage && (
              <AlertMessage
                type={submitMessage.type}
                message={submitMessage.text}
                onClose={() => setSubmitMessage(null)}
              />
            )}

            <FormInput
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              required
              {...getFieldProps('currentPassword')}
            />

            <FormInput
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              required
              {...getFieldProps('newPassword')}
            />

            <PasswordConfirmInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              required
              passwordValue={formState.newPassword?.value || ''}
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

            <div className="flex justify-end">
              <AuthButton
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating Password...' : 'Update Password'}
              </AuthButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
