"use client";

import React, { useEffect, useState } from 'react';
import FormInput from './FormInput';

interface PasswordConfirmInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  hasError?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  passwordValue: string; // The password to match against
}

export function PasswordConfirmInput({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hasError,
  required = false,
  disabled = false,
  className = '',
  passwordValue,
}: PasswordConfirmInputProps) {
  const [localError, setLocalError] = useState('');
  const [touched, setTouched] = useState(false);

  // Validate password confirmation
  useEffect(() => {
    if (touched && value && passwordValue && value !== passwordValue) {
      setLocalError('Passwords do not match');
    } else if (touched && !value && required) {
      setLocalError('Please confirm your password');
    } else {
      setLocalError('');
    }
  }, [value, passwordValue, touched, required]);

  const handleBlur = () => {
    setTouched(true);
    if (onBlur) {
      onBlur();
    }
  };

  const displayError = error || localError;
  const displayHasError = hasError || !!localError;

  return (
    <FormInput
      label={label}
      type="password"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={handleBlur}
      error={displayError}
      hasError={displayHasError}
      required={required}
      disabled={disabled}
      className={className}
    />
  );
}

export default PasswordConfirmInput;
