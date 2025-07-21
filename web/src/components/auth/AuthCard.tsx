"use client";

import React from 'react';
import Link from 'next/link';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: {
    text: string;
    linkText: string;
    linkHref: string;
  };
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className = '',
}: AuthCardProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {footer.text}{' '}
                <Link 
                  href={footer.linkHref}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {footer.linkText}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthCard;
