"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award } from "lucide-react";
import { BELT_LABELS } from "@/types";
import type { Belt } from "@/types";

const schema = z.object({
  belt: z.string().min(1),
  degree: z.number().min(0).max(4),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const BELTS = Object.keys(BELT_LABELS) as Belt[];

export function AddGraduationDialog({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { belt: "AZUL", degree: 0 },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch("/api/graduacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, studentId }),
    });
    if (res.ok) {
      setOpen(false);
      reset();
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? "Erro ao registrar graduação");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Award className="w-4 h-4 mr-2" />
          Registrar Graduação
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Graduação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <Label className="text-gray-300">Faixa</Label>
            <Select defaultValue="AZUL" onValueChange={(v) => setValue("belt", v)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {BELTS.map((b) => (
                  <SelectItem key={b} value={b} className="text-white focus:bg-gray-700">
                    {BELT_LABELS[b]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Grau (0-4)</Label>
            <Input
              {...register("degree", { valueAsNumber: true })}
              type="number"
              min={0}
              max={4}
              className="bg-gray-800 border-gray-700 text-white mt-1"
            />
            {errors.degree && <p className="text-red-400 text-xs mt-1">{errors.degree.message}</p>}
          </div>
          <div>
            <Label className="text-gray-300">Observações</Label>
            <Input {...register("notes")} placeholder="Opcional..." className="bg-gray-800 border-gray-700 text-white mt-1" />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Salvando..." : "Registrar Graduação"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
