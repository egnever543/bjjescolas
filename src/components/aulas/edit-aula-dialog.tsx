"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Pencil } from "lucide-react";
import { MODALITY_LABELS, DAY_FULL_LABELS } from "@/types";
import type { Modality, DayOfWeek } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  modality: z.string().min(1),
  dayOfWeek: z.string().min(1),
  startTime: z.string().min(1, "Horário de início obrigatório"),
  endTime: z.string().min(1, "Horário de término obrigatório"),
  branchId: z.string().min(1, "Filial obrigatória"),
  professorId: z.string().min(1, "Professor obrigatório"),
  maxStudents: z.number().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface Branch { id: string; name: string }
interface Professor { id: string; user: { name: string }; branchId: string }

interface Aula {
  id: string;
  name: string;
  modality: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxStudents: number | null;
  branchId: string;
  professorId: string;
  professor: { id: string; user: { name: string }; branchId: string };
  branch: { id: string; name: string };
}

interface Props {
  aula: Aula;
  branches: Branch[];
  professors: Professor[];
  onSuccess: (updated: Aula) => void;
}

const DAYS: DayOfWeek[] = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
const MODALITIES = Object.keys(MODALITY_LABELS) as Modality[];

export function EditAulaDialog({ aula, branches, professors, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(aula.branchId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: aula.name,
      modality: aula.modality,
      dayOfWeek: aula.dayOfWeek,
      startTime: aula.startTime,
      endTime: aula.endTime,
      branchId: aula.branchId,
      professorId: aula.professorId,
      maxStudents: aula.maxStudents,
    },
  });

  const branchProfessors = professors.filter((p) => p.branchId === selectedBranch);

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch(`/api/aulas/${aula.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      onSuccess(updated);
      setOpen(false);
    } else {
      const body = await res.json();
      setError(body.error ?? "Erro ao atualizar aula");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Editar aula"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Aula</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <Label className="text-gray-300">Nome *</Label>
            <Input {...register("name")} className="bg-gray-800 border-gray-700 text-white mt-1" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label className="text-gray-300">Filial *</Label>
            <Select
              defaultValue={aula.branchId}
              onValueChange={(v) => {
                setValue("branchId", v);
                setSelectedBranch(v);
                setValue("professorId", "");
              }}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                <SelectValue placeholder="Selecione a filial" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-white focus:bg-gray-700">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Professor *</Label>
            <Select defaultValue={aula.professorId} onValueChange={(v) => setValue("professorId", v)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                <SelectValue placeholder="Selecione o professor" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {branchProfessors.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-white focus:bg-gray-700">
                    {p.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.professorId && <p className="text-red-400 text-xs mt-1">{errors.professorId.message}</p>}
          </div>
          <div>
            <Label className="text-gray-300">Modalidade</Label>
            <Select defaultValue={aula.modality} onValueChange={(v) => setValue("modality", v)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {MODALITIES.map((m) => (
                  <SelectItem key={m} value={m} className="text-white focus:bg-gray-700">
                    {MODALITY_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Dia da Semana</Label>
            <Select defaultValue={aula.dayOfWeek} onValueChange={(v) => setValue("dayOfWeek", v)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {DAYS.map((d) => (
                  <SelectItem key={d} value={d} className="text-white focus:bg-gray-700">
                    {DAY_FULL_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Início *</Label>
              <Input {...register("startTime")} type="time" className="bg-gray-800 border-gray-700 text-white mt-1" />
              {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime.message}</p>}
            </div>
            <div>
              <Label className="text-gray-300">Término *</Label>
              <Input {...register("endTime")} type="time" className="bg-gray-800 border-gray-700 text-white mt-1" />
              {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime.message}</p>}
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Máximo de Alunos</Label>
            <Input {...register("maxStudents", { valueAsNumber: true })} type="number" min={1} className="bg-gray-800 border-gray-700 text-white mt-1" />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
