"use client";
import React from "react";
import ShowLoginStatus from "@/components/ShowLoginStatus";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/components/useAuth";
import { useRouter } from "next/navigation";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { authState, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  } else if (!authState) {
    router.push("/");
  }
  return (
    <div className="bg-background min-h-screen">
      <ShowLoginStatus />
      <DashboardSidebar />
      {/* Main Content */}
      <div className="ml-16 pt-8 p-6 space-y-8">{children}</div>
    </div>
  );
};

export default DashboardLayout;
