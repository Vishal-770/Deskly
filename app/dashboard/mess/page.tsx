"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  MessMenuResponse,
  MessMenuItem,
  MessType,
} from "../../../types/renderer/Mess.types";
import Loader from "@/components/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sunrise,
  UtensilsCrossed,
  Coffee,
  Moon,
  Croissant,
} from "lucide-react";
import { ErrorDisplay } from "@/components/error-display";

const messOptions: { value: MessType; label: string }[] = [
  { value: "Veg-mens", label: "Veg - Mens" },
  { value: "Non-Veg-mens", label: "Non-Veg - Mens" },
  { value: "Special-mens", label: "Special - Mens" },
  { value: "Veg-womens", label: "Veg - Womens" },
  { value: "Non-Veg-womens", label: "Non-Veg - Womens" },
  { value: "Special-womens", label: "Special - Womens" },
];

export default function MessPage() {
  const [selectedMess, setSelectedMess] = useState<MessType>("Veg-mens");
  const [menuData, setMenuData] = useState<MessMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const fetchMenu = useCallback(async (mess: MessType) => {
    setLoading(true);
    setError(null);
    try {
      const response: MessMenuResponse = await window.mess.getMenu(mess);
      if (response.success && response.data) {
        setMenuData(response.data);
      } else {
        setError(response.error || "Failed to fetch menu");
      }
    } catch (error) {
      setError("An error occurred while fetching the menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (settingsLoaded && selectedMess) {
      fetchMenu(selectedMess);
    }
  }, [settingsLoaded, selectedMess, fetchMenu]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const messType = await window.settings.getMessType();
        setSelectedMess(messType as MessType);
      } catch (error) {
        console.error("Failed to load mess settings:", error);
        setError("Failed to load settings");
      } finally {
        setSettingsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  const mealOrder = [
    { key: "Breakfast", label: "Breakfast", icon: Croissant },
    { key: "Lunch", label: "Lunch", icon: UtensilsCrossed },
    { key: "Snacks", label: "Snacks", icon: Coffee },
    { key: "Dinner", label: "Dinner", icon: Moon },
  ] as const;

  const parseFoodItems = (foodString: string): string[] => {
    if (foodString.includes("\n")) {
      return foodString
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    } else {
      return foodString
        .split(/\s*\+\s*/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((item) => {
          // Remove week indicators like (Weeks 1 & 3)
          return item.replace(/\s*\(Weeks \d+ & \d+\)\s*/, "").trim();
        })
        .filter((item) => item.length > 0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <div className="border-b border-border px-8 py-5 shrink-0 bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Mess Menu</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Weekly dining schedule
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xs">
              {settingsLoaded
                ? messOptions.find((m) => m.value === selectedMess)?.label
                : "Loading..."}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto">
        {loading && <Loader />}
        {error && (
          <div className="px-8 py-6">
            <ErrorDisplay
              title="Failed to Load Mess Menu"
              message={error}
              onRetry={() => fetchMenu(selectedMess)}
            />
          </div>
        )}
        {!loading && !error && menuData.length > 0 && (
          <div className="px-8 py-6">
            <Tabs defaultValue={menuData[0]?.Day} className="w-full">
              <TabsList className="grid w-full grid-cols-7 mb-6 border-0 bg-transparent h-auto p-0">
                {menuData.map((item) => (
                  <TabsTrigger
                    key={item.Day}
                    value={item.Day}
                    className="text-xs border-0 bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    {item.Day.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {menuData.map((item) => (
                <TabsContent
                  key={item.Day}
                  value={item.Day}
                  className="space-y-6"
                >
                  {/* Day Header */}
                  <div className="text-center pb-4">
                    <h2 className="text-lg font-bold text-primary uppercase tracking-widest">
                      {item.Day}
                    </h2>
                  </div>

                  {/* Meals List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {mealOrder.map(({ key, label, icon: Icon }) => {
                      const foodItems = parseFoodItems(
                        String(item[key as keyof MessMenuItem] || ""),
                      );

                      return (
                        <div key={key} className="space-y-4">
                          <div className="flex items-center gap-3 pb-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                              {label}
                            </h3>
                          </div>
                          <div className="space-y-3 pl-8">
                            {foodItems.length > 0 ? (
                              foodItems.map((foodItem, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="text-sm text-muted-foreground leading-relaxed"
                                >
                                  {foodItem}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-muted-foreground italic">
                                No items available
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
