"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/useAuth";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactDetail } from "@/types/renderer/contactInfo.types";

const ContactPage = () => {
  const { authState, loading } = useAuth();
  const [contactData, setContactData] = useState<ContactDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContactInfo = async () => {
    if (!authState) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.contactInfo.get();
      console.log("Contact Info API result:", result);

      if (result.success) {
        setContactData(result.data || []);
      } else {
        setError(result.error || "Failed to fetch contact info");
      }
    } catch (err) {
      console.error("Error fetching contact info:", err);
      setError("An error occurred while fetching contact info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authState) {
      fetchContactInfo();
    }
  }, [authState]);

  if (loading) {
    return <Loader />;
  }

  if (!authState) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Please log in to view contact information.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Contact Information</h1>
        <p className="text-muted-foreground">
          View your contact details from VTOP.
        </p>
      </div>

      <div className="mb-4">
        <Button
          onClick={fetchContactInfo}
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? "Loading..." : "Refresh Contact Info"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 border border-red-200 rounded-md bg-red-50">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {contactData && contactData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contactData.map((contact, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{contact.department}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.description && (
                  <p className="text-sm text-muted-foreground">
                    {contact.description}
                  </p>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Email:</span>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {contactData && contactData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No contact information found.</p>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
