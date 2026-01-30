"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/useAuth";
import { ImportantProfileData } from "@/lib/electron/parseProfileInfo";
import Loader from "@/components/Loader";
import {
  Mail,
  Phone,
  Building2,
  BookOpen,
  Users,
  Home,
  Award,
  Code2,
} from "lucide-react";

/* -------------------- Info Display Component -------------------- */

const InfoField = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 mt-1 text-muted-foreground">{Icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-foreground font-semibold truncate">{value || "-"}</p>
    </div>
  </div>
);

/* -------------------- Card Component -------------------- */

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border/20">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6">
      {title}
    </h3>
    <div className="space-y-5">{children}</div>
  </div>
);

/* -------------------- Main Page Component -------------------- */

const ProfilePage = () => {
  const { authState, loading, getAuthTokens } = useAuth();

  const [userImage, setUserImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ImportantProfileData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Fetch -------------------- */

  useEffect(() => {
    if (!authState) return;

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const tokens = await getAuthTokens();
        if (!tokens || cancelled) return;

        // Try to get actual data
        try {
          if (typeof window !== "undefined" && window.profile) {
            const profileRes = await window.profile.get(
              tokens.cookies,
              tokens.authorizedID,
              tokens.csrf,
            );

            if (profileRes?.success && profileRes.data) {
              setProfileData(profileRes.data);
            } else {
              setError("Failed to load profile data");
            }
          } else {
            setError("Profile service not available");
          }
        } catch {
          setError("Failed to load profile data");
        }

        // Try to get user image
        try {
          if (typeof window !== "undefined" && window.content) {
            const imageRes = await window.content.image();
            if (imageRes?.success && imageRes.image) {
              setUserImage(
                `data:${imageRes.contentType};base64,${imageRes.image}`,
              );
            }
          }
        } catch {
          // Use default image
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load profile data");
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authState]);

  /* -------------------- States -------------------- */

  if (loading) {
    return <Loader />;
  }

  if (!authState) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-destructive">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return <Loader />;
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-end">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profileData.student.photoUrl || userImage ? (
                <Image
                  src={profileData.student.photoUrl || userImage!}
                  alt={profileData.student.name}
                  width={160}
                  height={160}
                  className="rounded-2xl border-2 border-primary/20 object-cover shadow-xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                  {profileData.student.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="flex-1 pb-2 space-y-3">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  {profileData.student.name}
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  {profileData.student.registerNumber}
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Award size={18} />
                <span>{profileData.student.program}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-8">
        {/* Primary Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard title="Contact Information">
            <InfoField
              icon={<Mail size={18} />}
              label="VIT Email"
              value={profileData.student.vitEmail}
            />
            <InfoField
              icon={<Phone size={18} />}
              label="Mobile"
              value={profileData.student.mobile}
            />
            <InfoField
              icon={<Mail size={18} />}
              label="Personal Email"
              value={profileData.student.personalEmail}
            />
          </InfoCard>

          <InfoCard title="Academic Details">
            <InfoField
              icon={<BookOpen size={18} />}
              label="Application Number"
              value={profileData.student.applicationNumber}
            />
            <InfoField
              icon={<Building2 size={18} />}
              label="School"
              value={profileData.proctor.school}
            />
            <InfoField
              icon={<Code2 size={18} />}
              label="Program & Branch"
              value={profileData.student.program}
            />
          </InfoCard>

          <InfoCard title="Personal Info">
            <InfoField
              icon={<Users size={18} />}
              label="Date of Birth"
              value={profileData.student.dob}
            />
            <InfoField
              icon={<Award size={18} />}
              label="Gender"
              value={profileData.student.gender}
            />
          </InfoCard>
        </div>

        {/* Proctor Section */}
        <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border/20">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-8">
            Faculty Advisor
          </h2>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Proctor Image */}
            {profileData.proctor.photoUrl && (
              <div className="flex-shrink-0">
                <Image
                  src={profileData.proctor.photoUrl || "/placeholder.svg"}
                  alt={profileData.proctor.name}
                  width={140}
                  height={140}
                  className="rounded-xl border border-border/30 object-cover shadow-md"
                />
              </div>
            )}

            {/* Proctor Info Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoField
                icon={<Award size={18} />}
                label="Faculty ID"
                value={profileData.proctor.facultyId}
              />
              <InfoField
                icon={<Users size={18} />}
                label="Name"
                value={profileData.proctor.name}
              />
              <InfoField
                icon={<Mail size={18} />}
                label="Email"
                value={profileData.proctor.email}
              />
              <InfoField
                icon={<Phone size={18} />}
                label="Mobile"
                value={profileData.proctor.mobile}
              />
              <InfoField
                icon={<Building2 size={18} />}
                label="Cabin"
                value={profileData.proctor.cabin}
              />
            </div>
          </div>
        </div>

        {/* Hostel Section */}
        <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border/20">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-8">
            Hostel Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Home size={18} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Block
                </span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {profileData.hostel.blockName || "-"}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Home size={18} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Room
                </span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {profileData.hostel.roomNumber || "-"}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Mess
                </span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {profileData.hostel.messType || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
