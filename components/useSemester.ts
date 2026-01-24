import { useState, useEffect } from "react";
import { Semester } from "@/types/electron/Semster.types";

export const useSemester = () => {
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(false);

  // Get the current semester on mount
  useEffect(() => {
    const fetchSemester = async () => {
      setLoading(true);
      try {
        const semester = await window.auth.getSemester();
        setCurrentSemester(semester);
      } catch (error) {
        console.error("Failed to fetch semester:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSemester();
  }, []);

  const setSemester = async (semester: Semester): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await window.auth.setSemester(semester);
      if (success) {
        setCurrentSemester(semester);
      }
      return success;
    } catch (error) {
      console.error("Failed to set semester:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearSemester = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await window.auth.clearSemester();
      if (success) {
        setCurrentSemester(null);
      }
      return success;
    } catch (error) {
      console.error("Failed to clear semester:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getSemester = async (): Promise<Semester | null> => {
    try {
      const semester = await window.auth.getSemester();
      setCurrentSemester(semester);
      return semester;
    } catch (error) {
      console.error("Failed to get semester:", error);
      return null;
    }
  };

  return {
    currentSemester,
    loading,
    setSemester,
    clearSemester,
    getSemester,
  };
};
