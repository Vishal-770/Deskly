"use client";

import ShowLoginStatus from "@/components/ShowLoginStatus";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "@/components/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { authState, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState && authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState, router]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex flex-col min-h-screen h-full w-full bg-background text-foreground transition-colors duration-300 ">
      {/* Main Content Area */}

      <ShowLoginStatus />
      {/* Right Content (Login) */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-background ">
        <LoginForm />
      </div>
    </div>
  );
}
