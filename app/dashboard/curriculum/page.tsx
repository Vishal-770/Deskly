"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";
import { Category } from "@/types/electron/curriculum.types";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

/* -------------------- Small Helpers -------------------- */

const Divider = () => <div className="h-px w-full bg-border my-10" />;

const CategoryCard = ({ category }: { category: Category }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dashboard/curriculum/${category.code}`);
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{category.code}</h3>
          <p className="text-muted-foreground">{category.name}</p>
        </div>
        <Button onClick={handleViewDetails} size="sm">
          View Courses
        </Button>
      </div>
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Credits: </span>
          <span className="font-medium">{category.credits}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Max Credits: </span>
          <span className="font-medium">{category.maxCredits}</span>
        </div>
      </div>
    </div>
  );
};

/* -------------------- Page -------------------- */

const CurriculumPage = () => {
  const { authState, loading, getAuthTokens } = useAuth();

  const [curriculumData, setCurriculumData] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Fetch -------------------- */

  useEffect(() => {
    if (!authState) return;

    let cancelled = false;

    const loadCurriculum = async () => {
      try {
        const curriculumRes = await window.curriculum.get();

        if (cancelled) return;

        if (curriculumRes?.success && curriculumRes.data) {
          setCurriculumData(curriculumRes.data);
        } else {
          setError("Failed to load curriculum data");
        }
      } catch (e) {
        console.error(e);
        setError("Something went wrong while loading curriculum");
      }
    };

    loadCurriculum();

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
      <div className="h-full w-full flex items-center justify-center text-center">
        <div>
          <h2 className="text-lg font-semibold text-red-600">Access Denied</h2>
          <p className="text-muted-foreground">
            Please log in to view your curriculum.
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

  if (!curriculumData) {
    return <Loader />;
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="h-full w-full px-6 lg:px-10 py-6 space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Curriculum</h1>
        <p className="text-muted-foreground">
          Your academic curriculum categories and credit requirements.
        </p>
      </header>

      <Divider />

      {/* Categories */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {curriculumData.map((category, index) => (
            <CategoryCard key={index} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default CurriculumPage;
