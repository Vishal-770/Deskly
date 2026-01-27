"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Settings,
  User,
  Calendar,
  CheckCircle,
  Award,
  FileText,
  Phone,
  CalendarDays,
  Search,
  Home,
} from "lucide-react";
import Fuse from "fuse.js";
import { useAuth } from "./useAuth";

const DashboardSidebar = () => {
  const { getAuthTokens } = useAuth();
  const [userImage, setUserImage] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  type NavItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
  const inputRef = useRef<HTMLInputElement | null>(null);

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
  // Define nav items for both rendering and search
  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <Home className="w-5 h-5" />,
      },
      {
        label: "Courses",
        href: "/dashboard/courses",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        label: "Timetable",
        href: "/dashboard/timetable",
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        label: "Academic Calendar",
        href: "/dashboard/academic-calendar",
        icon: <CalendarDays className="w-5 h-5" />,
      },
      {
        label: "Grades",
        href: "/dashboard/grades",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        label: "Attendance",
        href: "/dashboard/attendance",
        icon: <CheckCircle className="w-5 h-5" />,
      },
      {
        label: "Marks",
        href: "/dashboard/marks",
        icon: <Award className="w-5 h-5" />,
      },
      {
        label: "Curriculum",
        href: "/dashboard/curriculum",
        icon: <FileText className="w-5 h-5" />,
      },
      {
        label: "Contact",
        href: "/dashboard/contact",
        icon: <Phone className="w-5 h-5" />,
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: <Settings className="w-5 h-5" />,
      },
      {
        label: "Profile",
        href: "/dashboard/profile",
        icon: <User className="w-5 h-5" />,
      },
    ],
    [],
  );

  // derive results from `query` (useMemo avoids setState in effects)
  const results = useMemo<NavItem[] | null>(() => {
    if (!query) return null;

    const options: Fuse.IFuseOptions<NavItem> = {
      keys: ["label"],
      includeMatches: true,
      threshold: 0.4,
    };

    try {
      const fuse = new Fuse<NavItem>(navItems, options);
      const fuseResults = fuse.search(query);
      const mapped = fuseResults.map((r) => r.item);
      const substrMatches = navItems.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()),
      );
      const combined = [
        ...mapped,
        ...substrMatches.filter((s) => !mapped.includes(s)),
      ];
      return combined.length ? combined : [];
    } catch {
      const q = query.toLowerCase();
      const matches = navItems.filter((i) => i.label.toLowerCase().includes(q));
      return matches.length ? matches : [];
    }
  }, [query, navItems]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const handleNavigate = (href: string) => {
    closeSearch();
    router.push(href);
  };

  return (
    <>
      <div
        className={`fixed left-0 top-8 w-16 h-full bg-card/98 backdrop-blur-sm text-card-foreground py-4 border-r border-border/50 overflow-y-auto hide-scrollbar shadow-lg flex flex-col items-center transition-all duration-300`}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className={`mb-6 p-2 rounded-lg hover:bg-muted transition-all duration-200 cursor-pointer group relative ${pathname === "/dashboard" ? "bg-primary/10 text-primary border-l-4 border-primary" : ""}`}
        >
          <Image
            src="/app-logo.png"
            alt="Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <div className="absolute left-full ml-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <span className="text-sm font-medium">Deskly</span>
          </div>
        </Link>

        {/* Navigation / Search */}
        <nav className="space-y-2 flex-1 w-full flex flex-col items-center">
          {/* Search button (top) */}
          <button
            onClick={() =>
              setSearchOpen((s) => {
                const next = !s;
                if (!next) setQuery("");
                return next;
              })
            }
            className={`mb-4 p-3 rounded-lg transition-all duration-200 hover:bg-muted flex items-center justify-center group w-11 ${searchOpen ? "bg-primary/10 text-primary" : ""}`}
            aria-label="Open Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Render nav items as small icons (sidebar stays compact). */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative p-3 rounded-lg transition-all duration-200 hover:bg-muted flex items-center justify-center group ${pathname === item.href ? "bg-primary/10 text-primary border-l-4 border-primary" : ""}`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </span>
              <div className="absolute left-full ml-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* User Profile Icon at Bottom */}
        {!searchOpen && (
          <Link href="/dashboard/profile" className="mt-auto relative group">
            <div className="p-2 rounded-lg hover:bg-muted transition-all duration-200 cursor-pointer">
              {userImage ? (
                <Image
                  src={userImage}
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="absolute left-full ml-2 bottom-0 px-3 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              <div className="text-sm font-medium">Profile</div>
              <div className="text-xs text-muted-foreground">
                Click to view profile
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Search overlay (centered) */}
      {searchOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-28">
          <div className="fixed inset-0 bg-black/40" onClick={closeSearch} />
          <div className="relative z-50 w-[min(640px,96%)] bg-card rounded-lg shadow-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none px-2 py-2 text-foreground"
                placeholder="Search pages..."
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                  if (e.key === "Enter" && results && results.length === 1)
                    handleNavigate(results[0].href);
                }}
              />
              <button
                onClick={closeSearch}
                className="px-3 py-1 text-sm text-muted-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-3 max-h-60 overflow-auto">
              {query ? (
                results && results.length ? (
                  <ul className="space-y-1">
                    {results.map((r) => (
                      <li key={r.href}>
                        <button
                          onClick={() => handleNavigate(r.href)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-muted flex items-center gap-3"
                        >
                          <span className="w-6 h-6 flex items-center justify-center">
                            {r.icon}
                          </span>
                          <span className="text-sm">{r.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No results
                  </div>
                )
              ) : (
                <div className="text-sm text-muted-foreground">
                  Type to search pages
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
