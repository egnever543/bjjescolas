"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Payment = {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Atrasado",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40",
  PAID: "bg-green-900/30 text-green-400 border border-green-700/40",
  OVERDUE: "bg-red-900/30 text-red-400 border border-red-700/40",
  CANCELLED: "bg-gray-900/30 text-gray-400 border border-gray-700/40",
};

export function StudentFinanceiroTab({
  studentId,
  payments: initialPayments,
}: {
  studentId: string;
  payments: Payment[];
}) {
  const [payments, setPayments] = useState(initialPayments);

  async function markAsPaid(paymentId: string) {
    const res = await fetch(`/api/pagamentos/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID", paidAt: new Date().toISOString() }),
    });
    if (res.ok) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, status: "PAID" as const, paidAt: new Date().toISOString() }
            : p
        )
      );
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
          Histórico Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">
            Nenhum pagamento registrado
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    R$ {p.amount.toFixed(2)}
                  </p>
                  {p.description && (
                    <p className="text-gray-400 text-xs">{p.description}</p>
                  )}
                  <p className="text-gray-500 text-xs">
                    Venc.: {format(new Date(p.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  {p.paidAt && (
                    <p className="text-green-400 text-xs">
                      Pago em: {format(new Date(p.paidAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}
                  >
                    {STATUS_LABELS[p.status]}
                  </span>
                  {(p.status === "PENDING" || p.status === "OVERDUE") && (
                    <button
                      onClick={() => markAsPaid(p.id)}
                      className="text-xs text-green-400 hover:text-green-300 transition-colors"
                    >
                      Marcar pago
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
