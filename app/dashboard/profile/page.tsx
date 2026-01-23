"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/useAuth";
import { ParsedStudentData } from "@/lib/electron/parseProfileInfo";

/* -------------------- Small Helpers -------------------- */

const Divider = () => <div className="h-px w-full bg-border my-10" />;

const InfoItem = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between gap-6 border-b py-2 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value || "-"}</span>
  </div>
);

/* -------------------- Page -------------------- */

const ProfilePage = () => {
  const { authState, loading, getAuthTokens } = useAuth();

  const [userImage, setUserImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ParsedStudentData | null>(
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

        const [imageRes, profileRes] = await Promise.all([
          window.content.image(),
          window.profile.get(tokens.cookies, tokens.authorizedID, tokens.csrf),
        ]);

        if (cancelled) return;

        if (imageRes?.success && imageRes.image) {
          setUserImage(`data:${imageRes.contentType};base64,${imageRes.image}`);
        }

        if (profileRes?.success && profileRes.data) {
          setProfileData(profileRes.data);
        } else {
          setError("Failed to load profile data");
        }
      } catch (e) {
        console.error(e);
        setError("Something went wrong while loading profile");
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authState]);

  /* -------------------- States -------------------- */

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
          <span className="text-muted-foreground">Loading authentication…</span>
        </div>
      </div>
    );
  }

  if (!authState) {
    return (
      <div className="h-full w-full flex items-center justify-center text-center">
        <div>
          <h2 className="text-lg font-semibold text-red-600">Access Denied</h2>
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
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
          <span className="text-muted-foreground">Fetching profile data…</span>
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="h-full w-full px-6 lg:px-10 py-6 space-y-14">
      {/* ================= HEADER ================= */}
      <section className="flex flex-col lg:flex-row lg:items-center gap-8">
        {/* Image */}
        <div className="flex justify-center lg:justify-start">
          {profileData.header.studentImage || userImage ? (
            <Image
              src={profileData.header.studentImage || userImage!}
              alt="Profile"
              width={140}
              height={140}
              className="rounded-full border-4 border-primary/30 object-cover"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold">
              {profileData.header.studentName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="flex-1 text-center lg:text-left space-y-3">
          <h1 className="text-3xl font-bold">
            {profileData.header.studentName}
          </h1>
          <p className="text-lg text-muted-foreground">
            {profileData.header.registerNumber}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4">
            <InfoItem label="VIT Email" value={profileData.header.vitEmail} />
            <InfoItem
              label="Program & Branch"
              value={profileData.header.programBranch}
            />
            <InfoItem label="School" value={profileData.header.schoolName} />
          </div>
        </div>
      </section>

      <Divider />

      {/* ================= PERSONAL ================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <InfoItem
            label="Application Number"
            value={profileData.personal.applicationNumber}
          />
          <InfoItem label="Date of Birth" value={profileData.personal.dob} />
          <InfoItem label="Gender" value={profileData.personal.gender} />
          <InfoItem
            label="Blood Group"
            value={profileData.personal.bloodGroup}
          />
          <InfoItem
            label="Mobile Number"
            value={profileData.personal.mobileNumber}
          />
          <InfoItem
            label="Nationality"
            value={profileData.personal.nationality}
          />
        </div>

        {Object.keys(profileData.personal.details).length > 0 && (
          <div className="pt-4 space-y-2">
            <h3 className="font-semibold text-primary">Additional Details</h3>
            {Object.entries(profileData.personal.details).map(
              ([key, value]) => (
                <InfoItem
                  key={key}
                  label={key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  value={value}
                />
              ),
            )}
          </div>
        )}
      </section>

      <Divider />

      {/* ================= EDUCATION ================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Educational Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <InfoItem
            label="Applied Degree"
            value={profileData.education.appliedDegree}
          />
          <InfoItem
            label="School Name"
            value={profileData.education.schoolName}
          />
          <InfoItem
            label="Board / University"
            value={profileData.education.board}
          />
          <InfoItem
            label="Year of Passing"
            value={profileData.education.yearOfPassing}
          />
        </div>

        {Object.keys(profileData.education.details).length > 0 && (
          <div className="pt-4 space-y-2">
            <h3 className="font-semibold text-primary">Additional Details</h3>
            {Object.entries(profileData.education.details).map(
              ([key, value]) => (
                <InfoItem
                  key={key}
                  label={key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  value={value}
                />
              ),
            )}
          </div>
        )}
      </section>

      <Divider />

      {/* ================= FAMILY ================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Family Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <InfoItem label="Father Name" value={profileData.family.fatherName} />
          <InfoItem
            label="Father Mobile"
            value={profileData.family.fatherMobile}
          />
          <InfoItem label="Mother Name" value={profileData.family.motherName} />
          <InfoItem
            label="Mother Mobile"
            value={profileData.family.motherMobile}
          />
        </div>

        {Object.keys(profileData.family.details).length > 0 && (
          <div className="pt-4 space-y-2">
            <h3 className="font-semibold text-primary">Additional Details</h3>
            {Object.entries(profileData.family.details).map(([key, value]) => (
              <InfoItem
                key={key}
                label={key
                  .replace(/father_details_/g, "")
                  .replace(/mother_details_/g, "")
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                value={value}
              />
            ))}
          </div>
        )}
      </section>

      <Divider />

      {/* ================= PROCTOR ================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Proctor Information</h2>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {profileData.proctor.facultyImage && (
            <Image
              src={profileData.proctor.facultyImage}
              alt="Proctor"
              width={110}
              height={110}
              className="rounded-full border-4 border-primary/20 object-cover"
            />
          )}

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <InfoItem
              label="Faculty ID"
              value={profileData.proctor.facultyId}
            />
            <InfoItem
              label="Faculty Name"
              value={profileData.proctor.facultyName}
            />
            <InfoItem
              label="Faculty Email"
              value={profileData.proctor.facultyEmail}
            />
            <InfoItem
              label="Faculty Mobile"
              value={profileData.proctor.facultyMobile}
            />
            <InfoItem label="Cabin" value={profileData.proctor.cabin} />
          </div>
        </div>
      </section>

      <Divider />

      {/* ================= HOSTEL ================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Hostel Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10">
          <InfoItem label="Block Name" value={profileData.hostel.blockName} />
          <InfoItem label="Room Number" value={profileData.hostel.roomNo} />
          <InfoItem
            label="Mess Information"
            value={profileData.hostel.messInfo}
          />
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
