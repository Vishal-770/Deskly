"use client";

import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {


  return (
    <div className="flex flex-col min-h-screen h-full w-full bg-background text-foreground transition-colors duration-300 ">
      {/* Main Content Area */}

      {/* Right Content (Login) */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-background ">
        <LoginForm />
      </div>
    </div>
  );
}
