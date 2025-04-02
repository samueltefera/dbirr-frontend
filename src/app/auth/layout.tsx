// app/auth/layout.tsx
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      {/* Add background similar to video if desired */}
      {children}
    </div>
  );
}