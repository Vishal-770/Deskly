import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  BookOpen,
  GraduationCap,
  Settings,
  BarChart3,
  User,
} from "lucide-react";
import { useAuth } from "./useAuth";

const DashboardSidebar = () => {
  const { getAuthTokens } = useAuth();
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserImage = async () => {
      const tokens = await getAuthTokens();
      if (tokens) {
        const imageRes = await window.content.image();
        if (imageRes.success && imageRes.image) {
          setUserImage(`data:${imageRes.contentType};base64,${imageRes.image}`);
        }
      }
    };
    fetchUserImage();
  }, [getAuthTokens]);
  return (
    <div className="fixed left-0 top-8 w-16 h-full bg-card/98 backdrop-blur-sm text-card-foreground py-4 border-r border-border/50 overflow-y-auto shadow-lg flex flex-col items-center">
      {/* Logo */}
      <div className="mb-6 p-2 rounded-lg hover:bg-muted transition-all duration-200 cursor-pointer group relative">
        <BarChart3 className="w-6 h-6 text-primary" />
        <div className="absolute left-full ml-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <span className="text-sm font-medium">Deskly</span>
        </div>
      </div>

      {/* Navigation Icons */}
      <nav className="space-y-2 flex-1">
        <Link
          href="/dashboard"
          className="relative p-3 rounded-lg bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20 flex items-center justify-center group"
        >
          <Home className="w-5 h-5" />
          <div className="absolute left-full ml-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <span className="text-sm font-medium">Dashboard</span>
          </div>
        </Link>
        <Link
          href="/dashboard/courses"
          className="relative p-3 rounded-lg hover:bg-muted transition-all duration-200 flex items-center justify-center group"
        >
          <BookOpen className="w-5 h-5" />
          <div className="absolute left-full ml-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <span className="text-sm font-medium">Courses</span>
          </div>
        </Link>
        <Link
          href="/dashboard/grades"
          className="relative p-3 rounded-lg hover:bg-muted transition-all duration-200 flex items-center justify-center group"
        >
          <GraduationCap className="w-5 h-5" />
          <div className="absolute left-full ml-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <span className="text-sm font-medium">Grades</span>
          </div>
        </Link>
        <Link
          href="/dashboard/settings"
          className="relative p-3 rounded-lg hover:bg-muted transition-all duration-200 flex items-center justify-center group"
        >
          <Settings className="w-5 h-5" />
          <div className="absolute left-full ml-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-events-none whitespace-nowrap z-50">
            <span className="text-sm font-medium">Settings</span>
          </div>
        </Link>
      </nav>

      {/* User Profile Icon at Bottom */}
      <div className="mt-auto relative group">
        <div className="p-2 rounded-lg hover:bg-muted transition-all duration-200 cursor-pointer">
          {userImage ? (
            <img
              src={userImage}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>
        <div className="absolute left-full ml-2 bottom-0 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="text-sm font-medium">Student</div>
          <div className="text-xs text-muted-foreground">
            student@university.edu
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
