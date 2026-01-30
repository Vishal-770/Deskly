"use client";
import React, { useState, useEffect } from "react";
import {
  MessMenuResponse,
  MessMenuItem,
  MessType,
} from "../../../types/renderer/Mess.types";
import Loader from "@/components/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

  const fetchMenu = async (mess: MessType) => {
    setLoading(true);
    setError(null);
    try {
      const response: MessMenuResponse = await window.mess.getMenu(mess);
      if (response.success && response.data) {
        setMenuData(response.data);
      } else {
        setError(response.error || "Failed to fetch menu");
      }
    } catch (err) {
      setError("An error occurred while fetching the menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu(selectedMess);
  }, [selectedMess]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mess Menu</h1>
        <Select
          value={selectedMess}
          onValueChange={(value) => setSelectedMess(value as MessType)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Mess" />
          </SelectTrigger>
          <SelectContent>
            {messOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <Loader />}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && menuData.length > 0 && (
        <div className="grid gap-4">
          {menuData.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">{item.Day}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-600">Breakfast</h3>
                  <p className="text-sm whitespace-pre-line">
                    {item.Breakfast}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-600">Lunch</h3>
                  <p className="text-sm whitespace-pre-line">{item.Lunch}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-600">Snacks</h3>
                  <p className="text-sm whitespace-pre-line">{item.Snacks}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-600">Dinner</h3>
                  <p className="text-sm whitespace-pre-line">{item.Dinner}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
