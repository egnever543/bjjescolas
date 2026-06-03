"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function MarkPaidButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleMarkPaid() {
    setLoading(true);
    try {
      await fetch(`/api/pagamentos/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID", paidAt: new Date().toISOString() }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleMarkPaid}
      disabled={loading}
      className="border-green-700 text-green-400 hover:bg-green-900/20 h-7 px-2 text-xs"
    >
      <CheckCircle className="w-3 h-3 mr-1" />
      {loading ? "..." : "Pago"}
    </Button>
  );
}
