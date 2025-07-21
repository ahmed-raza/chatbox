"use client";

import { useState } from 'react';

export interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

export interface AuthFormState {
  [key: string]: FormField;
}

export interface UseAuthFormProps {
  initialValues: { [key: string]: string };
  validationRules?: { [key: string]: (value: string) => string };
  onSubmit: (values: { [key: string]: string }) => Promise<{ success: boolean; message: string }>;
}

export function useAuthForm({ initialValues, validationRules = {}, onSubmit }: UseAuthFormProps) {
  // Initialize form state
  const [formState, setFormState] = useState<AuthFormState>(() => {
    const state: AuthFormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        error: '',
        touched: false,
      };
    });
    return state;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update field value
  const updateField = (name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: '', // Clear error when user types
      },
    }));

    // Clear submit message when user starts typing
    if (submitMessage) {
      setSubmitMessage(null);
    }
  };

  // Mark field as touched
  const touchField = (name: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
      },
    }));
  };

  // Validate field
  const validateField = (name: string, value: string): string => {
    if (validationRules[name]) {
      try {
        return validationRules[name](value);
      } catch (error) {
        // Handle cases where validation rule depends on other fields that might not be ready
        return '';
      }
    }
    return '';
  };

  // Validate all fields
  const validateForm = (): boolean => {
    let isValid = true;
    const newFormState = { ...formState };

    Object.keys(formState).forEach(name => {
      const error = validateField(name, formState[name].value);
      newFormState[name] = {
        ...newFormState[name],
        error,
        touched: true,
      };
      if (error) {
        isValid = false;
      }
    });

    setFormState(newFormState);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Extract values
      const values: { [key: string]: string } = {};
      Object.keys(formState).forEach(key => {
        values[key] = formState[key].value;
      });

      // Submit form
      const result = await onSubmit(values);

      if (result.success) {
        setSubmitMessage({ type: 'success', text: result.message });
        // Reset form on success
        const resetState: AuthFormState = {};
        Object.keys(initialValues).forEach(key => {
          resetState[key] = {
            value: initialValues[key],
            error: '',
            touched: false,
          };
        });
        setFormState(resetState);
      } else {
        setSubmitMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get field props for input components
  const getFieldProps = (name: string) => ({
    value: formState[name]?.value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField(name, e.target.value),
    onBlur: () => {
      touchField(name);
      const error = validateField(name, formState[name].value);
      setFormState(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          error,
          touched: true,
        },
      }));
    },
    error: formState[name]?.touched ? formState[name]?.error : '',
    hasError: formState[name]?.touched && !!formState[name]?.error,
  });

  // Check if form is valid
  const isFormValid = Object.values(formState).every(field => !field.error);

  // Check if form has been modified
  const isFormDirty = Object.keys(formState).some(key =>
    formState[key].value !== initialValues[key]
  );

  return {
    formState,
    isSubmitting,
    submitMessage,
    isFormValid,
    isFormDirty,
    updateField,
    touchField,
    validateField,
    validateForm,
    handleSubmit,
    getFieldProps,
    setSubmitMessage,
  };
}

// Common validation rules
export const validationRules = {
  email: (value: string): string => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  },

  password: (value: string): string => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Za-z]/.test(value)) return 'Password must contain at least one letter';
    if (!/\d/.test(value)) return 'Password must contain at least one number';
    return '';
  },

  name: (value: string): string => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters long';
    return '';
  },

  confirmPassword: (password: string) => (value: string): string => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return '';
  },

  required: (fieldName: string) => (value: string): string => {
    if (!value) return `${fieldName} is required`;
    return '';
  },
};
