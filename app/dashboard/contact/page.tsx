"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/components/useAuth";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Check, Copy, Mail, Search, X } from "lucide-react";
import { ContactDetail } from "@/types/renderer/contactInfo.types";

const ContactPage = () => {
  const { authState, loading } = useAuth();
  const [contactData, setContactData] = useState<ContactDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchContactInfo = useCallback(async () => {
    if (!authState) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.contactInfo.get();
      // console.log("Contact Info API result:", result);

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
  }, [authState]);

  useEffect(() => {
    if (authState) {
      fetchContactInfo();
    }
  }, [authState, fetchContactInfo]);

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contactData;

    const query = searchQuery.toLowerCase();
    return contactData.filter(
      (contact) =>
        contact.department.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.description?.toLowerCase().includes(query),
    );
  }, [contactData, searchQuery]);

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Section */}
      <div className="border-b border-border px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-2">
            Contact Directory
          </h1>
          <p className="text-base text-muted-foreground">
            Find the right department and get in touch
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="border-b border-border px-8 py-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by department, email, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-muted-foreground">
              Found {filteredContacts.length} result
              {filteredContacts.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-8 py-10">
        <div className="max-w-6xl mx-auto w-full">
          {error && (
            <div className="mb-8 p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950 rounded">
              <p className="text-red-600 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Loading contact information...
              </p>
            </div>
          )}

          {!isLoading && filteredContacts.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {filteredContacts.map((contact, index) => (
                <div
                  key={index}
                  className="group border border-border rounded-lg p-6 transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {contact.department}
                      </h2>
                      {contact.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {contact.description}
                        </p>
                      )}
                    </div>

                    {contact.email && (
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-primary hover:underline font-medium transition-colors text-sm"
                          >
                            {contact.email}
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(contact.email)}
                          className="h-8 px-3 text-xs gap-1"
                        >
                          {copiedEmail === contact.email ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoading && searchQuery ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">
                No contacts found matching &quot;{searchQuery}&quot;
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium">
                  No contact information available
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
