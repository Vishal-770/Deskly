"use client";

import React, { useState } from "react";
import { LaundaryEntry } from "@/types/electron/Laundary.types";
import { useAuth } from "@/components/useAuth";
import Loader from "@/components/Loader";
import { Calendar, Home, WashingMachine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const BLOCKS = ["A", "B", "CB", "CG", "D1", "D2", "E"];

const LaundryPage: React.FC = () => {
  const { authState, loading } = useAuth();
  const [laundaryData, setLaundaryData] = useState<LaundaryEntry[] | null>(
    null,
  );
  const [laundaryLoading, setLaundaryLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string>("");

  const fetchLaundary = async (block: string) => {
    setLaundaryLoading(true);
    setLaundaryData(null);
    try {
      const result = await window.laundary.getSchedule(block);
      if (result.success) {
        setLaundaryData(result.data || []);
      } else {
        alert(result.error);
      }
    } catch {
      alert("Failed to fetch laundry schedule");
    } finally {
      setLaundaryLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!authState) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Please log in to view laundry schedules
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background px-10 py-8">
      <div className="mb-8 flex items-center gap-3">
        <WashingMachine className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Laundry Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Desktop overview of laundry slots per block
          </p>
        </div>
      </div>

      <div className="grid h-[calc(100%-5rem)] grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Blocks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {BLOCKS.map((block) => (
              <Button
                key={block}
                variant={selectedBlock === block ? "default" : "outline"}
                className={cn(
                  "w-full justify-start gap-2",
                  selectedBlock === block && "shadow",
                )}
                disabled={laundaryLoading}
                onClick={() => {
                  setSelectedBlock(block);
                  fetchLaundary(block);
                }}
              >
                <Home className="h-4 w-4" /> Block {block}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedBlock ? `Block ${selectedBlock} Schedule` : "Schedule"}
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 h-[calc(100%-4rem)]">
            {laundaryLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader />
              </div>
            ) : laundaryData ? (
              laundaryData.length ? (
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-2">
                    {laundaryData.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border px-4 py-3 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Day {entry.date}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {entry.roomNumber || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No schedule available
                </div>
              )
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select a block from the left panel
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaundryPage;
