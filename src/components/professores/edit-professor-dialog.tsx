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
import { BELT_LABELS } from "@/types";
import type { Belt } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  belt: z.string().optional(),
  degree: z.number().optional(),
  bio: z.string().optional(),
  branchId: z.string().min(1, "Filial obrigatória"),
});

type FormData = z.infer<typeof schema>;

interface Branch {
  id: string;
  name: string;
}

interface Professor {
  id: string;
  belt: string;
  degree: number;
  bio: string | null;
  branchId: string;
  modalities: string[];
  user: { name: string; email: string };
  branch: { id: string; name: string };
}

interface Props {
  professor: Professor;
  branches: Branch[];
  onSuccess: (updated: Professor) => void;
}

const belts = Object.keys(BELT_LABELS) as Belt[];

export function EditProfessorDialog({ professor, branches, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: professor.user.name,
      email: professor.user.email,
      belt: professor.belt,
      degree: professor.degree,
      bio: professor.bio ?? "",
      branchId: professor.branchId,
    },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch(`/api/professores/${professor.id}`, {
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
      setError(body.error ?? "Erro ao atualizar professor");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Editar professor"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Professor</DialogTitle>
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
            <Label className="text-gray-300">Email *</Label>
            <Input {...register("email")} type="email" className="bg-gray-800 border-gray-700 text-white mt-1" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label className="text-gray-300">Filial *</Label>
            <Select defaultValue={professor.branchId} onValueChange={(v) => setValue("branchId", v)}>
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
            {errors.branchId && <p className="text-red-400 text-xs mt-1">{errors.branchId.message}</p>}
          </div>

          <div>
            <Label className="text-gray-300">Faixa</Label>
            <Select defaultValue={professor.belt} onValueChange={(v) => setValue("belt", v)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {belts.map((b) => (
                  <SelectItem key={b} value={b} className="text-white focus:bg-gray-700">
                    {BELT_LABELS[b]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Grau</Label>
            <Input
              {...register("degree", { valueAsNumber: true })}
              type="number"
              min={0}
              max={6}
              className="bg-gray-800 border-gray-700 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-gray-300">Bio</Label>
            <Input {...register("bio")} placeholder="Breve descrição..." className="bg-gray-800 border-gray-700 text-white mt-1" />
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
