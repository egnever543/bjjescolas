"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Payment = {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  description: string | null;
  student: {
    id: string;
    user: { name: string };
    branch: { name: string };
  };
};

type Student = {
  id: string;
  user: { name: string };
  branch: { name: string };
};

const addPaymentSchema = z.object({
  studentId: z.string().min(1, "Selecione um aluno"),
  amount: z.string().min(1, "Informe o valor"),
  dueDate: z.string().min(1, "Selecione uma data"),
  description: z.string().optional(),
});

type AddPaymentForm = z.infer<typeof addPaymentSchema>;

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

function AddPaymentDialog({
  students,
  onSuccess,
}: {
  students: Student[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddPaymentForm>({
    resolver: zodResolver(addPaymentSchema),
  });

  async function onSubmit(data: AddPaymentForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/pagamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: parseFloat(data.amount) }),
      });
      if (res.ok) {
        reset();
        setOpen(false);
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transition-colors z-40">
          <Plus className="w-6 h-6 text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-gray-300">Aluno</Label>
            <Select onValueChange={(v) => setValue("studentId", v)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-white">
                    {s.user.name} — {s.branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studentId && (
              <p className="text-red-400 text-xs">{errors.studentId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("amount")}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-400 text-xs">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">Data de Vencimento</Label>
            <Input
              type="date"
              {...register("dueDate")}
              className="bg-gray-800 border-gray-700 text-white"
            />
            {errors.dueDate && (
              <p className="text-red-400 text-xs">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">Descrição (opcional)</Label>
            <Input
              {...register("description")}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Ex: Mensalidade de julho"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Salvando..." : "Registrar Pagamento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FinanceiroPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<"" | "PENDING" | "PAID" | "OVERDUE">("");
  const [loading, setLoading] = useState(true);

  async function loadPayments() {
    setLoading(true);
    const url = filter ? `/api/pagamentos?status=${filter}` : "/api/pagamentos";
    const res = await fetch(url);
    if (res.ok) setPayments(await res.json());
    setLoading(false);
  }

  async function loadStudents() {
    const res = await fetch("/api/alunos");
    if (res.ok) setStudents(await res.json());
  }

  useEffect(() => {
    loadPayments();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadStudents();
  }, []);

  async function markAsPaid(paymentId: string) {
    await fetch(`/api/pagamentos/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID", paidAt: new Date().toISOString() }),
    });
    loadPayments();
  }

  const paid = payments.filter((p) => p.status === "PAID");
  const overdue = payments.filter((p) => p.status === "OVERDUE");
  const pending = payments.filter((p) => p.status === "PENDING");
  const totalReceiver = pending.reduce((sum, p) => sum + p.amount, 0) + overdue.reduce((sum, p) => sum + p.amount, 0);

  const now = new Date();
  const paidThisMonth = paid
    .filter((p) => {
      if (!p.paidAt) return false;
      const d = new Date(p.paidAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const tabs = [
    { label: "Todos", value: "" as const },
    { label: "Pagos", value: "PAID" as const },
    { label: "Pendentes", value: "PENDING" as const },
    { label: "Atrasados", value: "OVERDUE" as const },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-black text-white">Financeiro</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-yellow-900/20 border-yellow-800/30">
          <CardContent className="p-4">
            <DollarSign className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-xl font-black text-white">
              R$ {totalReceiver.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">A receber</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-800/30">
          <CardContent className="p-4">
            <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-xl font-black text-white">
              R$ {paidThisMonth.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">Pagos este mês</p>
          </CardContent>
        </Card>
        <Card className="bg-red-900/20 border-red-800/30">
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-xl font-black text-white">{overdue.length}</p>
            <p className="text-xs text-gray-400">Inadimplentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments list */}
      {loading ? (
        <p className="text-gray-500 text-center py-8">Carregando...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhum pagamento encontrado</p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {p.student.user.name}
                </p>
                <p className="text-gray-500 text-xs">{p.student.branch.name}</p>
                {p.description && (
                  <p className="text-gray-400 text-xs mt-0.5">{p.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-0.5">
                  Venc.: {format(new Date(p.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-white font-bold text-sm">R$ {p.amount.toFixed(2)}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
                {(p.status === "PENDING" || p.status === "OVERDUE") && (
                  <button
                    onClick={() => markAsPaid(p.id)}
                    className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    Marcar pago
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPaymentDialog students={students} onSuccess={loadPayments} />
    </div>
  );
}
