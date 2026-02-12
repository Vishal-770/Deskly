"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/Loader";
import {
  Receipt as ReceiptIcon,
  Calendar,
  DollarSign,
  Hash,
} from "lucide-react";
import type { Receipt } from "@/lib/electron-utils/parsers/PaymentRecipts.parser";

const PaymentReceiptsPage = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const result = await window.paymentReceipts.fetch();
        if (result.success && result.data) {
          setReceipts(result.data);
        } else {
          setError(result.error || "Failed to fetch payment receipts");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // Convert DD-MMM-YYYY to a more readable format
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-semibold text-red-600">
            Error loading payment receipts
          </h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }



  return (
    <div className="h-full w-full px-6 lg:px-10 py-6 space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <ReceiptIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Payment Receipts</h1>
            <p className="text-muted-foreground">
              View your payment history and receipts
            </p>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
     

      {/* Receipts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment receipts found
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.map((receipt, index) => (
                <div
                  key={receipt.receiptId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <Hash className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Receipt #{receipt.receiptNumber}
                        </span>
                        <Badge variant="secondary">{receipt.campusCode}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(receipt.date)} • Application:{" "}
                        {receipt.applNo}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Reg. No: {receipt.regNo} • ID: {receipt.receiptId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(receipt.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReceiptsPage;
