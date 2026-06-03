"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  studentId: z.string().min(1, "Selecione um aluno"),
  amount: z.string().min(1, "Informe o valor"),
  dueDate: z.string().min(1, "Informe a data de vencimento"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Student {
  id: string;
  user: { name: string };
}

export function AddPaymentDialog({ students }: { students: Student[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/pagamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: data.studentId,
          amount: parseFloat(data.amount),
          dueDate: data.dueDate,
          description: data.description,
        }),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-gray-400">Aluno</Label>
              <Select onValueChange={(v) => setValue("studentId", v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-white focus:bg-gray-700">
                      {s.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId.message}</p>}
            </div>

            <div>
              <Label className="text-gray-400">Valor (R$)</Label>
              <Input
                {...register("amount")}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-gray-800 border-gray-700 text-white mt-1"
              />
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <Label className="text-gray-400">Vencimento</Label>
              <Input
                {...register("dueDate")}
                type="date"
                className="bg-gray-800 border-gray-700 text-white mt-1"
              />
              {errors.dueDate && <p className="text-red-400 text-xs mt-1">{errors.dueDate.message}</p>}
            </div>

            <div>
              <Label className="text-gray-400">Descrição (opcional)</Label>
              <Input
                {...register("description")}
                placeholder="Ex: Mensalidade Janeiro"
                className="bg-gray-800 border-gray-700 text-white mt-1"
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
    </>
  );
}
