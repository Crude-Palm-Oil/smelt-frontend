"use client";

import { LoginForm } from "@/components/auth/loginform";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <LoginForm />
    </div>
  );
}